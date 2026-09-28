"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  progress: number;
  done: boolean;
  onReveal: () => void;
};

const MIN_DURATION_MS = 1100;
const COLLAPSE_MS = 480;
const EXIT_MS = 1300;

export default function Loader({ progress, done, onReveal }: Props) {
  const [phase, setPhase] = useState<"loading" | "collapse" | "gone">("loading");
  const lineRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const latest = useRef({ progress, done, onReveal });

  useEffect(() => {
    latest.current = { progress, done, onReveal };
  });

  useEffect(() => {
    const start = performance.now();
    let shown = 0;
    let last = start;
    let raf = 0;
    const timers: number[] = [];

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const { progress: target, done: finished } = latest.current;
      shown += (target - shown) * (1 - Math.exp(-7 * dt));
      shown = Math.min(shown, (now - start) / MIN_DURATION_MS, finished ? 1 : 0.97);
      if (finished && target >= 1 && shown > 0.985) shown = 1;
      if (lineRef.current) lineRef.current.style.transform = `scaleX(${shown})`;
      if (numRef.current) numRef.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");

      if (shown < 1) {
        raf = requestAnimationFrame(loop);
        return;
      }
      setPhase("collapse");
      document.documentElement.dataset.stage = "ready";
      timers.push(window.setTimeout(() => latest.current.onReveal(), COLLAPSE_MS - 60));
      timers.push(window.setTimeout(() => setPhase("gone"), EXIT_MS));
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className="loader" data-phase={phase} role="status" aria-live="polite" aria-busy={phase === "loading"}>
      <span className="loader-brand">StarSoft</span>
      <span className="loader-line">
        <span ref={lineRef} />
      </span>
      <span className="loader-core" />
      <span className="loader-meta">
        <span ref={numRef}>000</span>
        <span>กำลังเตรียมจักรวาล</span>
      </span>
    </div>
  );
}
