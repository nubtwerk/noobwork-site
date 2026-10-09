"use client";

import { useEffect, useRef } from "react";
import type { TerrainScene } from "./terrain-scene";

/*
 * Season 1 hero terrain. The three.js scene lives in terrain-scene.ts and is
 * fetched only after the page is idle, so it never delays the headline. Until
 * it arrives, and on devices without WebGL, the section's own green background
 * shows. Reduced motion renders one still frame; the loop pauses off screen.
 */

function hasWebGL() {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function TerrainField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const elevationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host || !hasWebGL()) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let scene: TerrainScene | null = null;
    let cancelled = false;
    let visible = true;
    let raf = 0;
    let lost = false;
    let start = 0;
    let frames = 0, spent = 0, last = 0, degraded = false;

    const draw = (now: number) => {
      if (!scene || lost) return;
      scene.render(reduced ? 0 : (now - start) / 1000);
      const readout = readoutRef.current;
      if (readout?.dataset.pointer === "true") {
        const metres = scene.probe();
        readout.dataset.on = metres === null ? "false" : "true";
        if (metres !== null && elevationRef.current) elevationRef.current.textContent = `${metres} m`;
      }
      // Drop resolution once if the GPU cannot keep up.
      if (!reduced && !degraded && last) {
        frames += 1;
        spent += now - last;
        if (frames === 90) {
          if (spent / frames > 26) {
            degraded = true;
            scene.degrade();
          }
          frames = 0;
          spent = 0;
        }
      }
      last = now;
    };
    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) {
        last = 0;
        return;
      }
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const resume = () => {
      if (scene && !lost && !reduced && !raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      scene?.setPointer({ x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
      const readout = readoutRef.current;
      if (readout) {
        readout.dataset.pointer = "true";
        readout.style.transform = `translate(${event.clientX - rect.left + 14}px, ${event.clientY - rect.top + 14}px)`;
      }
    };
    const onLeave = () => {
      scene?.setPointer(null);
      const readout = readoutRef.current;
      if (readout) {
        readout.dataset.pointer = "false";
        readout.dataset.on = "false";
      }
    };
    const onResize = () => {
      scene?.resize();
      if (reduced) draw(start);
    };
    const onContextLost = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      lost = true;
      canvas.dataset.ready = "false";
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });

    const boot = async () => {
      try {
        const { createTerrainScene } = await import("./terrain-scene");
        if (cancelled) return;
        const built = await createTerrainScene(canvas, host);
        if (cancelled) {
          built.dispose();
          return;
        }
        scene = built;
      } catch {
        return;
      }
      start = performance.now();
      draw(start);
      canvas.dataset.ready = "true";
      observer.observe(host);
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", resume);
      canvas.addEventListener("webglcontextlost", onContextLost);
      if (!reduced && finePointer) {
        host.addEventListener("pointermove", onMove);
        host.addEventListener("pointerleave", onLeave);
      }
      resume();
    };
    // Wait for an idle moment so the scene never competes with the first paint.
    const idle = "requestIdleCallback" in window;
    const handle = idle ? window.requestIdleCallback(() => void boot(), { timeout: 1500 }) : window.setTimeout(() => void boot(), 300);

    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", resume);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      scene?.dispose();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="terrain-field" aria-hidden="true" />
      <div ref={readoutRef} className="contour-field__readout" aria-hidden="true">
        <b ref={elevationRef}>0 m</b>
        <span>37.5665° N · 126.9780° E</span>
      </div>
    </>
  );
}
