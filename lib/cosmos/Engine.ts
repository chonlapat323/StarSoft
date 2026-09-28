import * as THREE from "three";
import { getPointer, HOLD_THRESHOLD_MS, onRelease } from "../pointer";
import { CameraRig } from "./CameraRig";
import { emitCosmos } from "./events";
import { damp } from "./math";
import { ParticleField } from "./ParticleField";
import { ScrollDirector } from "./ScrollDirector";
import { ShapeLibrary } from "./ShapeLibrary";
import { shapeMotion, type ShapeContext, type ShapeMotion } from "./shapes";

export type CosmosOptions = {
  reducedMotion: boolean;
  signal: AbortSignal;
  onProgress: (progress: number) => void;
};

export type CosmosHandle = {
  start(): void;
  refresh(): void;
  warp(): void;
  setReducedMotion(reduced: boolean): void;
  dispose(): void;
};

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

function pickSide() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  if (coarse || small) return 128;
  if ((navigator.hardwareConcurrency ?? 8) <= 4) return 192;
  return 256;
}

export async function createCosmos(canvas: HTMLCanvasElement, opts: CosmosOptions): Promise<CosmosHandle> {
  const { onProgress, signal } = opts;
  let reduced = opts.reducedMotion;

  await document.fonts.ready;
  signal.throwIfAborted();
  onProgress(0.12);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const maxDpr = coarse ? 1.5 : 1.75;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(dpr);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setClearColor(0x04050a, 1);

  const ext = renderer.extensions;
  const dataType = ext.has("EXT_color_buffer_float")
    ? THREE.FloatType
    : ext.has("EXT_color_buffer_half_float")
      ? THREE.HalfFloatType
      : null;
  if (dataType === null || renderer.capabilities.maxVertexTextures === 0) {
    renderer.dispose();
    throw new Error("GPU particle simulation not supported");
  }
  onProgress(0.26);

  const rig = new CameraRig(canvas.clientWidth / canvas.clientHeight);
  rig.reducedMotion = reduced;
  const fontFamily = getComputedStyle(document.documentElement).getPropertyValue("--ff-display").trim() || "sans-serif";
  const shapeCtx = (): ShapeContext => ({ ...rig.halfExtents, fontFamily });
  const bounds = new THREE.Vector3();
  const updateBounds = () => {
    const { halfW, halfH } = rig.halfExtents;
    bounds.set(halfW * 1.08, halfH * 1.08, 4);
  };
  updateBounds();

  const side = pickSide();
  const shapes = new ShapeLibrary(side, shapeCtx());
  const director = new ScrollDirector();
  const keys = new Set(["drift", "sphere", "galaxy", "ring", "lattice", "helix", ...director.refresh()]);
  const bail = (field?: ParticleField) => {
    if (!signal.aborted) return;
    field?.dispose();
    shapes.dispose();
    renderer.dispose();
    signal.throwIfAborted();
  };
  let built = 0;
  for (const key of keys) {
    shapes.get(key);
    built++;
    onProgress(0.26 + (built / keys.size) * 0.44);
    await nextFrame();
    bail();
  }

  const field = new ParticleField(renderer, shapes.get("drift"), { side, dataType, bigBang: !reduced, bounds });
  const scene = new THREE.Scene();
  scene.add(field.points);
  const { sim, render } = field;
  sim.uMotion.value = reduced ? 0.35 : 1;
  onProgress(0.82);
  await nextFrame();
  bail(field);

  renderer.compile(scene, rig.camera);
  field.step();
  renderer.render(scene, rig.camera);
  onProgress(1);

  const size = new THREE.Vector2();
  const updateScale = () => {
    renderer.getDrawingBufferSize(size);
    render.uScale.value = size.y / 1000;
  };
  updateScale();

  const timer = new THREE.Timer();
  const motionA: ShapeMotion = { spinY: 0, spinZ: 0, sx: 1, sy: 1, sz: 1 };
  const motionB: ShapeMotion = { ...motionA };
  const pointerWorld = new THREE.Vector3(0, 0, 100);
  const pointerTarget = new THREE.Vector3();
  const pointerPrev = new THREE.Vector3();
  const pointerVel = new THREE.Vector3();
  const rawVel = new THREE.Vector3();
  const ray = new THREE.Vector3();
  let wasInside = false;
  let active = 0;
  let hold = 0;
  let wasHolding = false;
  let dominant = "";
  let running = false;
  let started = false;
  let frames = 0;
  let frameTime = 0;
  let resizeTimer = 0;

  const projectPointer = (nx: number, ny: number, out: THREE.Vector3) => {
    const cam = rig.camera;
    ray.set(nx, ny, 0.5).unproject(cam).sub(cam.position).normalize();
    const t = -cam.position.z / ray.z;
    return out.copy(cam.position).addScaledVector(ray, t);
  };

  const shock = (x: number, y: number, z: number, power: number) => {
    (sim.uShock.value as THREE.Vector4).set(x, y, z, 0);
    sim.uShockPower.value = power;
  };

  const unsubRelease = onRelease(({ heldMs, cancelled, onUi }) => {
    if (!started || cancelled || onUi) return;
    const p = sim.uPointer.value as THREE.Vector3;
    if (heldMs < HOLD_THRESHOLD_MS) {
      shock(p.x, p.y, p.z, 70);
      emitCosmos("burst", { strength: 1 });
    } else {
      sim.uLaunch.value = 3 + 16 * hold;
      shock(p.x, p.y, p.z, 25 * hold);
      emitCosmos("release", { charge: hold });
    }
  });

  const adaptQuality = (dt: number) => {
    frames++;
    frameTime += dt;
    if (frames < 90) return;
    const avg = frameTime / frames;
    frames = 0;
    frameTime = 0;
    if (avg > 1 / 42 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.25);
      renderer.setPixelRatio(dpr);
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      updateScale();
    }
  };

  const tick = (timestamp: number) => {
    timer.update(timestamp);
    const dt = Math.min(timer.getDelta(), 1 / 30);
    if (dt <= 0) return;
    adaptQuality(dt);
    sim.uTime.value += dt * (reduced ? 0.35 : 1);
    sim.uDelta.value = dt;

    const p = getPointer();
    const inside = p.inside && (p.type === "mouse" || p.down);
    if (inside) {
      projectPointer(p.nx, p.ny, pointerTarget);
      if (!wasInside) {
        pointerWorld.copy(pointerTarget);
        pointerPrev.copy(pointerTarget);
      }
      pointerWorld.lerp(pointerTarget, 1 - Math.exp(-18 * dt));
    }
    wasInside = inside;
    rawVel.subVectors(pointerWorld, pointerPrev).divideScalar(dt).clampLength(0, 25);
    pointerVel.lerp(rawVel, 1 - Math.exp(-10 * dt));
    pointerPrev.copy(pointerWorld);
    active = damp(active, inside ? 1 : 0, inside ? 6 : 3, dt);

    const holding = p.down && !p.downOnUi && performance.now() - p.downAt > HOLD_THRESHOLD_MS;
    if (holding && !wasHolding) emitCosmos("hold-start", undefined);
    wasHolding = holding;
    hold = damp(hold, holding ? 1 : 0, holding ? 1.3 : 7, dt);

    (sim.uPointer.value as THREE.Vector3).copy(pointerWorld);
    (sim.uPointerVel.value as THREE.Vector3).copy(pointerVel);
    sim.uPointerActive.value = active;
    sim.uHold.value = hold;
    sim.uGravity.value = 7 + 26 * hold;

    const shockV = sim.uShock.value as THREE.Vector4;
    if (shockV.w >= 0) {
      shockV.w += dt * (reduced ? 0.35 : 1);
      if (shockV.w > 2.6) shockV.w = -1;
    }

    const dir = director.update(dt);
    const { halfW, halfH } = rig.halfExtents;
    const wide = rig.camera.aspect > 1 ? 1 : 0;
    const t = sim.uTime.value as number;
    sim.uShapeA.value = shapes.get(dir.a.key);
    sim.uShapeB.value = shapes.get(dir.b.key);
    (sim.uOffsetA.value as THREE.Vector3).set(dir.a.x * halfW * wide, dir.a.y * halfH, 0);
    (sim.uOffsetB.value as THREE.Vector3).set(dir.b.x * halfW * wide, dir.b.y * halfH, 0);
    shapeMotion(dir.a.key, t, halfW, halfH, motionA);
    shapeMotion(dir.b.key, t, halfW, halfH, motionB);
    (sim.uSpinA.value as THREE.Vector2).set(motionA.spinY, motionA.spinZ);
    (sim.uSpinB.value as THREE.Vector2).set(motionB.spinY, motionB.spinZ);
    (sim.uScaleA.value as THREE.Vector3).set(motionA.sx, motionA.sy, motionA.sz);
    (sim.uScaleB.value as THREE.Vector3).set(motionB.sx, motionB.sy, motionB.sz);
    sim.uMorph.value = dir.morph;
    sim.uStrength.value = dir.strength;
    sim.uFlow.value = dir.flow;
    if (dir.dominant !== dominant) {
      dominant = dir.dominant;
      emitCosmos("shape", { key: dominant });
    }

    field.step();
    sim.uLaunch.value = 0;

    const doc = document.documentElement;
    const progress = window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight);
    rig.update(dt, inside ? p.nx : 0, inside ? p.ny : 0, progress);
    render.uOpacity.value = damp(render.uOpacity.value, 1, 1.4, dt);
    renderer.render(scene, rig.camera);
  };

  const run = (on: boolean) => {
    if (on === running) return;
    running = on;
    if (on) timer.reset();
    renderer.setAnimationLoop(on ? tick : null);
  };

  const onResize = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    rig.resize(canvas.clientWidth / canvas.clientHeight);
    updateBounds();
    updateScale();
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => shapes.resize(shapeCtx()), 250);
  };
  const onVisibility = () => run(started && !document.hidden);
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);

  return {
    start() {
      if (started) return;
      started = true;
      run(!document.hidden);
      emitCosmos("ready", undefined);
    },
    refresh() {
      for (const key of director.refresh()) shapes.get(key);
    },
    warp() {
      if (!started) return;
      shock(0, 0, 0, reduced ? 12 : 40);
      emitCosmos("warp", undefined);
    },
    setReducedMotion(value) {
      reduced = value;
      rig.reducedMotion = value;
      sim.uMotion.value = value ? 0.35 : 1;
    },
    dispose() {
      run(false);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      unsubRelease();
      field.dispose();
      shapes.dispose();
      renderer.dispose();
    },
  };
}
