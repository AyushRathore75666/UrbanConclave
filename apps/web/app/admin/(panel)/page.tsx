"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminJson, type AdminUser } from "@/lib/admin";

type Dashboard = {
  total: number;
  investment: { inrCrore: number; usdMillion: number };
  bySector: Array<{ label: string; count: number }>;
  byCountry: Array<{ country: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  messages: Array<{ id: string; name: string; email: string; message: string; createdAt: string }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [me, setMe] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminJson<Dashboard>("/api/admin/dashboard").then(setData).catch((err) => setError(err.message));
    adminJson<AdminUser>("/api/admin/me").then(setMe).catch(() => undefined);
  }, []);

  async function removeSamples() {
    if (!window.confirm("Delete every sample interest? Real submissions stay.")) return;
    await adminJson("/api/admin/samples", { method: "DELETE" });
    const fresh = await adminJson<Dashboard>("/api/admin/dashboard");
    setData(fresh);
  }

  if (error) return <p className="text-red-800">{error}</p>;
  if (!data) return <p>Loading dashboard…</p>;

  return (
    <div>
      <h1 className="font-serif text-3xl text-navy-950">Dashboard</h1>
      <p className="mt-2 max-w-3xl text-sm text-mute">
        Sample interests are loaded so the charts are visible. They are labelled Sample Company and can be removed before go-live.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="card"><p className="text-sm text-mute">Submissions</p><p className="font-serif text-4xl">{data.total}</p></article>
        <article className="card"><p className="text-sm text-mute">Proposed, INR crore</p><p className="font-serif text-4xl">{data.investment.inrCrore}</p></article>
        <article className="card"><p className="text-sm text-mute">Proposed, USD million</p><p className="font-serif text-4xl">{data.investment.usdMillion}</p></article>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Chart title="Submissions per sector" data={data.bySector.map((item) => ({ name: item.label, count: item.count }))} />
        <Chart title="Country-wise interest" data={data.byCountry.map((item) => ({ name: item.country, count: item.count }))} />
      </div>
      <ul className="mt-4 flex flex-wrap gap-2 text-sm">
        {data.byStatus.map((item) => (
          <li key={item.status} className="rounded-full bg-white px-3 py-1">{item.status.replaceAll("_", " ")}: {item.count}</li>
        ))}
      </ul>
      {me?.role === "SUPER_ADMIN" ? (
        <button type="button" className="btn-line mt-6" onClick={() => void removeSamples()}>Delete sample interests</button>
      ) : null}
      {data.messages.length ? (
        <section className="mt-8">
          <h2 className="font-serif text-2xl">Recent helpdesk messages</h2>
          <ul className="mt-3 space-y-3">
            {data.messages.map((message) => (
              <li key={message.id} className="card">
                <p className="font-semibold">{message.name} · {message.email}</p>
                <p className="mt-1 text-sm text-mute">{message.message}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Chart({ title, data }: { title: string; data: Array<{ name: string; count: number }> }) {
  return (
    <section className="card h-80">
      <h2 className="font-semibold text-navy-900">{title}</h2>
      <div className="mt-2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#0B1F3A" name="Submissions" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
