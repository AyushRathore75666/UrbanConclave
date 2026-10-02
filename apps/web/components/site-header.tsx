"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { setLocale } from "@/app/actions";
import type { Locale } from "@/lib/content";
import type { Ui } from "@/lib/ui";

const LINKS: Array<[keyof Ui["nav"], string]> = [
  ["home", "/"],
  ["about", "/about"],
  ["agenda", "/agenda"],
  ["sessions", "/sectors"],
  ["contact", "/contact"],
];

export function SiteHeader({ ui, locale }: { ui: Ui; locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
      <div className="page flex items-center gap-3 py-2">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/brand/primary-logo-v2.png"
            alt="Madhya Pradesh Urban Growth Conclave 2.0"
            width={659}
            height={197}
            priority
            className="h-16 w-auto max-w-[78vw] object-contain object-left sm:h-20"
          />
        </Link>
        <nav className="ml-auto hidden items-center lg:flex" aria-label="Primary">
          {LINKS.map(([key, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={`whitespace-nowrap rounded px-1.5 py-1 text-[13px] ${pathname === href ? "font-semibold text-navy-900" : "text-mute hover:text-navy-900"}`}
            >
              {ui.nav[key]}
            </Link>
          ))}
        </nav>
        <LanguageSwitch ui={ui} locale={locale} />
        <Link href="/invest" className="btn-accent hidden whitespace-nowrap sm:inline-flex">
          {ui.cta}
        </Link>
        <button
          type="button"
          className="btn-line px-3 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? ui.close : ui.menu}
        </button>
      </div>
      <div className="page pb-3 sm:hidden">
        <Link href="/invest" className="btn-accent w-full">
          {ui.cta}
        </Link>
      </div>
      {open ? (
        <nav id="mobile-nav" className="border-t border-navy-900/10 bg-white lg:hidden" aria-label="Mobile">
          {LINKS.map(([key, href]) => (
            <Link key={href} href={href} className="block border-b border-navy-900/5 px-5 py-3 text-navy-900">
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
