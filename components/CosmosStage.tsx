"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CosmosHandle } from "@/lib/cosmos/Engine";
import Loader from "./Loader";

type Status = "loading" | "ready" | "fallback";

export default function CosmosStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<CosmosHandle | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const pathname = usePathname();
  const firstPath = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const abort = new AbortController();
    const { signal } = abort;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => handleRef.current?.setReducedMotion(motion.matches);
    motion.addEventListener("change", onMotion);

    import("@/lib/cosmos/Engine")
      .then(({ createCosmos }) =>
        createCosmos(canvas, {
          reducedMotion: motion.matches,
          signal,
          onProgress: (p) => !signal.aborted && setProgress(p),
        }),
      )
      .then((handle) => {
        if (signal.aborted) return handle.dispose();
        handleRef.current = handle;
        handle.refresh();
        setStatus("ready");
      })
      .catch((err) => {
        if (signal.aborted) return;
        console.warn("[cosmos] falling back to static background:", err);
        setProgress(1);
        setStatus("fallback");
      });

    return () => {
      abort.abort();
      motion.removeEventListener("change", onMotion);
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    handleRef.current?.refresh();
    handleRef.current?.warp();
  }, [pathname]);

  return (
    <>
      <canvas ref={canvasRef} className="cosmos-canvas" aria-hidden="true" />
      {status === "fallback" && <div className="cosmos-fallback" aria-hidden="true" />}
      <div className="vignette" aria-hidden="true" />
      <Loader progress={progress} done={status !== "loading"} onReveal={() => handleRef.current?.start()} />
    </>
  );
}
