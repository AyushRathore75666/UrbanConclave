export function token() {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem("mpgis_token") || "";
}

export function setToken(value: string) {
  window.sessionStorage.setItem("mpgis_token", value);
}

export function clearToken() {
  window.sessionStorage.removeItem("mpgis_token");
}

export async function adminFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token()}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.method && options.method !== "GET") headers.set("X-MPGIS-Request", "1");
  const response = await fetch(`/backend${path}`, { ...options, headers });
  if (response.status === 401) {
    clearToken();
    window.location.href = "/admin/login";
    throw new Error("Sign in required.");
  }
  return response;
}

export async function adminJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await adminFetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as { error?: string }).error || "Request failed.");
  return data as T;
}

export type AdminUser = { id: string; name: string; email: string; role: string };
