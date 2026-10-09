import {
  BufferAttribute,
  CanvasTexture,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

/*
 * Three.js terrain for the Season 1 hero, loaded on demand by TerrainField.
 * One summit rises out of eroded ridges; the camera circles it slowly, the way
 * the season comes back to the same climb every quarter. The sun travels with
 * the camera so the light stays side-on and the headline stays readable.
 */

export interface TerrainScene {
  /** Draw one frame at `t` seconds. */
  render(t: number): void;
  resize(): void;
  /** Point the camera towards a pointer at (x, y) in 0..1, or let it settle with null. */
  setPointer(point: { x: number; y: number } | null): void;
  /** Elevation in metres under the pointer on the last frame, or null over sky. */
  probe(): number | null;
  /** Lower the drawing-buffer resolution after slow frames. */
  degrade(): void;
  dispose(): void;
}

// Eroded fbm: octaves are damped where the land is already steep, which carves ridges.
const fract = (v: number) => v - Math.floor(v);
function hash(x: number, y: number) {
  const px = 50 * fract(x * 0.3183099 + 0.71), py = 50 * fract(y * 0.3183099 + 0.113);
  return -1 + 2 * fract(px * py * (px + py));
}
function ridges(x: number, y: number, octaves: number) {
  let a = 0, b = 1, dx = 0, dy = 0;
  for (let i = 0; i < octaves; i++) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const ha = hash(xi, yi), hb = hash(xi + 1, yi), hc = hash(xi, yi + 1), hd = hash(xi + 1, yi + 1);
    const k = ha - hb - hc + hd;
    dx += 6 * fx * (1 - fx) * (hb - ha + k * uy);
    dy += 6 * fy * (1 - fy) * (hc - ha + k * ux);
    a += (b * (ha + (hb - ha) * ux + (hc - ha) * uy + k * ux * uy)) / (1 + dx * dx + dy * dy);
    b *= 0.5;
    [x, y] = [1.6 * x + 1.2 * y, -1.2 * x + 1.6 * y];
  }
  return a;
}
function height(x: number, z: number) {
  const r2 = x * x + z * z;
  const summit = 8.5 * Math.exp(-r2 / 45) + 3.2 * Math.exp(-r2 / 160) * ridges(x * 0.24 + 4.1, z * 0.24 - 2.7, 7);
  return 2.6 * ridges(x * 0.11, z * 0.11, 7) + summit + 0.3 * ridges(x * 0.55 - 7.3, z * 0.55 + 1.9, 4);
}

const SIZE = 120;
const ORBIT = 32;
// World units to metres for the readout; the summit tops out near 2,000 m.
const metres = (h: number) => Math.max(0, Math.round((h + 1.5) * 165));

const srgb = (hex: string) => new Color(hex);
const PALETTE = {
  deep: srgb("#1d2620"),
  green: srgb("#2c3930"),
  light: srgb("#3f4f44"),
  beige: srgb("#a27b5d"),
  sand: srgb("#ecdbbf"),
  haze: srgb("#4d4a3c"),
};

function skyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "#141c17");
  gradient.addColorStop(0.32, "#2a332b");
  gradient.addColorStop(0.5, "#4d4a3c");
  gradient.addColorStop(1, "#4d4a3c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 256);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// Fill the heightfield in ~8 ms slices so building it never blocks input for long.
async function buildHeights(segments: number) {
  const row = segments + 1;
  const heights = new Float32Array(row * row);
  let slice = performance.now();
  for (let j = 0; j < row; j++) {
    const z = -SIZE / 2 + (SIZE * j) / segments;
    for (let i = 0; i < row; i++) heights[j * row + i] = height(-SIZE / 2 + (SIZE * i) / segments, z);
    if (performance.now() - slice > 8) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      slice = performance.now();
    }
  }
  return heights;
}

