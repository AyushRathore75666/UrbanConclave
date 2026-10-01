"use client";

import { useState } from "react";

export function FaqList({ items }: { items: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="mt-4 divide-y divide-navy-900/10 rounded-2xl border border-navy-900/10 bg-white">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-navy-900"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? -1 : index)}
              >
                {item.q}
                <span aria-hidden="true">{expanded ? "–" : "+"}</span>
              </button>
            </h3>
            {expanded ? <p className="px-5 pb-4 text-sm leading-relaxed text-mute">{item.a}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
