"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

export function ParallaxFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const update = () => {
      raf = 0;
      if (reduce.matches) {
        node.style.transform = "";
        return;
      }
      const rect = node.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      const y = Math.max(-28, Math.min(28, offset * -0.06));
      node.style.transform = `translate3d(0, ${y}px, 0)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduce.addEventListener("change", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduce.removeEventListener("change", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
