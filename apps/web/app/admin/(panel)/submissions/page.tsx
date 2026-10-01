"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch, adminJson, type AdminUser } from "@/lib/admin";

type Item = {
  id: string;
  referenceNumber: string;
  companyName: string;
  country: string;
  status: string;
  sectors: string[];
  amountValue: number;
  amountUnit: string;
  district: string | null;
  createdAt: string;
  isSample: boolean;
  cmVisitFixed: boolean;
};

const STATUSES = ["", "RECEIVED", "UNDER_REVIEW", "CONTACTED", "MEETING_SCHEDULED", "CLOSED"];

export default function SubmissionsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState({ q: "", status: "", sector: "", district: "", minAmount: "", maxAmount: "", from: "", to: "", amountUnit: "", cmVisit: "" });
  const [error, setError] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [pendingId, setPendingId] = useState("");

  async function load(nextPage = page, nextQuery = query) {
    const params = new URLSearchParams({ page: String(nextPage) });
    for (const [key, value] of Object.entries(nextQuery)) if (value) params.set(key, value);
    const data = await adminJson<{ items: Item[]; total: number }>(`/api/admin/submissions?${params.toString()}`);
    setItems(data.items);
    setTotal(data.total);
  }

  useEffect(() => {
    load(1, query).catch((err) => setError(err.message));
    adminJson<AdminUser>("/api/admin/me")
      .then((me) => setCanEdit(me.role === "SUPER_ADMIN" || me.role === "INVESTMENT_TEAM"))
      .catch(() => setCanEdit(false));
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setVisit(item: Item, fixed: boolean) {
    if (item.cmVisitFixed === fixed) return;
    setPendingId(item.id);
    setError("");
    try {
      await adminJson(`/api/admin/submissions/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ cmVisitFixed: fixed }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the CM visit.");
    } finally {
      setPendingId("");
    }
  }

  async function exportFile(format: "xlsx" | "csv") {
    const params = new URLSearchParams({ format });
    for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
    const response = await adminFetch(`/api/admin/submissions/export?${params.toString()}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError((data as { error?: string }).error || "Export failed.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `investment-interests.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-3xl text-navy-950">Investment interests</h1>
        <div className="flex gap-2">
          <button type="button" className="btn-line" onClick={() => void exportFile("xlsx")}>Export Excel</button>
          <button type="button" className="btn-line" onClick={() => void exportFile("csv")}>Export CSV</button>
        </div>
      </div>
      <form
        className="card mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          void load(1, query);
        }}
      >
        <input className="field" placeholder="Search company, reference, country" value={query.q} onChange={(event) => setQuery({ ...query, q: event.target.value })} aria-label="Search" />
        <select className="field" value={query.status} onChange={(event) => setQuery({ ...query, status: event.target.value })} aria-label="Status">
          {STATUSES.map((status) => <option key={status} value={status}>{status || "Any status"}</option>)}
        </select>
        <input className="field" placeholder="Sector slug" value={query.sector} onChange={(event) => setQuery({ ...query, sector: event.target.value })} aria-label="Sector" />
        <input className="field" placeholder="District" value={query.district} onChange={(event) => setQuery({ ...query, district: event.target.value })} aria-label="District" />
        <input className="field" placeholder="Min amount" value={query.minAmount} onChange={(event) => setQuery({ ...query, minAmount: event.target.value })} aria-label="Minimum amount" />
        <input className="field" placeholder="Max amount" value={query.maxAmount} onChange={(event) => setQuery({ ...query, maxAmount: event.target.value })} aria-label="Maximum amount" />
        <input className="field" type="date" value={query.from} onChange={(event) => setQuery({ ...query, from: event.target.value })} aria-label="From date" />
        <input className="field" type="date" value={query.to} onChange={(event) => setQuery({ ...query, to: event.target.value })} aria-label="To date" />
        <select className="field" value={query.amountUnit} onChange={(event) => setQuery({ ...query, amountUnit: event.target.value })} aria-label="Amount unit">
          <option value="">Any currency</option>
          <option value="INR_CRORE">INR crore</option>
          <option value="USD_MILLION">USD million</option>
        </select>
        <select className="field" value={query.cmVisit} onChange={(event) => setQuery({ ...query, cmVisit: event.target.value })} aria-label="Visit with CM">
          <option value="">Visit with CM</option>
          <option value="on">On</option>
          <option value="off">Off</option>
        </select>
        <button className="btn-primary" type="submit">Apply filters</button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-800">{error}</p> : null}
      <p className="mt-4 text-sm text-mute">{total} records</p>
      <div className="mt-2 overflow-x-auto rounded-2xl border border-navy-900/10 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sand text-mute">
            <tr>
              <th className="px-3 py-2">Reference</th>
              <th className="px-3 py-2">Company</th>
              <th className="px-3 py-2">Country</th>
              <th className="px-3 py-2">Sector</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">District</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Visit with CM</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-navy-900/10">
                <td className="px-3 py-2"><Link className="font-semibold text-navy-900 underline" href={`/admin/submissions/${item.id}`}>{item.referenceNumber}</Link></td>
                <td className="px-3 py-2">{item.companyName}{item.isSample ? " (sample)" : ""}</td>
                <td className="px-3 py-2">{item.country}</td>
                <td className="px-3 py-2">{item.sectors.join(", ")}</td>
                <td className="px-3 py-2">{item.amountValue} {item.amountUnit === "INR_CRORE" ? "INR cr" : "USD mn"}</td>
                <td className="px-3 py-2">{item.district || "—"}</td>
                <td className="px-3 py-2">{item.status.replaceAll("_", " ")}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3" role="radiogroup" aria-label={`Visit with CM for ${item.companyName}`}>
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        name={`cm-visit-${item.id}`}
                        checked={!item.cmVisitFixed}
                        disabled={!canEdit || pendingId === item.id}
                        onChange={() => void setVisit(item, false)}
                      />
                      Off
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        name={`cm-visit-${item.id}`}
                        checked={item.cmVisitFixed}
                        disabled={!canEdit || pendingId === item.id}
                        onChange={() => void setVisit(item, true)}
                      />
                      On
                    </label>
                  </div>
                </td>
                <td className="px-3 py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" className="btn-line" disabled={page <= 1} onClick={() => { const next = page - 1; setPage(next); void load(next); }}>Previous</button>
        <button type="button" className="btn-line" disabled={page * 20 >= total} onClick={() => { const next = page + 1; setPage(next); void load(next); }}>Next</button>
      </div>
    </div>
  );
}