export async function createTerrainScene(canvas: HTMLCanvasElement, host: HTMLElement): Promise<TerrainScene> {
  const segments = host.clientWidth >= 1024 ? 288 : 208;
  const heights = await buildHeights(segments);
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "low-power" });
  const scene = new Scene();
  const sky = skyTexture();
  scene.background = sky;
  scene.fog = new Fog(PALETTE.haze, 18, 62);

  // Heightfield mesh. Heights are kept so the readout can sample them without raycasting triangles.
  const geometry = new PlaneGeometry(SIZE, SIZE, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position as BufferAttribute;
  for (let i = 0; i < position.count; i++) position.setY(i, heights[i]);
  geometry.computeVertexNormals();
  const normal = geometry.attributes.normal as BufferAttribute;
  const colors = new Float32Array(position.count * 3);
  const c = new Color();
  for (let i = 0; i < position.count; i++) {
    const h = heights[i], steep = 1 - normal.getY(i);
    c.copy(PALETTE.deep).lerp(PALETTE.green, smooth(-1.5, 0, h)).lerp(PALETTE.light, smooth(0, 2.5, h) * (1 - smooth(0.25, 0.6, steep)));
    c.lerp(PALETTE.beige, smooth(4, 8, h) * 0.75);
    c.lerp(PALETTE.sand, smooth(8.5, 10.5, h) * (1 - smooth(0.2, 0.5, steep)) * 0.6);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  const material = new MeshLambertMaterial({ vertexColors: true });
  scene.add(new Mesh(geometry, material));

  const sun = new DirectionalLight(PALETTE.sand, 2.6);
  scene.add(sun, sun.target);
  scene.add(new HemisphereLight(PALETTE.light, PALETTE.deep, 1.1));

  // Cursor ring on the ground, after the three.js terrain raycast example.
  const ringMaterial = new MeshBasicMaterial({ color: PALETTE.sand, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const ring = new Mesh(new RingGeometry(0.34, 0.44, 48), ringMaterial);
  scene.add(ring);

  const camera = new PerspectiveCamera(40, 1, 0.1, 140);
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const lean = { x: 0, y: 0, tx: 0, ty: 0, active: 0, target: 0 };
  let pointer: { x: number; y: number } | null = null;
  let probed: number | null = null;
  let quality = 1;
  let shift = 0;

  const sample = (x: number, z: number) => {
    const fx = ((x + SIZE / 2) / SIZE) * segments, fz = ((z + SIZE / 2) / SIZE) * segments;
    if (fx < 0 || fz < 0 || fx >= segments || fz >= segments) return null;
    const ix = Math.floor(fx), iz = Math.floor(fz), tx = fx - ix, tz = fz - iz, row = segments + 1;
    const a = heights[iz * row + ix], b = heights[iz * row + ix + 1];
    const d = heights[(iz + 1) * row + ix], e = heights[(iz + 1) * row + ix + 1];
    return (a + (b - a) * tx) * (1 - tz) + (d + (e - d) * tx) * tz;
  };

  const resize = () => {
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    const aspect = width / height;
    // Cap the drawing buffer near 1.4 MP so large and high-DPI screens stay cheap.
    const dpr = quality * Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1_400_000 / (width * height)));
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    // Portrait screens get a taller lens, capped before it turns fisheye.
    camera.fov = (2 * Math.atan(Math.min(0.62, Math.max(0.36, 0.42 / aspect))) * 180) / Math.PI;
    camera.aspect = aspect;
    // Lens shift: on wide screens the summit sits right of the headline, on phones above it.
    shift = aspect > 1.1 ? 0.42 : 0;
    camera.updateProjectionMatrix();
    camera.projectionMatrix.elements[8] = -shift;
    camera.projectionMatrix.elements[9] = -0.3 * Math.min(1, Math.max(0, (1.1 - aspect) / 0.5));
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  };

  const eye = new Vector3(), look = new Vector3(), toSun = new Vector3();
  const render = (t: number) => {
    lean.tx = pointer ? (pointer.x - 0.5) * 2 : 0;
    lean.ty = pointer ? (pointer.y - 0.5) * 2 : 0;
    lean.target = pointer ? 1 : 0;
    lean.x += (lean.tx - lean.x) * 0.05;
    lean.y += (lean.ty - lean.y) * 0.05;
    lean.active += (lean.target - lean.active) * 0.06;

    const angle = 0.6 + t * 0.014 + lean.x * 0.05;
    eye.set(Math.cos(angle) * ORBIT, 0, Math.sin(angle) * ORBIT);
    eye.y = Math.max(6.5, (sample(eye.x, eye.z) ?? 0) + 2.5) - lean.y * 0.4;
    camera.position.copy(eye);
    look.set(0, 4.2 - lean.y * 0.6, 0);
    camera.lookAt(look);
    // Keep the light low and from the camera's right, whatever side of the summit we are on.
    toSun.set(Math.cos(angle - 1.9), 0, Math.sin(angle - 1.9)).multiplyScalar(40);
    toSun.y = 9;
    sun.position.copy(toSun);
    camera.updateMatrixWorld();

    probed = null;
    if (pointer) {
      ndc.set(pointer.x * 2 - 1, 1 - pointer.y * 2);
      raycaster.setFromCamera(ndc, camera);
      const { origin, direction } = raycaster.ray;
      // March along the ray, then bisect the step that went below ground.
      const below = (s: number) => {
        const ground = sample(origin.x + direction.x * s, origin.z + direction.z * s);
        return ground === null ? null : origin.y + direction.y * s <= ground;
      };
      for (let s = 0.5, prev = 0.5; s < 90; prev = s, s += 0.08 + s * 0.015) {
        const hit = below(s);
        if (hit === null) break;
        if (hit) {
          let lo = prev, hi = s;
          for (let i = 0; i < 8; i++) {
            const mid = (lo + hi) / 2;
            if (below(mid)) hi = mid;
            else lo = mid;
          }
          const x = origin.x + direction.x * hi, z = origin.z + direction.z * hi;
          const ground = sample(x, z) ?? 0;
          probed = ground;
          ring.position.set(x, ground + 0.06, z);
          const e = 0.2;
          const nx = (sample(x - e, z) ?? ground) - (sample(x + e, z) ?? ground);
          const nz = (sample(x, z - e) ?? ground) - (sample(x, z + e) ?? ground);
          ring.lookAt(x + nx, ground + 0.06 + 2 * e, z + nz);
          break;
        }
      }
    }
    ringMaterial.opacity += ((probed === null ? 0 : 0.85 * lean.active) - ringMaterial.opacity) * 0.2;
    ring.visible = ringMaterial.opacity > 0.01;
    renderer.render(scene, camera);
  };

  resize();
  return {
    render,
    resize,
    setPointer(point) {
      pointer = point;
    },
    probe: () => (probed === null ? null : metres(probed)),
    degrade() {
      quality = 0.6;
      resize();
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      ring.geometry.dispose();
      ringMaterial.dispose();
      sky.dispose();
      renderer.dispose();
    },
  };
}

function smooth(edge0: number, edge1: number, v: number) {
  const t = Math.min(1, Math.max(0, (v - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
