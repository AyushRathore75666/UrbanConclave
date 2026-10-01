"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Ui } from "@/lib/ui";

type Sector = { slug: string; title: string };
type Draft = {
  companyName: string;
  orgType: string;
  country: string;
  address: string;
  city: string;
  stateRegion: string;
  pinCode: string;
  website: string;
  registrationNumber: string;
  contactName: string;
  designation: string;
  email: string;
  mobile: string;
  sectors: string[];
  amountValue: string;
  amountUnit: "INR_CRORE" | "USD_MILLION";
  district: string;
  landAcres: string;
  expectedEmployment: string;
  timeline: string;
  description: string;
  supportNeeded: string[];
};

const EMPTY: Draft = {
  companyName: "",
  orgType: "PRIVATE",
  country: "",
  address: "",
  city: "",
  stateRegion: "",
  pinCode: "",
  website: "",
  registrationNumber: "",
  contactName: "",
  designation: "",
  email: "",
  mobile: "",
  sectors: [],
  amountValue: "",
  amountUnit: "INR_CRORE",
  district: "",
  landAcres: "",
  expectedEmployment: "",
  timeline: "",
  description: "",
  supportNeeded: [],
};

const DRAFT_KEY = "mpgis-draft-v1";

export function InvestForm({ ui, sectors, initialSector }: { ui: Ui; sectors: Sector[]; initialSector?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [districts, setDistricts] = useState<string[]>([]);
  const [emailToken, setEmailToken] = useState("");
  const [mobileToken, setMobileToken] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [mobileCode, setMobileCode] = useState("");
  const [emailDev, setEmailDev] = useState("");
  const [mobileDev, setMobileDev] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [captcha, setCaptcha] = useState<{ id: string; question: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Draft;
        setDraft({ ...EMPTY, ...parsed, sectors: initialSector && !parsed.sectors?.length ? [initialSector] : parsed.sectors || [] });
        return;
      } catch {
        /* ignore broken drafts */
      }
    }
    if (initialSector) setDraft((current) => ({ ...current, sectors: [initialSector] }));
  }, [initialSector]);

  useEffect(() => {
    fetch("/backend/api/meta")
      .then((response) => response.json())
      .then((data) => setDistricts(data.districts || []))
      .catch(() => setDistricts([]));
  }, []);

  useEffect(() => {
    if (step === 3) void loadCaptcha();
  }, [step]);

  const progress = useMemo(() => Math.round(((step + 1) / 4) * 100), [step]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function saveDraft() {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setNotice(ui.form.saved);
  }

  function validate(index: number) {
    const next: Record<string, string> = {};
    const need = (key: keyof Draft, message = ui.form.required) => {
      const value = draft[key];
      if (typeof value === "string" && !value.trim()) next[key] = message;
      if (Array.isArray(value) && value.length === 0) next[key] = message;
    };
    if (index === 0) {
      need("companyName");
      need("orgType");
      need("country");
      need("address");
      need("city");
      need("stateRegion");
      need("pinCode");
    }
    if (index === 1) {
      need("contactName");
      need("designation");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) next.email = ui.form.required;
      if (draft.mobile.replace(/\D/g, "").length < 10) next.mobile = ui.form.required;
      if (!emailToken) next.email = ui.form.verify;
      if (!mobileToken) next.mobile = ui.form.verify;
    }
    if (index === 2) {
      if (draft.sectors.length === 0) next.sectors = ui.form.required;
      if (!draft.amountValue || Number(draft.amountValue) <= 0) next.amountValue = ui.form.required;
      need("timeline");
      if (draft.description.trim().length < 20) next.description = ui.form.required;
      if (draft.description.length > 1500) next.description = "1500";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function sendCode(channel: "email" | "sms") {
    setFormError("");
    const target = channel === "email" ? draft.email : draft.mobile;
    const response = await fetch("/backend/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-MPGIS-Request": "1" },
      body: JSON.stringify({ channel, target }),
    });
    const data = await response.json();
    if (!response.ok) {
      setFormError(data.error || "Unable to send the code.");
      return;
    }
    if (channel === "email") setEmailDev(data.devCode || "");
    else setMobileDev(data.devCode || "");
  }

  async function verifyCode(channel: "email" | "sms") {
    setFormError("");
    const target = channel === "email" ? draft.email : draft.mobile;
    const code = channel === "email" ? emailCode : mobileCode;
    const response = await fetch("/backend/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-MPGIS-Request": "1" },
      body: JSON.stringify({ channel, target, code }),
    });
    const data = await response.json();
    if (!response.ok) {
      setFormError(data.error || "Unable to verify the code.");
      return;
    }
    if (channel === "email") setEmailToken(data.token);
    else setMobileToken(data.token);
  }

  async function loadCaptcha() {
    const response = await fetch("/backend/api/captcha");
    const data = await response.json();
    if (data.mode === "math") setCaptcha({ id: data.id, question: data.question });
  }

  function onFile(selected: File | null) {
    setFile(null);
    setErrors((current) => ({ ...current, file: "" }));
    if (!selected) return;
    const name = selected.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) {
      setErrors((current) => ({ ...current, file: "PDF or DOCX" }));
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setErrors((current) => ({ ...current, file: "10 MB" }));
      return;
    }
    setFile(selected);
  }

  async function submit() {
    if (!consent) {
      setErrors({ consent: ui.form.required });
      return;
    }
    if (!captchaAnswer.trim()) {
      setErrors({ captcha: ui.form.required });
      return;
    }
    setPending(true);
    setFormError("");
    const payload = {
      ...draft,
      amountValue: Number(draft.amountValue),
      landAcres: draft.landAcres ? Number(draft.landAcres) : null,
      expectedEmployment: draft.expectedEmployment ? Number(draft.expectedEmployment) : null,
      emailOtpToken: emailToken,
      mobileOtpToken: mobileToken,
      captchaId: captcha?.id || "",
      captchaAnswer,
      consent: true,
      companyFax: "",
    };
    const body = new FormData();
    body.set("payload", JSON.stringify(payload));
    if (file) body.set("document", file);
    const response = await fetch("/backend/api/submissions", {
      method: "POST",
      headers: { "X-MPGIS-Request": "1" },
      body,
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setFormError(data.error || "Unable to submit.");
      if (data.fields) setErrors(data.fields);
      void loadCaptcha();
      return;
    }
    window.localStorage.removeItem(DRAFT_KEY);
    window.sessionStorage.setItem("mpgis-last", JSON.stringify(data));
    router.push(`/invest/confirmation?ref=${encodeURIComponent(data.referenceNumber)}`);
  }

  return (
    <section className="page py-10">
      <nav aria-label={ui.form.progress}>
        <ol className="grid grid-cols-4 gap-2">
          {ui.form.steps.map((label, index) => (
            <li key={label} aria-current={index === step ? "step" : undefined}>
              <p className={`text-xs font-semibold ${index === step ? "text-saffron-700" : "text-mute"}`}>
                {ui.form.step} {index + 1}
              </p>
              <p className="text-sm font-semibold text-navy-900">{label}</p>
            </li>
          ))}
        </ol>
        <div className="mt-3 h-2 rounded-full bg-navy-900/10" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} aria-label={ui.form.progress}>
          <div className="h-2 rounded-full bg-saffron-700" style={{ width: `${progress}%` }} />
        </div>
      </nav>

      <form
        className="card mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 3) {
            if (validate(step)) setStep(step + 1);
            return;
          }
          void submit();
        }}
      >
        {step === 0 ? (
          <>
            <Field label={ui.form.companyName} id="companyName" required error={errors.companyName}>
              <input id="companyName" className="field" value={draft.companyName} onChange={(event) => update("companyName", event.target.value)} required />
            </Field>
            <Field label={ui.form.orgType} id="orgType" required error={errors.orgType}>
              <select id="orgType" className="field" value={draft.orgType} onChange={(event) => update("orgType", event.target.value)}>
                {Object.entries(ui.form.org).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label={ui.form.country} id="country" required error={errors.country}>
              <input id="country" className="field" value={draft.country} onChange={(event) => update("country", event.target.value)} required />
            </Field>
            <Field label={ui.form.address} id="address" required error={errors.address}>
              <input id="address" className="field" value={draft.address} onChange={(event) => update("address", event.target.value)} required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={ui.form.city} id="city" required error={errors.city}>
                <input id="city" className="field" value={draft.city} onChange={(event) => update("city", event.target.value)} required />
              </Field>
              <Field label={ui.form.state} id="stateRegion" required error={errors.stateRegion}>
                <input id="stateRegion" className="field" value={draft.stateRegion} onChange={(event) => update("stateRegion", event.target.value)} required />
              </Field>
              <Field label={ui.form.pin} id="pinCode" required error={errors.pinCode}>
                <input id="pinCode" className="field" value={draft.pinCode} onChange={(event) => update("pinCode", event.target.value)} required />
              </Field>
            </div>
            <Field label={ui.form.website} id="website">
              <input id="website" className="field" value={draft.website} onChange={(event) => update("website", event.target.value)} />
            </Field>
            <Field label={ui.form.cin} id="registrationNumber">
              <input id="registrationNumber" className="field" value={draft.registrationNumber} onChange={(event) => update("registrationNumber", event.target.value)} />
            </Field>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Field label={ui.form.fullName} id="contactName" required error={errors.contactName}>
              <input id="contactName" className="field" value={draft.contactName} onChange={(event) => update("contactName", event.target.value)} autoComplete="name" required />
            </Field>
            <Field label={ui.form.designation} id="designation" required error={errors.designation}>
              <input id="designation" className="field" value={draft.designation} onChange={(event) => update("designation", event.target.value)} required />
            </Field>
            <Field label={ui.form.email} id="email" required error={errors.email}>
              <input id="email" type="email" className="field" value={draft.email} onChange={(event) => { update("email", event.target.value); setEmailToken(""); }} autoComplete="email" required />
            </Field>
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-sm font-semibold">
                {ui.form.code}
                <input className="field" inputMode="numeric" value={emailCode} onChange={(event) => setEmailCode(event.target.value)} aria-label={ui.form.code} />
              </label>
              <button type="button" className="btn-line" onClick={() => void sendCode("email")}>{ui.form.sendCode}</button>
              <button type="button" className="btn-primary" onClick={() => void verifyCode("email")}>{ui.form.verify}</button>
              {emailToken ? <span className="text-sm font-semibold text-navy-900">{ui.form.verified}</span> : null}
            </div>
            {emailDev ? <p className="rounded-md bg-sand px-3 py-2 text-sm" role="status">{ui.form.devCode} <strong>{emailDev}</strong></p> : null}
            <Field label={ui.form.mobile} id="mobile" required error={errors.mobile}>
              <input id="mobile" className="field" value={draft.mobile} onChange={(event) => { update("mobile", event.target.value); setMobileToken(""); }} autoComplete="tel" required />
            </Field>
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-sm font-semibold">
                {ui.form.code}
                <input className="field" inputMode="numeric" value={mobileCode} onChange={(event) => setMobileCode(event.target.value)} aria-label={`${ui.form.mobile} ${ui.form.code}`} />
              </label>
              <button type="button" className="btn-line" onClick={() => void sendCode("sms")}>{ui.form.sendCode}</button>
              <button type="button" className="btn-primary" onClick={() => void verifyCode("sms")}>{ui.form.verify}</button>
              {mobileToken ? <span className="text-sm font-semibold text-navy-900">{ui.form.verified}</span> : null}
            </div>
            {mobileDev ? <p className="rounded-md bg-sand px-3 py-2 text-sm" role="status">{ui.form.devCode} <strong>{mobileDev}</strong></p> : null}
          </>
        ) : null}

        {step === 2 ? (
          <>
            <fieldset>
              <legend className="text-sm font-semibold">{ui.form.sectors} <span className="text-saffron-700">*</span></legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {sectors.map((sector) => {
                  const selected = draft.sectors.includes(sector.slug);
                  return (
                    <label key={sector.slug} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${selected ? "border-navy-900 bg-navy-900 text-white" : "border-navy-900/20 bg-white"}`}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        onChange={() => {
                          update(
                            "sectors",
                            selected ? draft.sectors.filter((item) => item !== sector.slug) : [...draft.sectors, sector.slug],
                          );
                        }}
                      />
                      {sector.title}
                    </label>
                  );
                })}
              </div>
              {errors.sectors ? <p className="mt-1 text-sm text-red-800">{errors.sectors}</p> : null}
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={ui.form.amount} id="amountValue" required error={errors.amountValue}>
                <input id="amountValue" className="field" inputMode="decimal" value={draft.amountValue} onChange={(event) => update("amountValue", event.target.value)} required />
              </Field>
              <Field label={ui.form.unit} id="amountUnit" required>
                <select id="amountUnit" className="field" value={draft.amountUnit} onChange={(event) => update("amountUnit", event.target.value as Draft["amountUnit"])}>
                  <option value="INR_CRORE">{ui.form.inr}</option>
                  <option value="USD_MILLION">{ui.form.usd}</option>
                </select>
              </Field>
            </div>
            <Field label={ui.form.district} id="district">
              <select id="district" className="field" value={draft.district} onChange={(event) => update("district", event.target.value)}>
                <option value="">—</option>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={ui.form.land} id="landAcres">
                <input id="landAcres" className="field" inputMode="decimal" value={draft.landAcres} onChange={(event) => update("landAcres", event.target.value)} />
              </Field>
              <Field label={ui.form.jobs} id="expectedEmployment">
                <input id="expectedEmployment" className="field" inputMode="numeric" value={draft.expectedEmployment} onChange={(event) => update("expectedEmployment", event.target.value)} />
              </Field>
            </div>
            <Field label={ui.form.timeline} id="timeline" required error={errors.timeline}>
              <select id="timeline" className="field" value={draft.timeline} onChange={(event) => update("timeline", event.target.value)} required>
                <option value="">—</option>
                {Object.entries(ui.form.timelines).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label={ui.form.description} id="description" required error={errors.description}>
              <textarea id="description" className="field min-h-36" maxLength={1500} value={draft.description} onChange={(event) => update("description", event.target.value)} required />
              <span className="mt-1 block text-xs text-mute">{draft.description.length}/1500 {ui.form.chars}</span>
            </Field>
            <fieldset>
              <legend className="text-sm font-semibold">{ui.form.support}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {Object.entries(ui.form.supportOptions).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.supportNeeded.includes(value)}
                      onChange={() => {
                        update(
                          "supportNeeded",
                          draft.supportNeeded.includes(value)
                            ? draft.supportNeeded.filter((item) => item !== value)
                            : [...draft.supportNeeded, value],
                        );
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Field label={ui.form.upload} id="document" error={errors.file}>
              <input
                id="document"
                className="field"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => onFile(event.target.files?.[0] || null)}
              />
              <span className="mt-1 block text-xs text-mute">{ui.form.uploadHint}</span>
            </Field>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
              <span>
                {ui.form.consent} <span className="text-saffron-700">*</span>{" "}
                <Link href="/privacy" className="font-semibold text-navy-900 underline">privacy</Link>
              </span>
            </label>
            {errors.consent ? <p className="text-sm text-red-800">{errors.consent}</p> : null}
            <Field label={ui.form.captcha} id="captcha" required error={errors.captcha}>
              <p className="mt-1 text-sm">{captcha?.question}</p>
              <input id="captcha" className="field" value={captchaAnswer} onChange={(event) => setCaptchaAnswer(event.target.value)} required />
              <button type="button" className="mt-2 text-sm font-semibold text-saffron-700" onClick={() => void loadCaptcha()}>{ui.form.refresh}</button>
            </Field>
          </>
        ) : null}

        {notice ? <p className="text-sm text-navy-900" role="status">{notice}</p> : null}
        {formError ? <p className="text-sm text-red-800" role="alert">{formError}</p> : null}

        <div className="flex flex-wrap gap-3">
          {step > 0 ? (
            <button type="button" className="btn-line" onClick={() => setStep(step - 1)}>{ui.form.back}</button>
          ) : null}
          <button type="button" className="btn-line" onClick={saveDraft}>{ui.form.save}</button>
          {step < 3 ? (
            <button type="submit" className="btn-primary">{ui.form.continue}</button>
          ) : (
            <button type="submit" className="btn-accent" disabled={pending}>{pending ? ui.form.submitting : ui.form.submit}</button>
          )}
        </div>
      </form>
    </section>
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
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
