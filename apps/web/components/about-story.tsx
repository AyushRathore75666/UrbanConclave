"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";

export function AboutStory({
  departmentKicker,
  departmentTitle,
  departmentBody,
  aboutTitle,
  aboutBody,
  highlightsTitle,
  highlights,
  audienceTitle,
  audience,
  image,
}: {
  departmentKicker: string;
  departmentTitle: string;
  departmentBody: string;
  aboutTitle: string;
  aboutBody: string;
  highlightsTitle: string;
  highlights: string[];
  audienceTitle: string;
  audience: string[];
  image: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const items = [...root.querySelectorAll<HTMLElement>(".about-reveal, .about-chip")];
    const photo = photoRef.current?.querySelector<HTMLElement>(".about-photo-motion");

    const apply = () => {
      raf = 0;
      if (reduce.matches) {
        items.forEach((item) => item.style.setProperty("--in", "1"));
        photo?.style.setProperty("--zoom", "0");
        return;
      }
      const start = window.innerHeight * 0.98;
      const end = window.innerHeight * 0.78;
      items.forEach((item) => {
        const stagger = Number(item.style.getPropertyValue("--i") || "0") * 0.015;
        const raw = (start - item.getBoundingClientRect().top) / (start - end) - stagger;
        const next = Math.min(1, Math.max(0, raw));
        item.style.setProperty("--in", next.toFixed(3));
      });
      if (photo && photoRef.current) {
        const frame = photoRef.current;
        const rect = frame.getBoundingClientRect();
        const stickyTop = Number.parseFloat(getComputedStyle(frame).top);
        const stuck = getComputedStyle(frame).position === "sticky" && Number.isFinite(stickyTop) && rect.top <= stickyTop + 1;
        let center = rect.top + rect.height / 2;
        if (stuck) {
          const extra = Math.max(0, window.scrollY - (layoutTop(frame) - stickyTop));
          center -= extra;
        }
        const start = window.innerHeight;
        const end = window.innerHeight * 0.08;
        const zoom = Math.min(1, Math.max(0, (start - center) / (start - end)));
        photo.style.setProperty("--zoom", zoom.toFixed(3));
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
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
    <section ref={rootRef} className="about-story page py-16" id="about">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div>
          <p className="about-reveal kicker">{departmentKicker}</p>
          <h2 className="about-reveal mt-2 h-section">{departmentTitle}</h2>
          <p className="about-reveal mt-4 max-w-3xl leading-relaxed text-mute">{departmentBody}</p>
          <h2 className="about-reveal mt-12 h-section">{aboutTitle}</h2>
          <p className="about-reveal mt-4 max-w-3xl leading-relaxed text-mute">{aboutBody}</p>
        </div>
        <div
          ref={photoRef}
          className="about-photo relative h-72 overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(11,31,58,0.16)] sm:h-96 lg:sticky lg:top-28 lg:h-[440px]"
        >
          <img src={image} alt="" className="about-photo-motion absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
      <div className="mt-12">
        <h3 className="about-reveal text-lg font-semibold text-navy-900">{highlightsTitle}</h3>
        <ul className="mt-4 flex flex-wrap gap-3">
          {highlights.map((item, index) => (
            <li
              key={item}
              className="about-chip shine-card rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-navy-900"
              style={{ "--i": index } as CSSProperties}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8">
        <h3 className="about-reveal text-lg font-semibold text-navy-900">{audienceTitle}</h3>
        <ul className="mt-4 flex flex-wrap gap-3">
          {audience.map((item, index) => (
            <li
              key={item}
              className="about-chip shine-card rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm font-medium text-navy-900"
              style={{ "--i": index } as CSSProperties}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function layoutTop(el: HTMLElement) {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}
