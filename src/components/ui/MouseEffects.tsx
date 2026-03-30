"use client";

import { useEffect, useRef } from "react";

export default function MouseEffects() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch

    const spotlight = spotlightRef.current;
    let rafId: number | null = null;
    let mouseX = 0;
    let mouseY = 0;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(update);
    }

    function update() {
      rafId = null;

      // Spotlight
      if (spotlight) {
        spotlight.style.background = `radial-gradient(600px circle at ${mouseX}px ${mouseY + window.scrollY}px, rgba(236, 219, 191, 0.045), transparent 60%)`;
        spotlight.style.height = `${document.documentElement.scrollHeight}px`;
      }

      // Stat parallax
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const cx = (mouseX / window.innerWidth - 0.5) * 2;
          const cy = ((mouseY - rect.top) / rect.height - 0.5) * 2;
          el.style.transform = `translate(${-cx * 3}px, ${-cy * 2}px)`;
        }
      });

      // Heading shimmer
      document.querySelectorAll<HTMLElement>("[data-shimmer]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const progress = ((mouseX - rect.left) / rect.width) * 100;
          el.style.backgroundPosition = `${100 - progress}% 0`;
        }
      });
    }

    // Magnetic buttons — auto-discover by class OR data attribute
    function setupMagnetic() {
      document.querySelectorAll<HTMLElement>("[data-magnetic], .btn").forEach((btn) => {
        btn.addEventListener("mousemove", handleMagneticMove);
        btn.addEventListener("mouseleave", handleMagneticLeave);
      });
    }

    function handleMagneticMove(this: HTMLElement, e: MouseEvent) {
      const rect = this.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      this.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    function handleMagneticLeave(this: HTMLElement) {
      this.style.transform = "translate(0, 0)";
    }

    // Tilt cards
    function setupTilt() {
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
        card.addEventListener("mousemove", handleTiltMove);
        card.addEventListener("mouseleave", handleTiltLeave);
      });
    }

    function handleTiltMove(this: HTMLElement, e: MouseEvent) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      this.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
    }

    function handleTiltLeave(this: HTMLElement) {
      this.style.transform = "perspective(600px) rotateY(0) rotateX(0)";
    }

    document.addEventListener("mousemove", onMouseMove);
    setupMagnetic();
    setupTilt();

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
      document.querySelectorAll<HTMLElement>("[data-magnetic], .btn").forEach((btn) => {
        btn.removeEventListener("mousemove", handleMagneticMove);
        btn.removeEventListener("mouseleave", handleMagneticLeave);
      });
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
        card.removeEventListener("mousemove", handleTiltMove);
        card.removeEventListener("mouseleave", handleTiltLeave);
      });
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0,
        transition: "opacity 600ms ease",
      }}
      aria-hidden="true"
      className="mouse-spotlight"
    />
  );
}
