export type PointerState = {
  x: number;
  y: number;
  nx: number;
  ny: number;
  inside: boolean;
  down: boolean;
  downAt: number;
  downOnUi: boolean;
  type: string;
  target: Element | null;
};

type ReleaseInfo = { heldMs: number; cancelled: boolean; onUi: boolean };
type PressListener = () => void;
type ReleaseListener = (info: ReleaseInfo) => void;

const UI_SELECTOR = "input, textarea, select, label, [data-no-gravity]";

const state: PointerState = {
  x: 0,
  y: 0,
  nx: 0,
  ny: 0,
  inside: false,
  down: false,
  downAt: 0,
  downOnUi: false,
  type: "mouse",
  target: null,
};

const pressListeners = new Set<PressListener>();
const releaseListeners = new Set<ReleaseListener>();
let attached = false;

function setPosition(e: PointerEvent) {
  state.x = e.clientX;
  state.y = e.clientY;
  state.nx = (e.clientX / window.innerWidth) * 2 - 1;
  state.ny = -(e.clientY / window.innerHeight) * 2 + 1;
  state.type = e.pointerType || "mouse";
  state.target = e.target instanceof Element ? e.target : null;
}

function release(cancelled: boolean) {
  if (!state.down) return;
  const info: ReleaseInfo = {
    heldMs: performance.now() - state.downAt,
    cancelled,
    onUi: state.downOnUi,
  };
  state.down = false;
  if (state.type !== "mouse") state.inside = false;
  releaseListeners.forEach((l) => l(info));
}

function attach() {
  if (attached || typeof window === "undefined") return;
  attached = true;

  window.addEventListener(
    "pointermove",
    (e) => {
      setPosition(e);
      if (e.pointerType === "mouse" || state.down) state.inside = true;
    },
    { passive: true },
  );

  window.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button !== 0) return;
      setPosition(e);
      state.inside = true;
      state.down = true;
      state.downAt = performance.now();
      state.downOnUi = !!state.target?.closest(UI_SELECTOR);
      pressListeners.forEach((l) => l());
    },
    { passive: true },
  );

  window.addEventListener("pointerup", () => release(false), { passive: true });
  window.addEventListener("pointercancel", () => release(true), { passive: true });
  window.addEventListener("blur", () => {
    release(true);
    state.inside = false;
  });
  document.documentElement.addEventListener("pointerleave", () => {
    if (!state.down) state.inside = false;
  });
}

export function getPointer(): PointerState {
  attach();
  return state;
}

export function onPress(listener: PressListener) {
  attach();
  pressListeners.add(listener);
  return () => void pressListeners.delete(listener);
}

export function onRelease(listener: ReleaseListener) {
  attach();
  releaseListeners.add(listener);
  return () => void releaseListeners.delete(listener);
}

export const HOLD_THRESHOLD_MS = 200;
