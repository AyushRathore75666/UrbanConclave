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

export function InnerHero({
  kicker,
  title,
  lede,
  image,
  imageAlt = "",
}: {
  kicker?: string;
  title: string;
  lede?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="hero-banner relative isolate overflow-hidden bg-navy-950 text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="hero-aurora" />
        <div className="hero-grid" />
        <div className="hero-sheen" />
        <div className="hero-vignette" />
      </div>
      <div className={`page relative z-10 grid items-center gap-8 py-14 sm:py-16 ${image ? "lg:grid-cols-[1.15fr_0.85fr]" : ""}`}>
        <div>
          <p className="rise text-xs font-semibold uppercase tracking-[0.18em] text-[#F6D3B8]">{kicker || "Urban Growth Conclave 2.0"}</p>
          <h1 className="hero-title mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">{title}</h1>
          {lede ? <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/80">{lede}</p> : null}
        </div>
        {image ? (
          <div className="scene-photo relative mx-auto h-48 w-full max-w-md overflow-hidden rounded-3xl sm:h-56">
            <img src={image} alt={imageAlt} className="scene-drift h-full w-full object-cover" />
          </div>
        ) : null}
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
