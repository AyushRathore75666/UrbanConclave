import type { CSSProperties } from "react";

export type Officer = {
  name: string;
  designation: string;
  department: string;
  image: string;
};

export function OfficerGallery({
  title,
  intro,
  people,
}: {
  title: string;
  intro: string;
  people: Officer[];
}) {
  return (
    <section className="border-t border-white/10 bg-navy-950 py-16 text-white" aria-label={title}>
      <div className="page">
        <h2 className="font-serif text-3xl font-semibold sm:text-5xl">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">{intro}</p>
        <ul className="mt-8 flex flex-wrap gap-4">
          {people.map((person, personIndex) => (
            <li
              key={person.name}
              className="officer-card w-44 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-center sm:w-52"
              style={{ "--i": personIndex } as CSSProperties}
            >
              <div className="mx-auto flex aspect-square w-28 items-end justify-center overflow-hidden rounded-xl bg-black">
                <img src={person.image} alt="" className="h-full w-full object-contain object-bottom" />
              </div>
              <p className="mt-2 text-xs font-semibold leading-snug text-white sm:text-sm">{person.name}</p>
              <p className="mt-1 text-[11px] leading-snug text-[#F6D3B8]">{person.designation}</p>
              <p className="mt-1 text-[11px] leading-snug text-white/70">{person.department}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
