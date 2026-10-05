"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { setLocale } from "@/app/actions";
import type { Locale } from "@/lib/content";
import type { Ui } from "@/lib/ui";

const LINKS: Array<[keyof Ui["nav"], string]> = [
  ["home", "/#home"],
  ["about", "/#about"],
  ["agenda", "/#agenda"],
  ["sessions", "/#sessions"],
  ["contact", "/#contact"],
];

export function SiteHeader({ ui, locale }: { ui: Ui; locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  function goToSection(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (pathname !== "/") return;
    const id = href.split("#")[1];
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", id === "home" ? "/" : `/#${id}`);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-900/10 bg-white/95 backdrop-blur">
      <div className="h-1 bg-saffron-700" />
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 px-3 py-1 sm:px-4 xl:flex-nowrap">
        <Link href="/#home" className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2" onClick={(event) => goToSection(event, "/#home")}>
          <Image
            src="/brand/mp-gov.png"
            alt="Government of Madhya Pradesh"
            width={447}
            height={447}
            priority
            className="h-9 w-9 object-contain sm:h-12 sm:w-12 xl:h-[4.5rem] xl:w-[4.5rem]"
          />
          <Image
            src="/brand/gis.png"
            alt="Invest Madhya Pradesh"
            width={447}
            height={447}
            priority
            className="h-9 w-9 object-contain sm:h-12 sm:w-12 xl:h-[4.5rem] xl:w-[4.5rem]"
          />
          <Image
            src="/brand/primary-logo-v2.png"
            alt="Madhya Pradesh Urban Growth Conclave 2.0"
            width={659}
            height={197}
            priority
            className="h-8 w-auto max-w-[26vw] object-contain object-left sm:h-11 sm:max-w-[180px] xl:h-[4.5rem] xl:max-w-none"
          />
        </Link>
        <nav className="hidden shrink-0 items-center xl:flex" aria-label="Primary">
          {LINKS.map(([key, href]) => (
            <Link
              key={href}
              href={href}
              onClick={(event) => goToSection(event, href)}
              className="whitespace-nowrap rounded px-1 py-1 text-[13px] text-mute hover:text-navy-900"
            >
              {ui.nav[key]}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LanguageSwitch ui={ui} locale={locale} />
          <Link href="/invest" className="btn-accent hidden whitespace-nowrap sm:inline-flex">
            {ui.cta}
          </Link>
          <button
            type="button"
            className="btn-line px-2.5 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? ui.close : ui.menu}
          </button>
        </div>
      </div>
      <div className="page pb-3 sm:hidden">
        <Link href="/invest" className="btn-accent w-full">
          {ui.cta}
        </Link>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-navy-900/10 bg-white xl:hidden" aria-label="Mobile">
          {LINKS.map(([key, href]) => (
            <Link key={href} href={href} onClick={(event) => goToSection(event, href)} className="block border-b border-navy-900/5 px-5 py-3 text-navy-900">
              {ui.nav[key]}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

function LanguageSwitch({ ui, locale }: { ui: Ui; locale: Locale }) {
  return (
    <form action={setLocale} className="flex rounded-md border border-navy-900/15 p-0.5" aria-label={ui.language}>
      <button
        name="locale"
        value="en"
        type="submit"
        aria-pressed={locale === "en"}
        className={`rounded px-2 py-1 text-xs font-semibold ${locale === "en" ? "bg-navy-900 text-white" : "text-navy-900"}`}
      >
        EN
      </button>
      <button
        name="locale"
        value="hi"
        type="submit"
        aria-pressed={locale === "hi"}
        className={`rounded px-2 py-1 text-xs font-semibold ${locale === "hi" ? "bg-navy-900 text-white" : "text-navy-900"}`}
      >
        हिंदी
      </button>
    </form>
  );
}
