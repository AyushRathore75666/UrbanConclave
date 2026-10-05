import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale, SiteContent } from "@/lib/content";
import type { Ui } from "@/lib/ui";
import { Icon } from "./icons";
import { JsonLd } from "@/components/page-shell";
import { Reveal } from "./reveal";
import { LeadershipRotator } from "./leadership-rotator";
import { ScrollStatement } from "./scroll-statement";
import { FocusRail } from "./focus-rail";
import { AboutStory } from "./about-story";
import { ContactForm } from "./contact-form";

export function HomePage({ content, ui, locale }: { content: SiteContent; ui: Ui; locale: Locale }) {
  const site = content.microsite;
  const statement = statementFrom(content.whyInvest.intro);

  return (
    <>
      <JsonLd content={content} />
      <section id="home" className="hero-banner relative isolate overflow-hidden bg-navy-950 text-white">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="hero-aurora" />
          <div className="hero-grid" />
          <img src="/brand/mp-icon.png" alt="" className="hero-city" />
          <div className="hero-sheen" />
          <svg className="hero-skyline" viewBox="0 0 1440 220" preserveAspectRatio="none">
            <path className="hero-ground" d="M0 170h1440v50H0z" />
            <g className="hero-buildings">
              <rect x="40" y="90" width="46" height="80" />
              <rect x="96" y="60" width="34" height="110" />
              <rect x="140" y="108" width="70" height="62" />
              <rect x="230" y="48" width="28" height="122" />
              <rect x="266" y="78" width="52" height="92" />
              <rect x="330" y="36" width="22" height="134" />
              <rect x="360" y="96" width="80" height="74" />
              <rect x="460" y="54" width="40" height="116" />
              <rect x="510" y="84" width="64" height="86" />
              <rect x="600" y="40" width="26" height="130" />
              <rect x="636" y="70" width="48" height="100" />
              <rect x="700" y="100" width="90" height="70" />
              <rect x="810" y="52" width="36" height="118" />
              <rect x="856" y="78" width="58" height="92" />
              <rect x="930" y="34" width="24" height="136" />
              <rect x="964" y="88" width="74" height="82" />
              <rect x="1056" y="62" width="42" height="108" />
              <rect x="1110" y="96" width="86" height="74" />
              <rect x="1216" y="46" width="30" height="124" />
              <rect x="1256" y="80" width="60" height="90" />
              <rect x="1330" y="64" width="44" height="106" />
            </g>
            <path className="hero-rail" d="M0 158h1440" />
            <circle className="hero-train" r="5" cy="158" />
          </svg>
          <div className="hero-vignette" />
        </div>
        <div className="hero-marquee relative z-10 border-b border-white/10" aria-hidden="true">
          <div className="marquee-track flex w-max gap-8 py-3">
            {[...site.highlights, ...site.highlights].map((item, index) => (
              <span key={`${item}-${index}`} className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F6D3B8]">{item}</span>
            ))}
          </div>
        </div>
        <ul className="relative z-20 flex items-start justify-end gap-2 px-3 pt-4 sm:gap-3 sm:px-4 lg:absolute lg:right-4 lg:top-14 lg:px-0 lg:pt-0" aria-label={locale === "hi" ? "नेतृत्व" : "Leadership"}>
          {LEADERS.map((person) => (
            <li key={person.src} className="flex shrink-0 flex-col items-center text-center">
                <Image
                  src={`${person.src}?v=2`}
                  alt=""
                  width={person.width}
                  height={person.height}
                  priority
                  unoptimized
                  className="h-14 w-14 object-contain sm:h-16 sm:w-16"
                />
                <p className="mt-1 whitespace-nowrap text-[11px] font-semibold leading-tight text-white sm:text-xs">{person.name[locale]}</p>
                <p className="whitespace-nowrap text-[10px] font-medium leading-tight text-[#F6D3B8] sm:text-[11px]">{person.role[locale]}</p>
              </li>
          ))}
        </ul>
        <div className="page relative z-10 grid items-center gap-8 py-8 sm:gap-10 sm:py-12 lg:min-h-[78vh] lg:py-16">
          <div className="rise">
            <p className="text-base font-semibold uppercase tracking-[0.16em] text-[#F6D3B8] sm:text-lg">{content.hero.kicker}</p>
            <p className="mt-3 text-sm text-white/70">{content.hero.organiser}</p>
            <h1 className="hero-title mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[0.95] sm:text-6xl">{content.hero.title}</h1>
            <p className="mt-4 text-2xl text-white/90">{content.hero.subtitle}</p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#F6D3B8]">
              {content.hero.dates}
              <span className="mx-2 text-white/40">|</span>
              {content.hero.venue}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80">{site.heroIntro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/invest" className="btn-accent">{ui.investNow}</Link>
              <a href="#agenda" className="btn-ghost">{ui.viewAgenda}</a>
            </div>
          </div>
          <div className="relative mx-auto hidden aspect-square w-full max-w-[380px]">
            <div className="logo-glow absolute inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(224,112,32,0.45),transparent_68%)]" aria-hidden="true" />
            <div className="logo-ring absolute inset-[4%] rounded-full border border-dashed border-[#F6D3B8]/50" aria-hidden="true" />
            <div className="logo-ring hero-ring-2 absolute inset-[12%] rounded-full border border-[#F6D3B8]/30" aria-hidden="true" />
            <Image
              src="/brand/gis-mark-clear.png"
              alt="Madhya Pradesh Urban Growth Conclave 2.0 emblem"
              width={512}
              height={512}
              priority
              className="hero-mark absolute inset-0 z-10 h-full w-full object-contain"
            />
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Image
                src="/brand/mp-icon.png"
                alt="Madhya Pradesh"
                width={595}
                height={419}
                className="hero-mark hero-mark-alt h-auto w-[72%] max-w-none object-contain"
              />
            </div>
          </div>
        </div>
        <p className="scroll-cue relative z-10 pb-10">
          <span>{ui.scrollCue}</span>
          <span className="scroll-cue-line" aria-hidden="true" />
        </p>
      </section>

      <div className="bg-navy-950 pb-24">
        <LeadershipRotator
          people={content.leadership.people}
          backdrop={["/scenes/infrastructure.jpg", "/scenes/roads.webp", "/scenes/industry.png"]}
        />
      </div>

      <ScrollStatement
        kicker={site.roadTo}
        lineA={statement.lineA}
        lineB={statement.lineB}
        lede={statement.lede}
      />

      <FocusRail
        id="sessions"
        kicker={ui.nav.sessions}
        title={content.sectors.title}
        intro={content.sectors.intro}
        cue={ui.scrollCue}
        items={content.sectors.items.map((panel, index) => ({
          key: panel.slug,
          kicker: panel.code,
          title: panel.title,
          summary: panel.summary,
          href: `/invest?session=${panel.slug}`,
          cta: ui.showInterest,
          image: panelScenes[index % panelScenes.length] ?? panelScenes[0],
        }))}
      />

      <AboutStory
        departmentKicker={site.departmentKicker}
        departmentTitle={site.departmentTitle}
        departmentBody={site.departmentBody}
        aboutTitle={content.about.title}
        aboutBody={content.about.paragraphs[1] ?? ""}
        highlightsTitle={site.highlightsTitle}
        highlights={site.highlights}
        audienceTitle={site.audienceTitle}
        audience={site.audience}
        image="/scenes/roads.webp"
      />

      <section className="relative overflow-hidden bg-white py-14" id="agenda">
        <img src="/scenes/roads.webp" alt="" className="agenda-wash pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 object-cover lg:block" />
        <div className="page relative">
          <Reveal>
            <h2 className="h-section">{content.agenda.title}</h2>
            <p className="mt-3 max-w-3xl text-sm text-mute">{content.agenda.intro}</p>
          </Reveal>
          <Reveal stagger>
            <ol className="mt-8 grid gap-4 lg:grid-cols-2">
              {content.agenda.items.map((item, index) => (
                <li key={`${item.time}-${item.title}`} className="pop-in shine-card card card-lift" style={{ "--i": index } as CSSProperties}>
                  <p className="text-sm font-semibold text-saffron-700">{item.time}</p>
                  <h3 className="mt-1 text-lg font-semibold text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{item.detail}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section id="why" className="relative overflow-hidden bg-[#f7f4ef] py-14">
        <div className="ambient-orb ambient-orb-a" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-b" aria-hidden="true" />
        <div className="page relative">
          <Reveal>
            <h2 className="h-section">{content.whyInvest.title}</h2>
            <p className="mt-3 max-w-3xl text-mute">{content.whyInvest.intro}</p>
          </Reveal>
          <Reveal stagger>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {content.whyInvest.items.map((item, index) => (
                <article key={item.title} className="pop-in glow-card shine-card card card-lift" style={{ "--i": index } as CSSProperties}>
                  <span className="icon-float inline-flex"><Icon name={item.icon} /></span>
                  <h3 className="mt-3 text-lg font-semibold text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute">{item.summary}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-navy-900/10 bg-[#f7f4ef]">
        <Reveal stagger className="page grid gap-4 py-8 md:grid-cols-3">
          {[
            [site.hostKicker, site.hostCity],
            [ui.dates, content.hero.dates],
            [ui.venue, content.hero.venue],
          ].map(([label, value], index) => (
            <div key={label} className="pop-in glow-card shine-card fact-tile rounded-2xl bg-white px-4 py-3" style={{ "--i": index } as CSSProperties}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-saffron-700">{label}</p>
              <p className="mt-1 text-base font-normal leading-snug text-navy-950">{value}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section id="contact" className="relative overflow-hidden bg-white py-14">
        <div className="page relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="h-section">{content.contact.title}</h2>
            <p className="mt-3 max-w-xl text-mute">{content.contact.intro}</p>
            <address className="mt-6 not-italic">
              <p className="font-semibold text-navy-900">{content.contact.address}</p>
              <p className="mt-3 text-sm text-mute">{content.contact.hours}</p>
              <p className="mt-4">
                <a className="font-semibold text-navy-900" href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
              </p>
              <p className="mt-2">
                <a className="font-semibold text-navy-900" href={`tel:${content.contact.phone.replace(/\s/g, "")}`}>{content.contact.phone}</a>
              </p>
            </address>
          </div>
          <ContactForm ui={ui} />
        </div>
      </section>

    </>
  );
}

function statementFrom(intro: string) {
  const parts = intro.split(/(?<=[।.])\s+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 4) return { lineA: intro, lineB: "", lede: "" };
  return {
    lineA: `${parts[0]} ${parts[1]}`,
    lineB: `${parts[2]} ${parts[3]}`,
    lede: parts.slice(4).join(" "),
  };
}

const panelScenes = ["/scenes/transit.jpg", "/scenes/digital.jpg", "/scenes/infrastructure.jpg", "/scenes/industry.png"];

const LEADERS: Array<{
  src: string;
  width: number;
  height: number;
  name: Record<Locale, string>;
  role: Record<Locale, string>;
}> = [
  {
    src: "/leaders/prime-minister.png",
    width: 368,
    height: 368,
    name: { en: "Narendra Modi", hi: "नरेंद्र मोदी" },
    role: { en: "Prime Minister", hi: "प्रधानमंत्री" },
  },
  {
    src: "/leaders/chief-minister.png",
    width: 364,
    height: 364,
    name: { en: "Dr. Mohan Yadav", hi: "डॉ. मोहन यादव" },
    role: { en: "Chief Minister", hi: "मुख्यमंत्री" },
  },
  {
    src: "/leaders/minister.png",
    width: 482,
    height: 482,
    name: { en: "Kailash Vijayvargiya", hi: "कैलाश विजयवर्गीय" },
    role: { en: "Minister", hi: "मंत्री" },
  },
];
