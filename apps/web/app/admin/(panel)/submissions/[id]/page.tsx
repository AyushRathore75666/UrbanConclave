"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminFetch, adminJson, type AdminUser } from "@/lib/admin";

type Note = { id: string; body: string; createdAt: string; author: string; role: string };
type Lead = {
  id: string;
  referenceNumber: string;
  status: string;
  companyName: string;
  orgType: string;
  country: string;
  city: string;
  contactName: string;
  designation: string;
  email: string;
  mobile: string;
  sectors: string[];
  amountValue: number;
  amountUnit: string;
  district: string | null;
  landAcres: number | null;
  expectedEmployment: number | null;
  timeline: string;
  description: string;
  supportNeeded: string[];
  hasDocument: boolean;
  scanResult: string | null;
  assignedTo: { id: string; name: string } | null;
  notes: Note[];
  isSample: boolean;
  cmVisitFixed: boolean;
  attendingAs?: string;
  sessions?: string[];
  hcmRequested?: boolean;
  hcmOrganization?: string | null;
  hcmSector?: string | null;
  hcmAmount?: number | null;
  hcmLocation?: string | null;
  hcmAgenda?: string | null;
};

const STATUSES = ["RECEIVED", "UNDER_REVIEW", "CONTACTED", "MEETING_SCHEDULED", "CLOSED"];

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [officers, setOfficers] = useState<Array<{ id: string; name: string }>>([]);
  const [me, setMe] = useState<AdminUser | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [savingVisit, setSavingVisit] = useState(false);

  async function load() {
    const data = await adminJson<Lead>(`/api/admin/submissions/${params.id}`);
    setLead(data);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
    adminJson<AdminUser>("/api/admin/me").then(setMe).catch(() => undefined);
    adminJson<Array<{ id: string; name: string }>>("/api/admin/officers").then(setOfficers).catch(() => setOfficers([]));
  }, [params.id]);

  const canEdit = me?.role === "SUPER_ADMIN" || me?.role === "INVESTMENT_TEAM";

  async function save(patch: { status?: string; assignedToId?: string | null; cmVisitFixed?: boolean }) {
    const updated = await adminJson<Lead>(`/api/admin/submissions/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    setLead({ ...updated, notes: lead?.notes || [] });
  }

  async function setVisit(fixed: boolean) {
    if (!lead || lead.cmVisitFixed === fixed) return;
    setSavingVisit(true);
    try {
      await save({ cmVisitFixed: fixed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the CM visit.");
    } finally {
      setSavingVisit(false);
    }
  }

  async function addNote() {
    await adminJson(`/api/admin/submissions/${params.id}/notes`, { method: "POST", body: JSON.stringify({ body: note }) });
    setNote("");
    await load();
  }

  async function download() {
    const response = await adminFetch(`/api/admin/submissions/${params.id}/document`);
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "project-file";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (error) return <p className="text-red-800">{error}</p>;
  if (!lead) return <p>Loading interest…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <article className="card">
        <p className="text-sm text-mute">{lead.isSample ? "Sample record" : "Investor submission"}</p>
        <h1 className="font-serif text-3xl text-navy-950">{lead.referenceNumber}</h1>
        <h2 className="mt-2 text-xl font-semibold">{lead.companyName}</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Status" value={lead.status.replaceAll("_", " ")} />
          <Item label="Organisation" value={lead.orgType} />
          <Item label="Country" value={lead.country} />
          <Item label="City" value={lead.city} />
          <Item label="Contact" value={`${lead.contactName}, ${lead.designation}`} />
          <Item label="Email" value={lead.email} />
          <Item label="Mobile" value={lead.mobile} />
          <Item label="Attending as" value={lead.attendingAs || "—"} />
          <Item label="Sessions" value={lead.sessions?.join(", ") || "—"} />
          <Item label="HCM meeting" value={lead.hcmRequested ? "Requested" : "No"} />
          <Item label="HCM organisation" value={lead.hcmOrganization || "—"} />
          <Item label="HCM sector" value={lead.hcmSector || "—"} />
          <Item label="HCM amount (₹ crore)" value={lead.hcmAmount == null ? "—" : String(lead.hcmAmount)} />
          <Item label="HCM location" value={lead.hcmLocation || "—"} />
          <Item label="Sectors" value={lead.sectors.join(", ")} />
          <Item label="Amount" value={`${lead.amountValue} ${lead.amountUnit}`} />
          <Item label="District" value={lead.district || "—"} />
          <Item label="Land (acres)" value={lead.landAcres == null ? "—" : String(lead.landAcres)} />
          <Item label="Employment" value={lead.expectedEmployment == null ? "—" : String(lead.expectedEmployment)} />
          <Item label="Timeline" value={lead.timeline} />
          <Item label="Support" value={lead.supportNeeded.join(", ") || "—"} />
          <Item label="Scan" value={lead.scanResult || "No file"} />
        </dl>
        {lead.hcmAgenda ? (
          <>
            <h3 className="mt-6 font-semibold">Meeting agenda</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-mute">{lead.hcmAgenda}</p>
          </>
        ) : null}
        <h3 className="mt-6 font-semibold">Project description</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-mute">{lead.description}</p>
        {lead.hasDocument && canEdit ? (
          <button type="button" className="btn-line mt-4" onClick={() => void download()}>Download attachment</button>
        ) : null}
      </article>
      <aside className="space-y-4">
        <form
          className="card grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void save({
              status: String(form.get("status")),
              assignedToId: String(form.get("assignedToId") || "") || null,
            }).catch((err) => setError(err.message));
          }}
        >
          <label className="text-sm font-semibold">
            Status
            <select name="status" className="field" defaultValue={lead.status} disabled={!canEdit}>
              {STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Assigned officer
            <select name="assignedToId" className="field" defaultValue={lead.assignedTo?.id || ""} disabled={!canEdit}>
              <option value="">Unassigned</option>
              {officers.map((officer) => <option key={officer.id} value={officer.id}>{officer.name}</option>)}
            </select>
          </label>
          {canEdit ? <button className="btn-primary" type="submit">Save</button> : <p className="text-sm text-mute">View only</p>}
        </form>
        <section className="card">
          <h2 className="font-semibold">Visit with the CM</h2>
          <div className="mt-3 flex items-center gap-4" role="radiogroup" aria-label="Visit with CM">
            <label className="inline-flex items-center gap-1.5">
              <input type="radio" name="cm-visit" checked={!lead.cmVisitFixed} disabled={!canEdit || savingVisit} onChange={() => void setVisit(false)} />
              Off
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input type="radio" name="cm-visit" checked={lead.cmVisitFixed} disabled={!canEdit || savingVisit} onChange={() => void setVisit(true)} />
              On
            </label>
          </div>
        </section>
        <section className="card">
          <h2 className="font-semibold">Notes</h2>
          <ul className="mt-3 space-y-3">
            {lead.notes.map((item) => (
              <li key={item.id}>
                <p className="text-sm">{item.body}</p>
                <p className="text-xs text-mute">{item.author} · {new Date(item.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
          {canEdit ? (
            <form
              className="mt-3 grid gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void addNote().catch((err) => setError(err.message));
              }}
            >
              <label className="text-sm font-semibold">
                Add a note
                <textarea className="field min-h-24" value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
              <button className="btn-line" type="submit">Add note</button>
            </form>
          ) : null}
        </section>
      </aside>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-mute">{label}</dt>
      <dd className="font-medium text-navy-900">{value}</dd>
    </div>
  );
}
