"use client";

import { useEffect, useRef } from "react";
import { damp } from "@/lib/cosmos/math";
import { getPointer, HOLD_THRESHOLD_MS, onRelease } from "@/lib/pointer";

const INTERACTIVE = "a, button, [data-cursor]";
const TEXT_ENTRY = "input, textarea, select, [contenteditable]";

export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current, ring = ringRef.current, core = coreRef.current, pulse = pulseRef.current;
    if (!root || !ring || !core || !pulse) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const html = document.documentElement;
    html.classList.add("has-cursor");
    const p = getPointer();
    let rx = p.x, ry = p.y, cx = p.x, cy = p.y;
    let hold = 0;
    let hover = 0;
    let last = performance.now();
    let magnet: HTMLElement | null = null;
    let raf = 0;

    const setMagnet = (el: HTMLElement | null) => {
      if (el === magnet) return;
      if (magnet) {
        magnet.classList.remove("is-magnet");
        magnet.style.transform = "";
      }
      magnet = el;
      magnet?.classList.add("is-magnet");
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      const target = p.target;
      const interactive = target?.closest(INTERACTIVE) ?? null;
      const typing = !!target?.closest(TEXT_ENTRY);
      setMagnet((interactive?.closest("[data-magnetic]") as HTMLElement | null) ?? null);

      let tx = p.x, ty = p.y;
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const mx = r.left + r.width / 2, my = r.top + r.height / 2;
        const dx = p.x - mx, dy = p.y - my;
        magnet.style.transform = `translate3d(${dx * 0.2}px, ${dy * 0.28}px, 0)`;
        tx = mx + dx * 0.4;
        ty = my + dy * 0.4;
      }

      cx = damp(cx, p.x, 40, dt);
      cy = damp(cy, p.y, 40, dt);
      rx = damp(rx, tx, 13, dt);
      ry = damp(ry, ty, 13, dt);
      const holding = p.down && !p.downOnUi && now - p.downAt > HOLD_THRESHOLD_MS;
      hold = damp(hold, holding ? 1 : 0, holding ? 1.3 : 7, dt);
      hover = damp(hover, interactive ? 1 : 0, 12, dt);

      root.style.opacity = p.inside && !typing ? "1" : "0";
      root.dataset.state = holding ? "hold" : interactive ? "hover" : "idle";
      const ringScale = (1 + hover * 0.9) * (1 - hold * 0.45);
      const coreScale = (1 - hover * 0.55) * (1 + hold * 1.4);
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${ringScale})`;
      core.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) scale(${coreScale})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const unsub = onRelease(({ heldMs, cancelled, onUi }) => {
      if (cancelled || onUi) return;
      const charge = heldMs < HOLD_THRESHOLD_MS ? 0.4 : hold;
      pulse.style.setProperty("--x", `${p.x}px`);
      pulse.style.setProperty("--y", `${p.y}px`);
      pulse.style.setProperty("--s", String(2 + charge * 4));
      pulse.classList.remove("is-on");
      void pulse.offsetWidth;
      pulse.classList.add("is-on");
    });

    return () => {
      cancelAnimationFrame(raf);
      unsub();
      setMagnet(null);
      html.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={rootRef} className="cursor" aria-hidden="true">
      <div ref={pulseRef} className="cursor-pulse" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={coreRef} className="cursor-core" />
    </div>
  );
}
