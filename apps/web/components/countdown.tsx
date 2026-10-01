"use client";

import { useEffect, useState } from "react";
import type { Ui } from "@/lib/ui";

export function Countdown({ target, ui }: { target: string; ui: Ui }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const end = new Date(target).getTime();
  const remaining = now == null ? null : Math.max(0, end - now);
  const passed = remaining === 0;

  const parts = remaining == null
    ? []
    : [
        [ui.countdown.days, Math.floor(remaining / 86400000)],
        [ui.countdown.hours, Math.floor(remaining / 3600000) % 24],
        [ui.countdown.minutes, Math.floor(remaining / 60000) % 60],
        [ui.countdown.seconds, Math.floor(remaining / 1000) % 60],
      ];

  return (
    <section className="page -mt-8" aria-label={ui.countdown.label}>
      <div className="rounded-2xl border border-navy-900/10 bg-white p-4 sm:p-6">
        {passed ? (
          <p>{ui.countdown.passed}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
            {parts.length === 0
              ? [0, 1, 2, 3].map((item) => <div key={item} className="h-16 rounded-xl bg-sand" />)
              : parts.map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl bg-sand px-2 py-3 text-center">
                    <p className="font-serif text-3xl font-semibold tabular-nums text-navy-900 sm:text-4xl">{String(value).padStart(2, "0")}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-mute">{label}</p>
                  </div>
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
