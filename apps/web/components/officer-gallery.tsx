"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type Officer = {
  role: string;
  title: string;
};

export function OfficerGallery({
  title,
  intro,
  pending,
  people,
}: {
  title: string;
  intro: string;
  pending: string;
  people: Officer[];
}) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduceMotion || people.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % people.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [people.length, reduceMotion]);

  return (
    <section className="border-t border-white/10 bg-navy-950 py-16 text-white" aria-label={title}>
      <div className="page">
        <h2 className="font-serif text-3xl font-semibold sm:text-5xl">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">{intro}</p>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
          {people.map((person, personIndex) => {
            const active = personIndex === index;
            return (
              <li
                key={person.role}
                className={`officer-card rounded-2xl border bg-white/[0.04] p-3 text-center ${
                  active ? "border-[#F6D3B8] bg-white/[0.08]" : "border-white/10"
                } ${reduceMotion ? "" : "transition-transform duration-500"}`}
                style={{ "--i": personIndex, transform: !reduceMotion && active ? "translateY(-8px)" : undefined } as CSSProperties}
              >
                <div className="mx-auto flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#ececec]">
                  <img
                    src="/officers/placeholder.webp"
                    alt=""
                    className={`h-16 w-16 object-contain sm:h-20 sm:w-20 ${active && !reduceMotion ? "guest-portrait" : ""}`}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-white sm:text-base">{person.role}</p>
                <p className="mt-1 text-xs leading-snug text-[#F6D3B8]">{person.title}</p>
                <p className="mt-1 text-[11px] text-white/55">{pending}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex gap-2" role="tablist" aria-label={title}>
          {people.map((person, personIndex) => (
            <button
              key={person.role}
              type="button"
              role="tab"
              aria-selected={personIndex === index}
              aria-label={person.role}
              className={`h-2.5 rounded-full transition-all ${personIndex === index ? "w-8 bg-[#F6D3B8]" : "w-2.5 bg-white/35"}`}
              onClick={() => setIndex(personIndex)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
