"use client";

import { useRef, type CSSProperties } from "react";
import Link from "next/link";
import { usePinProgress } from "./scroll-stage";

export type RailItem = {
  key: string;
  kicker: string;
  title: string;
  summary: string;
  href: string;
  cta: string;
  detailHref?: string;
  detailLabel?: string;
  image: string;
};

export function FocusRail({
  id,
  kicker,
  title,
  intro,
  moreHref,
  moreLabel,
  cue,
  items,
}: {
  id?: string;
  kicker: string;
  title: string;
  intro: string;
  moreHref?: string;
  moreLabel?: string;
  cue: string;
  items: RailItem[];
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLParagraphElement>(null);
  const screens = 1 + Math.max(items.length - 1, 0) * 0.85;

  const { rootRef, paneRef } = usePinProgress<HTMLDivElement>(screens, (progress) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const cards = [...track.querySelectorAll<HTMLElement>(".rail-card")];
    const count = cards.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || count < 2) {
      track.style.transform = "";
      cards.forEach((card) => {
        card.style.transform = "";
        card.style.filter = "";
        card.style.zIndex = "";
      });
      return;
    }

    const gap = Number.parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    const cardWidth = cards[0]?.offsetWidth ?? 0;
    if (!cardWidth) return;
    const index = progress * (count - 1);
    const stride = cardWidth + gap;
    const x = viewport.clientWidth / 2 - cardWidth / 2 - index * stride;
    track.style.transform = `translate3d(${x}px, 0, 0)`;

    cards.forEach((card, cardIndex) => {
      const delta = cardIndex - index;
      const abs = Math.min(Math.abs(delta), 1.4);
      const scale = 1 - Math.min(abs, 1) * 0.16;
      const rotate = Math.max(-8, Math.min(8, delta * 6));
      const drop = abs * abs * 28;
      const blur = Math.min(abs * 2.2, 3.2);
      const brightness = 1 - Math.min(abs, 1) * 0.32;
      card.style.transform = `translate3d(0, ${drop}px, 0) rotate(${rotate}deg) scale(${scale})`;
      card.style.filter = `blur(${blur}px) brightness(${brightness})`;
      card.style.zIndex = String(20 - Math.round(abs * 10));
    });

    if (countRef.current) {
      const current = Math.round(index) + 1;
      countRef.current.textContent = `${String(current).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
    }
  });

  return (
    <section id={id} className="bg-navy-950 text-white" aria-label={title}>
      <div ref={rootRef} className="pin-stage" style={{ "--pin-screens": screens } as CSSProperties}>
        <div ref={paneRef} className="pin-pane" style={{ "--p": 0 } as CSSProperties}>
          <div className="rail-pane relative flex h-full flex-col bg-navy-950">
            <div className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
              <div className="logo-ring h-72 w-72 rounded-full border border-dashed border-white/15 sm:h-[34rem] sm:w-[34rem]" />
            </div>
            <div className="page flex flex-wrap items-end justify-between gap-3 pt-36 sm:pt-32">
              <div className="min-w-0">
                <p className="text-base font-semibold uppercase tracking-[0.16em] text-[#F6D3B8] sm:text-lg">{kicker}</p>
                <h2 className="rail-title mt-2 font-serif text-3xl font-semibold sm:text-5xl">{title}</h2>
              </div>
              {moreHref && moreLabel ? (
                <Link href={moreHref} className="text-sm font-semibold text-[#F6D3B8]">
                  {moreLabel}
                </Link>
              ) : null}
            </div>
            <p className="page mt-2 line-clamp-2 max-w-3xl text-sm leading-relaxed text-white/70 sm:mt-3 sm:line-clamp-none">{intro}</p>
            <div ref={viewportRef} className="rail-viewport relative mt-2 min-h-0 flex-1">
              <div ref={trackRef} className="rail-track">
                {items.map((item) => (
                  <article key={item.key} className="rail-card">
                    <img src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/25 to-navy-950/10" />
                    <div className="relative flex h-full flex-col justify-end p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F6D3B8]">{item.kicker}</p>
                      <h3 className="mt-2 line-clamp-3 font-serif text-lg leading-tight sm:line-clamp-4 sm:text-2xl">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/80 sm:line-clamp-3">{item.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                        {item.detailHref && item.detailLabel ? (
                          <Link href={item.detailHref} className="text-sm font-semibold text-[#F6D3B8]">
                            {item.detailLabel}
                          </Link>
                        ) : null}
                        <Link href={item.href} className="text-sm font-semibold text-white">
                          {item.cta}
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="page flex items-center gap-3 pb-6 pt-3">
              <p ref={countRef} className="w-14 shrink-0 text-xs font-semibold tracking-[0.16em] text-[#F6D3B8]" aria-hidden="true">
                01 / {String(items.length).padStart(2, "0")}
              </p>
              <div className="h-px min-w-0 flex-1 bg-white/15" aria-hidden="true">
                <div className="rail-progress h-px origin-left bg-[#F6D3B8]" />
              </div>
              <p className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/60 sm:block">{cue}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
