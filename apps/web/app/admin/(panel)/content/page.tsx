"use client";

import { useEffect, useState } from "react";
import { adminJson } from "@/lib/admin";
import type { SiteContent } from "@/lib/content";

export default function ContentPage() {
  const [locale, setLocale] = useState<"en" | "hi">("en");
  const [data, setData] = useState<SiteContent | null>(null);
  const [raw, setRaw] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load(next: "en" | "hi") {
    const response = await adminJson<{ data: SiteContent }>(`/api/admin/content/${next}`);
    setData(response.data);
    setRaw(JSON.stringify(response.data, null, 2));
  }

  useEffect(() => {
    load(locale).catch((err) => setError(err.message));
  }, [locale]);

  function patch(updater: (current: SiteContent) => SiteContent) {
    setData((current) => {
      if (!current) return current;
      const next = updater(current);
      setRaw(JSON.stringify(next, null, 2));
      return next;
    });
  }

  async function save(document: SiteContent) {
    setError("");
    setMessage("");
    await adminJson(`/api/admin/content/${locale}`, { method: "PUT", body: JSON.stringify({ data: document }) });
    setMessage("Saved. The public site reads this on the next page load.");
  }

  if (!data) return <p>{error || "Loading content…"}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-navy-950">Content</h1>
        <div className="flex gap-2">
          <button type="button" className={locale === "en" ? "btn-primary" : "btn-line"} onClick={() => setLocale("en")}>English</button>
          <button type="button" className={locale === "hi" ? "btn-primary" : "btn-line"} onClick={() => setLocale("hi")}>Hindi</button>
        </div>
      </div>
      <p className="mt-2 text-sm text-mute">Edits here replace the live copy for the selected language. No code change is required.</p>
      <div className="card mt-4 grid gap-3">
        <label className="text-sm font-semibold">Summit title<input className="field" value={data.hero.title} onChange={(event) => patch((current) => ({ ...current, hero: { ...current.hero, title: event.target.value } }))} /></label>
        <label className="text-sm font-semibold">Dates shown<input className="field" value={data.hero.dates} onChange={(event) => patch((current) => ({ ...current, hero: { ...current.hero, dates: event.target.value } }))} /></label>
        <label className="text-sm font-semibold">Countdown start (ISO)<input className="field" value={data.hero.startISO} onChange={(event) => patch((current) => ({ ...current, hero: { ...current.hero, startISO: event.target.value } }))} /></label>
        <label className="text-sm font-semibold">Venue<input className="field" value={data.hero.venue} onChange={(event) => patch((current) => ({ ...current, hero: { ...current.hero, venue: event.target.value } }))} /></label>
        <label className="text-sm font-semibold">Theme<input className="field" value={data.hero.theme} onChange={(event) => patch((current) => ({ ...current, hero: { ...current.hero, theme: event.target.value } }))} /></label>
        <label className="text-sm font-semibold">Stats note<textarea className="field min-h-20" value={data.statsDisclaimer} onChange={(event) => patch((current) => ({ ...current, statsDisclaimer: event.target.value }))} /></label>
        {data.stats.map((stat, index) => (
          <div key={stat.label} className="grid gap-2 sm:grid-cols-2">
            <input className="field" aria-label={`Stat ${index + 1} value`} value={stat.value} onChange={(event) => patch((current) => ({ ...current, stats: current.stats.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item) }))} />
            <input className="field" aria-label={`Stat ${index + 1} label`} value={stat.label} onChange={(event) => patch((current) => ({ ...current, stats: current.stats.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) }))} />
          </div>
        ))}
        {data.leadership.people.map((person, index) => (
          <label key={person.name} className="text-sm font-semibold">
            Message — {person.name}
            <textarea className="field min-h-24" value={person.message} onChange={(event) => patch((current) => ({ ...current, leadership: { ...current.leadership, people: current.leadership.people.map((item, itemIndex) => itemIndex === index ? { ...item, message: event.target.value } : item) } }))} />
          </label>
        ))}
        <label className="text-sm font-semibold">Helpdesk email<input className="field" value={data.contact.email} onChange={(event) => patch((current) => ({ ...current, contact: { ...current.contact, email: event.target.value } }))} /></label>
        <label className="text-sm font-semibold">Helpdesk phone<input className="field" value={data.contact.phone} onChange={(event) => patch((current) => ({ ...current, contact: { ...current.contact, phone: event.target.value } }))} /></label>
        <button type="button" className="btn-accent" onClick={() => void save(data).catch((err) => setError(err.message))}>Save content</button>
      </div>
      <details className="card mt-4">
        <summary className="cursor-pointer font-semibold">Edit the full document</summary>
        <p className="mt-2 text-sm text-mute">Use this for agenda, sectors, downloads, news, FAQs, and page text. Keep the same JSON shape.</p>
        <textarea className="field mt-3 min-h-80 font-mono text-xs" value={raw} onChange={(event) => setRaw(event.target.value)} />
        <button
          type="button"
          className="btn-primary mt-3"
          onClick={() => {
            try {
              const parsed = JSON.parse(raw) as SiteContent;
              setData(parsed);
              void save(parsed).catch((err) => setError(err.message));
            } catch {
              setError("The JSON could not be read.");
            }
          }}
        >
          Save full document
        </button>
      </details>
      {message ? <p className="mt-3 text-sm text-navy-900" role="status">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-800" role="alert">{error}</p> : null}
    </div>
  );
}
