"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Ui } from "@/lib/ui";

type Option = { slug: string; title: string };
type Draft = {
  contactName: string;
  designation: string;
  companyName: string;
  sector: string;
  email: string;
  mobile: string;
  city: string;
  stateRegion: string;
  website: string;
  attendingAs: string;
  sessions: string[];
  hcmRequested: "yes" | "no" | "";
  hcmOrganization: string;
  hcmSector: string;
  hcmAmount: string;
  hcmLocation: string;
  hcmAgenda: string;
};

const EMPTY: Draft = {
  contactName: "",
  designation: "",
  companyName: "",
  sector: "",
  email: "",
  mobile: "",
  city: "",
  stateRegion: "",
  website: "",
  attendingAs: "",
  sessions: [],
  hcmRequested: "",
  hcmOrganization: "",
  hcmSector: "",
  hcmAmount: "",
  hcmLocation: "",
  hcmAgenda: "",
};

const DRAFT_KEY = "ugc2026-registration-v1";

function words(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function InvestForm({
  ui,
  sectors,
  panels,
  disclaimer,
  hcmNote,
  initialSession,
  requestHcm,
}: {
  ui: Ui;
  sectors: Option[];
  panels: Option[];
  disclaimer: string;
  hcmNote: string;
  initialSession?: string;
  requestHcm?: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [updatesConsent, setUpdatesConsent] = useState(false);
  const [captcha, setCaptcha] = useState<{ id: string; question: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(DRAFT_KEY);
    let next = { ...EMPTY };
    if (saved) {
      try {
        next = { ...EMPTY, ...(JSON.parse(saved) as Draft) };
      } catch {
        next = { ...EMPTY };
      }
    }
    const allowed = new Set(["plenary", ...panels.map((panel) => panel.slug)]);
    if (initialSession && allowed.has(initialSession) && !next.sessions.includes(initialSession)) {
      next.sessions = [...next.sessions, initialSession];
    }
    if (requestHcm) next.hcmRequested = "yes";
    setDraft(next);
  }, [initialSession, panels, requestHcm]);

  useEffect(() => {
    void loadCaptcha();
  }, []);

  const agendaWords = useMemo(() => words(draft.hcmAgenda), [draft.hcmAgenda]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const next: Record<string, string> = {};
    const need = (key: keyof Draft) => {
      const value = draft[key];
      if (typeof value === "string" && !value.trim()) next[key] = ui.form.required;
    };
    need("contactName");
    need("designation");
    need("companyName");
    need("sector");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) next.email = ui.form.required;
    if (draft.mobile.replace(/\D/g, "").length < 10) next.mobile = ui.form.required;
    need("city");
    need("stateRegion");
    need("attendingAs");
    if (draft.hcmRequested !== "yes" && draft.hcmRequested !== "no") next.hcmRequested = ui.form.required;
    if (draft.hcmRequested === "yes") {
      need("hcmOrganization");
      need("hcmSector");
      need("hcmLocation");
      need("hcmAgenda");
      if (!draft.hcmAmount || Number(draft.hcmAmount) <= 0) next.hcmAmount = ui.form.required;
      if (words(draft.hcmAgenda) > 150) next.hcmAgenda = ui.form.wordLimit;
    }
    if (!consent) next.consent = ui.form.required;
    if (!updatesConsent) next.updatesConsent = ui.form.required;
    if (!captchaAnswer.trim()) next.captcha = ui.form.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function loadCaptcha() {
    const response = await fetch("/backend/api/captcha");
    const data = await response.json();
    if (data.mode === "math") setCaptcha({ id: data.id, question: data.question });
  }

  async function submit() {
    if (!validate()) return;
    setPending(true);
    setFormError("");
    const hcm = draft.hcmRequested === "yes";
    const payload = {
      contactName: draft.contactName,
      designation: draft.designation,
      companyName: draft.companyName,
      sector: draft.sector,
      email: draft.email,
      mobile: draft.mobile,
      city: draft.city,
      stateRegion: draft.stateRegion,
      website: draft.website,
      attendingAs: draft.attendingAs,
      sessions: draft.sessions,
      hcmRequested: hcm,
      hcmOrganization: hcm ? draft.hcmOrganization : "",
      hcmSector: hcm ? draft.hcmSector : "",
      hcmAmount: hcm ? Number(draft.hcmAmount) : undefined,
      hcmLocation: hcm ? draft.hcmLocation : "",
      hcmAgenda: hcm ? draft.hcmAgenda : "",
      consent: true,
      updatesConsent: true,
      captchaId: captcha?.id || "",
      captchaAnswer,
      companyFax: "",
    };
    const body = new FormData();
    body.set("payload", JSON.stringify(payload));
    const response = await fetch("/backend/api/submissions", {
      method: "POST",
      headers: { "X-MPGIS-Request": "1" },
      body,
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setFormError(data.error || "Unable to submit.");
      if (data.fields) setErrors((current) => ({ ...current, ...data.fields }));
      void loadCaptcha();
      return;
    }
    window.localStorage.removeItem(DRAFT_KEY);
    window.sessionStorage.setItem("mpgis-last", JSON.stringify(data));
    router.push(`/invest/confirmation?ref=${encodeURIComponent(data.referenceNumber)}`);
  }

  return (
    <section className="page py-10">
      <form
        className="card grid gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
          void submit();
        }}
      >
        <fieldset className="grid gap-4">
          <legend className="font-serif text-2xl text-navy-950">{ui.form.professional}</legend>
          <Field label={ui.form.fullName} id="fullName" required error={errors.contactName}>
            <input id="fullName" className="field" value={draft.contactName} onChange={(event) => update("contactName", event.target.value)} autoComplete="name" required />
          </Field>
          <Field label={ui.form.designation} id="designation" required error={errors.designation}>
            <input id="designation" className="field" placeholder={ui.form.designationHint} value={draft.designation} onChange={(event) => update("designation", event.target.value)} required />
          </Field>
          <Field label={ui.form.organization} id="organization" required error={errors.companyName}>
            <input id="organization" className="field" value={draft.companyName} onChange={(event) => update("companyName", event.target.value)} required />
          </Field>
          <Field label={ui.form.sectors} id="sector" required error={errors.sector}>
            <select id="sector" className="field" value={draft.sector} onChange={(event) => update("sector", event.target.value)} required>
              <option value="">{ui.form.selectSector}</option>
              {sectors.map((sector) => (
                <option key={sector.slug} value={sector.slug}>{sector.title}</option>
              ))}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={ui.form.email} id="email" required error={errors.email}>
              <input id="email" type="email" className="field" value={draft.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" required />
            </Field>
            <Field label={ui.form.mobile} id="mobile" required error={errors.mobile}>
              <input id="mobile" className="field" value={draft.mobile} onChange={(event) => update("mobile", event.target.value)} autoComplete="tel" required />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={ui.form.city} id="city" required error={errors.city}>
              <input id="city" className="field" value={draft.city} onChange={(event) => update("city", event.target.value)} required />
            </Field>
            <Field label={ui.form.state} id="state" required error={errors.stateRegion}>
              <select id="state" className="field" value={draft.stateRegion} onChange={(event) => update("stateRegion", event.target.value)} required>
                <option value="">{ui.form.selectState}</option>
                {ui.form.states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label={ui.form.website} id="website">
            <input id="website" className="field" placeholder={ui.form.websiteHint} value={draft.website} onChange={(event) => update("website", event.target.value)} />
          </Field>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="font-serif text-2xl text-navy-950">{ui.form.participation}</legend>
          <Field label={ui.form.attending} id="attendingAs" required error={errors.attendingAs}>
            <select id="attendingAs" className="field" value={draft.attendingAs} onChange={(event) => update("attendingAs", event.target.value)} required>
              <option value="">{ui.form.selectAttending}</option>
              {Object.entries(ui.form.attendingOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <div>
            <p className="text-sm font-semibold text-navy-900">{ui.form.sessions}</p>
            <p className="mt-1 text-xs text-mute">{ui.form.sessionsHint}</p>
            <div className="mt-3 grid gap-2">
              <Session
                checked={draft.sessions.includes("plenary")}
                label={ui.form.plenary}
                onChange={(checked) => update("sessions", checked ? [...draft.sessions, "plenary"] : draft.sessions.filter((item) => item !== "plenary"))}
              />
              {panels.map((panel, index) => (
                <Session
                  key={panel.slug}
                  checked={draft.sessions.includes(panel.slug)}
                  label={`${ui.form.panel} ${index + 1}: ${panel.title}`}
                  onChange={(checked) => update("sessions", checked ? [...draft.sessions, panel.slug] : draft.sessions.filter((item) => item !== panel.slug))}
                />
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="font-serif text-2xl text-navy-950">{ui.form.hcmTitle}</legend>
          <p className="text-sm font-semibold text-navy-900">
            {ui.form.hcmQuestion} <span className="text-saffron-700">*</span>
          </p>
          <div className="flex gap-6 text-sm">
            {(["yes", "no"] as const).map((value) => (
              <label key={value} className="inline-flex items-center gap-2">
                <input type="radio" name="hcm" checked={draft.hcmRequested === value} onChange={() => update("hcmRequested", value)} />
                {value === "yes" ? ui.form.yes : ui.form.no}
              </label>
            ))}
          </div>
          {errors.hcmRequested ? <p className="text-sm text-red-800">{errors.hcmRequested}</p> : null}
          {draft.hcmRequested === "yes" ? (
            <div className="grid gap-4">
              <p className="text-sm font-semibold text-navy-900">{ui.form.hcmIfYes}</p>
              <Field label={ui.form.hcmOrg} id="hcmOrganization" required error={errors.hcmOrganization}>
                <input id="hcmOrganization" className="field" value={draft.hcmOrganization} onChange={(event) => update("hcmOrganization", event.target.value)} required />
              </Field>
              <Field label={ui.form.hcmSector} id="hcmSector" required error={errors.hcmSector}>
                <input id="hcmSector" className="field" value={draft.hcmSector} onChange={(event) => update("hcmSector", event.target.value)} required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={ui.form.hcmAmount} id="hcmAmount" required error={errors.hcmAmount}>
                  <input id="hcmAmount" className="field" inputMode="decimal" value={draft.hcmAmount} onChange={(event) => update("hcmAmount", event.target.value)} required />
                </Field>
                <Field label={ui.form.hcmLocation} id="hcmLocation" required error={errors.hcmLocation}>
                  <input id="hcmLocation" className="field" value={draft.hcmLocation} onChange={(event) => update("hcmLocation", event.target.value)} required />
                </Field>
              </div>
              <Field label={ui.form.hcmAgenda} id="hcmAgenda" required error={errors.hcmAgenda}>
                <textarea id="hcmAgenda" className="field min-h-32" value={draft.hcmAgenda} onChange={(event) => update("hcmAgenda", event.target.value)} required />
                <span className={`mt-1 block text-xs ${agendaWords > 150 ? "text-red-800" : "text-mute"}`}>{agendaWords}/150 {ui.form.words}</span>
              </Field>
            </div>
          ) : null}
          <p className="rounded-xl bg-sand px-4 py-3 text-sm leading-relaxed text-navy-900">{hcmNote}</p>
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="font-serif text-2xl text-navy-950">{ui.form.confirmationTitle}</legend>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
            <span>{ui.form.confirmInfo} <span className="text-saffron-700">*</span></span>
          </label>
          {errors.consent ? <p className="text-sm text-red-800">{errors.consent}</p> : null}
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={updatesConsent} onChange={(event) => setUpdatesConsent(event.target.checked)} required />
            <span>{ui.form.updates} <span className="text-saffron-700">*</span></span>
          </label>
          {errors.updatesConsent ? <p className="text-sm text-red-800">{errors.updatesConsent}</p> : null}
          <p className="text-sm leading-relaxed text-mute">{disclaimer}</p>
          <Field label={ui.form.captcha} id="captcha" required error={errors.captcha}>
            <p className="mt-1 text-sm">{captcha?.question}</p>
            <input id="captcha" className="field" value={captchaAnswer} onChange={(event) => setCaptchaAnswer(event.target.value)} required />
            <button type="button" className="mt-2 text-sm font-semibold text-saffron-700" onClick={() => void loadCaptcha()}>{ui.form.refresh}</button>
          </Field>
          <p className="text-xs text-mute">
            <Link href="/privacy" className="font-semibold text-navy-900 underline">{ui.footer.privacy}</Link>
          </p>
        </fieldset>

        {formError ? <p className="text-sm text-red-800" role="alert">{formError}</p> : null}
        <button type="submit" className="btn-accent w-full sm:w-auto" disabled={pending}>
          {pending ? ui.form.submitting : ui.form.submit}
        </button>
      </form>
    </section>
  );
}

function Session({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" className="mt-1" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Field({
  label,
  id,
  required,
  error,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-navy-900">
        {label} {required ? <span className="text-saffron-700">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-sm text-red-800">{error}</p> : null}
    </div>
  );
}
