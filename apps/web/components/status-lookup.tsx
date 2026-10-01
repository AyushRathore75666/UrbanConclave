"use client";

import { useState } from "react";
import type { Ui } from "@/lib/ui";

const STATUS: Record<string, string> = {
  RECEIVED: "Received",
  UNDER_REVIEW: "Under review",
  CONTACTED: "Contacted",
  MEETING_SCHEDULED: "Meeting scheduled",
  CLOSED: "Closed",
};

export function StatusLookup({ ui }: { ui: Ui }) {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ referenceNumber: string; status: string; companyName: string; sectors: string[] } | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setResult(null);
    const response = await fetch("/backend/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-MPGIS-Request": "1" },
      body: JSON.stringify({ reference, email }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Not found.");
      return;
    }
    setResult(data);
  }

  return (
    <section className="page max-w-3xl py-12">
      <form onSubmit={onSubmit} className="card grid gap-4">
        <label className="text-sm font-semibold">
          {ui.status.reference} <span className="text-saffron-700">*</span>
          <input className="field" value={reference} onChange={(event) => setReference(event.target.value)} required />
        </label>
        <label className="text-sm font-semibold">
          {ui.status.email} <span className="text-saffron-700">*</span>
          <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        {error ? <p className="text-sm text-red-800" role="alert">{error}</p> : null}
        <button className="btn-primary" type="submit">{ui.status.lookup}</button>
      </form>
      {result ? (
        <div className="card mt-4" role="status">
          <p className="text-sm text-mute">{ui.status.result}</p>
          <p className="mt-1 font-serif text-2xl text-navy-900">{result.referenceNumber}</p>
          <p className="mt-2 font-semibold">{STATUS[result.status] || result.status}</p>
          <p className="mt-2 text-sm text-mute">{result.companyName}</p>
          <p className="text-sm text-mute">{result.sectors.join(", ")}</p>
        </div>
      ) : null}
    </section>
  );
}
