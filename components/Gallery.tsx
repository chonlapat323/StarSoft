"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ProjectImage } from "@/content/site";

export default function Gallery({ images, offset = 1 }: { images: ProjectImage[]; offset?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    triggerRef.current?.focus();
  }, []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  const current = open === null ? null : images[open];

  return (
    <>
      <div className="gallery">
        {images.map((img, i) => (
          <figure key={img.src} className={`project-figure gallery-item ${i === 0 ? "is-lead" : ""}`}>
            <button
              type="button"
              className="project-figure-frame gallery-open"
              aria-label={`ขยายภาพ: ${img.caption}`}
              onClick={(e) => {
                triggerRef.current = e.currentTarget;
                setOpen(i);
              }}
              data-cursor
            >
              <Image src={img.src} alt={img.alt} width={2400} height={1500} sizes={i === 0 ? "(max-width: 1320px) 100vw, 1240px" : "(max-width: 900px) 100vw, 620px"} />
              <span className="gallery-zoom" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </span>
            </button>
            <figcaption>
              <span className="gallery-num">{String(i + offset + 1).padStart(2, "0")}</span>
              {img.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      {current && open !== null && createPortal(
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.caption} onClick={close} data-no-gravity>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <Image src={current.src} alt={current.alt} width={2400} height={1500} sizes="100vw" />
            <div className="lightbox-bar">
              <span className="gallery-num">
                {open + 1} / {images.length}
              </span>
              <span className="lightbox-caption">{current.caption}</span>
              {images.length > 1 && (
                <>
                  <button type="button" className="lightbox-btn" aria-label="ภาพก่อนหน้า" onClick={() => step(-1)}>
                    ←
                  </button>
                  <button type="button" className="lightbox-btn" aria-label="ภาพถัดไป" onClick={() => step(1)}>
                    →
                  </button>
                </>
              )}
              <button ref={closeRef} type="button" className="lightbox-btn" aria-label="ปิด" onClick={close}>
                ✕
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
