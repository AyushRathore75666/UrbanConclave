"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";

export function usePinProgress<T extends HTMLElement>(screens: number, onProgress?: (progress: number) => void) {
  const rootRef = useRef<HTMLDivElement>(null);
  const paneRef = useRef<T>(null);
  const callback = useRef(onProgress);
  callback.current = onProgress;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const pane = paneRef.current;
    if (!root || !pane) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let target = 0;
    let raf = 0;

    const resting = () => reduce.matches;

    const measure = () => {
      if (resting()) {
        target = 1;
        return;
      }
      const total = root.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-root.getBoundingClientRect().top, 0), Math.max(total, 0));
      target = total > 0 ? scrolled / total : 0;
    };

    const apply = (value: number) => {
      pane.style.setProperty("--p", value.toFixed(4));
      callback.current?.(value);
    };

    const tick = () => {
      if (resting()) {
        current = 1;
        apply(1);
        raf = 0;
        return;
      }
      current += (target - current) * 0.16;
      if (Math.abs(target - current) < 0.0006) current = target;
      apply(current);
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };

    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    measure();
    current = target;
    apply(current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduce.addEventListener("change", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduce.removeEventListener("change", onScroll);
    };
  }, [screens]);

  return { rootRef, paneRef };
}

export function ScrollStage({
  children,
  screens = 1.8,
  className = "",
}: {
  children: ReactNode;
  screens?: number;
  className?: string;
}) {
  const { rootRef, paneRef } = usePinProgress<HTMLDivElement>(screens);

  return (
    <div ref={rootRef} className={`pin-stage ${className}`} style={{ "--pin-screens": screens } as CSSProperties}>
      <div ref={paneRef as RefObject<HTMLDivElement>} className="pin-pane" style={{ "--p": 0 } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}
