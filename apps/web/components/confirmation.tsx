"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { Ui } from "@/lib/ui";

function ConfirmationBody({ ui }: { ui: Ui }) {
  const params = useSearchParams();
  const [reference, setReference] = useState(params.get("ref") || "");
  const [note, setNote] = useState("");

  useEffect(() => {
    const raw = window.sessionStorage.getItem("mpgis-last");
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { referenceNumber?: string; notifications?: { email?: string } };
      if (data.referenceNumber) setReference(data.referenceNumber);
      if (data.notifications?.email === "outbox") setNote(ui.confirmation.localNote);
    } catch {
      /* keep the query reference */
    }
  }, [ui.confirmation.localNote]);

  return (
    <section className="page py-16">
      <p className="kicker">MP Conclave GIS</p>
      <h1 className="mt-3 font-serif text-4xl text-navy-950">{ui.confirmation.title}</h1>
      <p className="mt-4 max-w-2xl text-mute">{ui.confirmation.body}</p>
      <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-mute">{ui.confirmation.reference}</p>
      <p className="mt-1 font-serif text-3xl text-navy-900">{reference}</p>
      {note ? <p className="mt-4 max-w-2xl text-sm text-mute">{note}</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/status" className="btn-primary">{ui.confirmation.statusLink}</Link>
        <Link href="/invest" className="btn-line">{ui.confirmation.another}</Link>
      </div>
    </section>
  );
}

export function Confirmation({ ui }: { ui: Ui }) {
  return (
    <Suspense fallback={<section className="page py-16">…</section>}>
      <ConfirmationBody ui={ui} />
    </Suspense>
  );
}
