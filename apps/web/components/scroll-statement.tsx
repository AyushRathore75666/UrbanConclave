"use client";

import { ScrollStage } from "./scroll-stage";

export function ScrollStatement({
  kicker,
  lineA,
  lineB,
  lede,
}: {
  kicker: string;
  lineA: string;
  lineB: string;
  lede: string;
}) {
  return (
    <section className="relative bg-sand" aria-label={kicker}>
      <div className="section-wedge pointer-events-none absolute inset-x-0 top-0 z-20 -translate-y-full" aria-hidden="true" />
      <ScrollStage screens={2.15}>
        <div className="flex h-full flex-col justify-center overflow-hidden bg-sand px-4 pb-10 pt-36 sm:px-8 sm:py-24">
          <p className="page kicker">{kicker}</p>
          <h2 className="page mt-4 max-w-page">
            <span className="statement-line statement-line-a">{lineA}</span>
            {lineB ? <span className="statement-line statement-line-b">{lineB}</span> : null}
          </h2>
          {lede ? (
            <p className="statement-lede page mt-8 max-w-2xl text-lg leading-relaxed text-mute">{lede}</p>
          ) : null}
        </div>
      </ScrollStage>
    </section>
  );
}
