"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";
import { getPointer, HOLD_THRESHOLD_MS, onRelease } from "@/lib/pointer";

type Props = { text: string; className?: string };

function graphemes(word: string) {
  const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  return Array.from(seg.segment(word), (s) => s.segment);
}

export default function GravityHeadline({ text, className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const words = useMemo(() => text.split(" ").map(graphemes), [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const chars = Array.from(el.querySelectorAll<HTMLElement>("[data-g]"));
    const n = chars.length;
    const home = new Float32Array(n * 2);
    const pos = new Float32Array(n * 2);
    const vel = new Float32Array(n * 2);
    const p = getPointer();
    let hold = 0;
    let visible = true;
    let raf = 0;
    let last = performance.now();

    const measure = () => {
      const r = el.getBoundingClientRect();
      chars.forEach((c, i) => {
        const cr = c.getBoundingClientRect();
        home[i * 2] = cr.left - r.left + cr.width / 2 - pos[i * 2];
        home[i * 2 + 1] = cr.top - r.top + cr.height / 2 - pos[i * 2 + 1];
      });
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (visible) {
        const r = el.getBoundingClientRect();
        const holding = p.down && !p.downOnUi && now - p.downAt > HOLD_THRESHOLD_MS;
        hold += ((holding ? 1 : 0) - hold) * (1 - Math.exp(-(holding ? 1.3 : 6) * dt));
        const sigma = 150 + hold * 120;
        const strength = p.inside ? 0.13 + hold * 0.24 : 0;
        const maxLen = 16 + hold * 30;
        for (let i = 0; i < n; i++) {
          const dx = p.x - (r.left + home[i * 2]);
          const dy = p.y - (r.top + home[i * 2 + 1]);
          const f = strength * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
          let tx = dx * f, ty = dy * f;
          const len = Math.hypot(tx, ty);
          if (len > maxLen) {
            tx *= maxLen / len;
            ty *= maxLen / len;
          }
          const ix = i * 2, iy = ix + 1;
          vel[ix] += ((tx - pos[ix]) * 170 - vel[ix] * 16) * dt;
          vel[iy] += ((ty - pos[iy]) * 170 - vel[iy] * 16) * dt;
          pos[ix] += vel[ix] * dt;
          pos[iy] += vel[iy] * dt;
          chars[i].style.transform = `translate3d(${pos[ix].toFixed(2)}px, ${pos[iy].toFixed(2)}px, 0) rotate(${(pos[ix] * 0.18).toFixed(2)}deg)`;
        }
      }
      raf = requestAnimationFrame(loop);
    };

    const unsub = onRelease(({ heldMs, cancelled, onUi }) => {
      if (cancelled || onUi || !visible) return;
      const r = el.getBoundingClientRect();
      const power = heldMs < HOLD_THRESHOLD_MS ? 700 : 700 + 1600 * hold;
      for (let i = 0; i < n; i++) {
        const dx = p.x - (r.left + home[i * 2]);
        const dy = p.y - (r.top + home[i * 2 + 1]);
        const d = Math.hypot(dx, dy) + 1;
        const fall = Math.exp(-(d * d) / (2 * 280 * 280));
        vel[i * 2] -= (dx / d) * power * fall;
        vel[i * 2 + 1] -= (dy / d) * power * fall;
      }
    });

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    document.fonts.ready.then(measure);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      unsub();
      io.disconnect();
      ro.disconnect();
      chars.forEach((c) => (c.style.transform = ""));
    };
  }, [words]);

  let index = 0;
  return (
    <h1 ref={ref} className={className} aria-label={text}>
      {words.map((chars, wi) => (
        <Fragment key={wi}>
          {wi > 0 && " "}
          <span className="g-word" aria-hidden="true">
            {chars.map((ch, ci) => (
              <span key={ci} className="g-char" data-g="">
                <span className="intro-char" style={{ "--i": index++ } as React.CSSProperties}>
                  {ch}
                </span>
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </h1>
  );
}
