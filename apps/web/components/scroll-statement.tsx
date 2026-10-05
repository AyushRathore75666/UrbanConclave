"use client";

import type { CSSProperties } from "react";
import { ScrollStage } from "./scroll-stage";

export function ScrollStatement({
  kicker,
  lineA,
  lineB,
  lede,
  milestones = [],
}: {
  kicker: string;
  lineA: string;
  lineB: string;
  lede: string;
  milestones?: string[];
}) {
  return (
    <section className="relative bg-sand" aria-label={kicker}>
      <div className="section-wedge pointer-events-none absolute inset-x-0 top-0 z-20 -translate-y-full" aria-hidden="true" />
      <ScrollStage screens={2.4}>
        <div className="flex h-full flex-col justify-center overflow-hidden bg-sand px-4 pb-10 pt-36 sm:px-8 sm:py-24">
          <p className="page text-base font-semibold uppercase tracking-[0.16em] text-saffron-700 sm:text-lg">{kicker}</p>
          <h2 className="page mt-4 max-w-page">
            <span className="statement-line statement-line-a">{lineA}</span>
            {lineB ? <span className="statement-line statement-line-b">{lineB}</span> : null}
          </h2>
          {lede ? (
            <p className="statement-lede page mt-8 max-w-2xl text-lg leading-relaxed text-mute">{lede}</p>
          ) : null}
          {milestones.length ? (
            <ul className="milestone-row page">
              {milestones.map((label, index) => (
                <li
                  key={label}
                  className="milestone"
                  style={{ "--at": 0.36 + index * (0.44 / Math.max(milestones.length - 1, 1)), "--shift": index % 2 === 0 ? "-140px" : "140px" } as CSSProperties}
                >
                  {label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </ScrollStage>
    </section>
  );
}
