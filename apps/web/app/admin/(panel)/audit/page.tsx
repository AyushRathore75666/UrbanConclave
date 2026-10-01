"use client";

import { useEffect, useState } from "react";
import { adminJson } from "@/lib/admin";

type Row = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  ip: string | null;
  createdAt: string;
  actor: { name: string; email: string; role: string } | null;
};

export default function AuditPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    adminJson<{ items: Row[] }>("/api/admin/audit")
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-800">{error}</p>;

  return (
    <div>
      <h1 className="font-serif text-3xl text-navy-950">Audit log</h1>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-900/10 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sand text-mute">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Who</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Record</th>
              <th className="px-3 py-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-navy-900/10">
                <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">{item.actor ? `${item.actor.name}` : "System"}</td>
                <td className="px-3 py-2">{item.action}</td>
                <td className="px-3 py-2">{item.entity} {item.entityId || ""}</td>
                <td className="px-3 py-2">{item.ip || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
