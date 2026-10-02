"use client";

import { useEffect, useState } from "react";
import { PhotoCrossfade } from "./photo-crossfade";

type Person = {
  name: string;
  role: string;
  message: string;
  crop: string;
  kicker: string;
  style: string;
};

export function LeadershipRotator({ people, backdrop = [] }: { people: Person[]; backdrop?: string[] }) {
  const ordered = [...people].sort((a, b) => Number(a.crop !== "right") - Number(b.crop !== "right"));
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
    if (reduceMotion || ordered.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % ordered.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [ordered.length, reduceMotion]);

  return (
    <section className="relative overflow-hidden bg-navy-950 py-14 text-white" id="chief-guest" aria-roledescription="carousel" aria-label="Leadership">
      {backdrop.length > 0 ? <PhotoCrossfade images={backdrop} className="opacity-30" /> : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/92 to-navy-950/72" aria-hidden="true" />
      <div className="page relative z-10 grid">
        {ordered.map((person, personIndex) => {
          const active = personIndex === index;
          return (
            <article
              key={person.name}
              className={`col-start-1 row-start-1 grid items-center gap-8 lg:grid-cols-[220px_1fr] ${
                active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
              } ${reduceMotion ? "" : "transition-opacity duration-700 ease-out"}`}
              aria-hidden={!active}
            >
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-2xl bg-black">
                <img
                  src="/brand/leaders.png"
                  alt={active ? person.name : ""}
                  className={`absolute top-0 h-[132%] w-[210%] max-w-none ${person.crop === "right" ? "right-0" : "left-0"} ${
                    active && !reduceMotion ? "guest-portrait" : ""
                  }`}
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F6D3B8]">{person.kicker || person.role}</p>
                <h2 className="mt-3 font-serif text-4xl">{person.name}</h2>
                <p className="mt-2 text-sm text-white/70">{person.role}</p>
                {person.style === "vision" ? (
                  <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/90">{person.message}</p>
                ) : (
                  <blockquote className="mt-5 max-w-3xl text-lg leading-relaxed text-white/90">“{person.message}”</blockquote>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <div className="page relative z-10 mt-8 flex gap-2" role="tablist" aria-label="Choose a leader">
        {ordered.map((person, personIndex) => (
          <button
            key={person.name}
            type="button"
            role="tab"
            aria-selected={personIndex === index}
            aria-label={person.name}
            className={`h-2.5 rounded-full transition-all ${personIndex === index ? "w-8 bg-[#F6D3B8]" : "w-2.5 bg-white/35"}`}
            onClick={() => setIndex(personIndex)}
          />
        ))}
      </div>
    </section>
  );
}
