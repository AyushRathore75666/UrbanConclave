const base = process.env.API_URL || "http://127.0.0.1:4000";

async function request(path, options = {}) {
  const headers = { "X-MPGIS-Request": "1", ...(options.headers || {}) };
  const response = await fetch(`${base}${path}`, { ...options, headers });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} -> ${response.status} ${JSON.stringify(body)}`);
  }
  return body;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pdf = new Blob([Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n")], { type: "application/pdf" });

const health = await request("/api/health", { headers: {} });
assert(health.ok, "health");

const captcha = await request("/api/captcha", { headers: {} });
const answer = captcha.question.match(/(\d+) \+ (\d+)/);
assert(answer, "captcha question");
const sum = String(Number(answer[1]) + Number(answer[2]));

const email = `smoke.${Date.now()}@example.com`;
const mobile = "+919811112233";

const payload = {
  contactName: "Smoke Tester",
  designation: "Director",
  companyName: "Smoke Test Industries",
  sector: "urban-infrastructure",
  email,
  mobile,
  city: "Indore",
  stateRegion: "Madhya Pradesh",
  website: "",
  attendingAs: "investor",
  sessions: ["plenary", "panel-4"],
  hcmRequested: true,
  hcmOrganization: "Smoke Test Industries",
  hcmSector: "Urban infrastructure",
  hcmAmount: 75,
  hcmLocation: "Indore",
  hcmAgenda: "Discuss a township and mobility project for a tier-2 city in Madhya Pradesh.",
  consent: true,
  updatesConsent: true,
  captchaId: captcha.id,
  captchaAnswer: sum,
  companyFax: "",
};

const form = new FormData();
form.set("payload", JSON.stringify(payload));
form.set("document", pdf, "profile.pdf");
const created = await request("/api/submissions", { method: "POST", body: form });
assert(created.referenceNumber?.startsWith("MP-UGC2026-"), "reference number");

const status = await request("/api/status", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ reference: created.referenceNumber, email }),
});
assert(status.status === "RECEIVED", "status received");

const login = await request("/api/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "super@mpconclave.local", password: process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026" }),
});
const auth = { Authorization: `Bearer ${login.token}` };

const list = await request("/api/admin/submissions?q=Smoke", { headers: auth });
assert(list.total >= 1, "submission listed");

const dashboard = await request("/api/admin/dashboard", { headers: auth });
assert(dashboard.total >= 1 && dashboard.bySector.length > 0, "dashboard");

await request(`/api/admin/submissions/${created.id}`, {
  method: "PATCH",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ status: "UNDER_REVIEW" }),
});
await request(`/api/admin/submissions/${created.id}/notes`, {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ body: "Smoke-test note for the investment team." }),
});

const beforeVisit = await request(`/api/admin/submissions/${created.id}`, { headers: auth });
assert(beforeVisit.cmVisitFixed === false, "cm visit starts off");
const fixedVisit = await request(`/api/admin/submissions/${created.id}`, {
  method: "PATCH",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ cmVisitFixed: true }),
});
assert(fixedVisit.cmVisitFixed === true, "cm visit turned on");
const byVisits = await request(`/api/admin/submissions?cmVisit=on&q=${encodeURIComponent(created.referenceNumber)}`, { headers: auth });
assert(byVisits.items.some((item) => item.id === created.id && item.cmVisitFixed), "filter visit with CM on");

const exported = await fetch(`${base}/api/admin/submissions/export?format=csv&q=Smoke`, { headers: auth });
assert(exported.ok, "csv export");
const csv = await exported.text();
assert(csv.includes(created.referenceNumber), "csv contains reference");

const content = await request("/api/content/en", { headers: {} });
assert(content.hero?.title, "public content");

const viewer = await request("/api/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "viewer@mpconclave.local", password: process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026" }),
});
const masked = await request(`/api/admin/submissions/${created.id}`, { headers: { Authorization: `Bearer ${viewer.token}` } });
assert(masked.email.includes("***"), "viewer email is masked");

console.log(`Smoke test passed. Reference ${created.referenceNumber}`);
