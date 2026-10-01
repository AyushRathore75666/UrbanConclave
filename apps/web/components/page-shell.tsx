import type { SiteContent } from "@/lib/content";

export function JsonLd({ content }: { content: SiteContent }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: content.hero.title,
    description: content.meta.description,
    startDate: content.hero.startISO,
    endDate: content.hero.endISO,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: content.hero.venue,
      address: content.hero.venue,
    },
    organizer: {
      "@type": "Organization",
      name: content.hero.organiser,
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function InnerHero({ kicker, title, lede }: { kicker?: string; title: string; lede?: string }) {
  return (
    <section className="bg-navy-950 text-white">
      <div className="page py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F6D3B8]">{kicker || "MP Conclave GIS"}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
        {lede ? <p className="mt-4 max-w-2xl text-lg text-white/80">{lede}</p> : null}
      </div>
    </section>
  );
}

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="page grid gap-4 py-12 text-lg leading-relaxed text-mute">
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}
    </div>
  );
}
