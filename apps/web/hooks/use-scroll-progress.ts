"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollProgress(containerRef: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const accumulated = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const maxDelta = 800;

    const update = (delta: number) => {
      accumulated.current = Math.min(maxDelta, Math.max(0, accumulated.current + delta));
      setProgress(accumulated.current / maxDelta);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      update(e.deltaY * 0.5);
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - currentY;
      touchStartY = currentY;
      if (Math.abs(delta) > 0) {
        update(delta * 1.2);
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
    };
  }, [containerRef]);

  return progress;
}
