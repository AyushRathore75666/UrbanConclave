"use client";

import { useState } from "react";
import type { Ui } from "@/lib/ui";

export function ContactForm({ ui }: { ui: Ui }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/backend/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-MPGIS-Request": "1" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
        companyFax: form.get("companyFax"),
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Unable to send.");
      return;
    }
    setSent(true);
  }

  if (sent) return <p className="card" role="status">{ui.contactForm.sent}</p>;

  return (
    <form onSubmit={onSubmit} className="card grid gap-4" noValidate>
      <label className="text-sm font-semibold">
        {ui.contactForm.name} <span className="text-saffron-700">*</span>
        <input className="field" name="name" required autoComplete="name" />
      </label>
      <label className="text-sm font-semibold">
        {ui.contactForm.email} <span className="text-saffron-700">*</span>
        <input className="field" name="email" type="email" required autoComplete="email" />
      </label>
      <label className="text-sm font-semibold">
        {ui.contactForm.phone}
        <input className="field" name="phone" autoComplete="tel" />
      </label>
      <label className="text-sm font-semibold">
        {ui.contactForm.message} <span className="text-saffron-700">*</span>
        <textarea className="field min-h-32" name="message" required />
      </label>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input name="companyFax" tabIndex={-1} autoComplete="off" />
      </div>
      {error ? <p className="text-sm text-red-800" role="alert">{error}</p> : null}
      <button className="btn-primary" type="submit" disabled={pending}>{ui.contactForm.send}</button>
    </form>
  );
}
