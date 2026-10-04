"use client";

import { useEffect, useRef } from "react";

/*
 * Live topographic contour map for dark poster sections. One fragment shader
 * on raw WebGL (no library): an fbm heightfield drawn as contour lines, with
 * every fifth line heavier like an index contour on a survey map. The terrain
 * drifts slowly and rises under the pointer, where a readout shows the
 * "elevation". Reduced motion renders one still frame; without WebGL the
 * section's own background shows through.
 */

const VERTEX = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }";

const FRAGMENT = `#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uActive;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  return a + (b - a) * u.x + (c - a) * u.y + (a - b - c + d) * u.x * u.y; }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= .5; } return s; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; float asp = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * asp, uv.y) * 2.2 + vec2(uTime * .018, uTime * .007);
  float h = fbm(p);
  vec2 m = vec2(uMouse.x * asp, 1. - uMouse.y);
  float dm = distance(vec2(uv.x * asp, uv.y), m);
  h += uActive * .16 * exp(-dm * dm * 18.);
  float lv = h * 26.; float fw = fwidth(lv);
  float l = 1. - smoothstep(0., fw * 1.2, abs(fract(lv - .5) - .5));
  float major = step(mod(floor(lv + .5), 5.), .5);
  vec3 green = vec3(.173, .224, .188), sand = vec3(.925, .859, .749), violet = vec3(.694, .067, .835);
  float glow = exp(-dm * dm * 9.) * uActive;
  vec3 lineCol = mix(sand, mix(sand, violet, .55), glow);
  float a = l * mix(.16, .5, major) * (.55 + .45 * smoothstep(0., .9, uv.y)) + l * glow * .35;
  vec3 col = green + vec3(.06, .045, .03) * smoothstep(.3, .8, h);
  gl_FragColor = vec4(mix(col, lineCol, a), 1.);
}`;

// CPU twin of the shader's fbm, so the readout matches the lines under the pointer.
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number) {
  let s = 0, a = 0.5;
  for (let i = 0; i < 5; i++) {
    s += a * noise(x, y);
    x = x * 2.02 + 1.7;
    y = y * 2.02 + 9.2;
    a *= 0.5;
  }
  return s;
}

export default function ContourField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const elevationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl || !gl.getExtension("OES_standard_derivatives")) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const attr = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uActive = gl.getUniformLocation(program, "uActive");
    canvas.dataset.ready = "true";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const pointer = { x: 0.68, y: 0.4, tx: 0.68, ty: 0.4, target: 0, active: 0 };
    let visible = true;
    let raf = 0;
    const start = performance.now();

    const resize = () => {
      // Cap the drawing buffer near 1.6 MP so large and high-DPI screens stay cheap.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1_600_000 / Math.max(1, host.clientWidth * host.clientHeight)));
      canvas.width = Math.round(host.clientWidth * dpr);
      canvas.height = Math.round(host.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      pointer.active += (pointer.target - pointer.active) * 0.05;
      const t = reduced ? 0 : (now - start) / 1000;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, pointer.x, pointer.y);
      gl.uniform1f(uActive, pointer.active);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (elevationRef.current && pointer.target) {
        const aspect = canvas.width / canvas.height;
        const h = fbm(pointer.x * aspect * 2.2 + t * 0.018, (1 - pointer.y) * 2.2 + t * 0.007);
        elevationRef.current.textContent = `${Math.round(h * 1100)} m`;
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const resume = () => {
      if (!reduced && !lost && !raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.tx = (event.clientX - rect.left) / rect.width;
      pointer.ty = (event.clientY - rect.top) / rect.height;
      pointer.target = 1;
      const readout = readoutRef.current;
      if (readout) {
        readout.style.transform = `translate(${event.clientX - rect.left + 14}px, ${event.clientY - rect.top + 14}px)`;
        readout.dataset.on = "true";
      }
    };
    const onLeave = () => {
      pointer.target = 0;
      if (readoutRef.current) readoutRef.current.dataset.on = "false";
    };

    let lost = false;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
      canvas.dataset.ready = "false";
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    const onResize = () => {
      resize();
      if (reduced && !lost) draw(start);
    };

    resize();
    draw(start);
    observer.observe(host);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", resume);
    if (!reduced && finePointer) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
    }
    resume();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", resume);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="contour-field" aria-hidden="true" />
      <div ref={readoutRef} className="contour-field__readout" aria-hidden="true">
        <b ref={elevationRef}>0 m</b>
        <span>37.5665° N · 126.9780° E</span>
      </div>
    </>
  );
}
