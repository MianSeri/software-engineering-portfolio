// lib/api.ts
// Handles generic HTTP requests : attaches the token; sets headers; parses JSON; throws errors;
// apiFetch("/campaigns/mine/list")

import { getStoredToken } from "@/lib/auth";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
// -----------------------------
// Helpers
// -----------------------------
function isFormData(body: any): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}
function isPlainObject(body: any): body is Record<string, any> {
  return (
    body != null &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    !isFormData(body) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer)
  );
}
function shouldDebug(): boolean {
  // Turn on by setting: NEXT_PUBLIC_DEBUG_API=true
  return process.env.NEXT_PUBLIC_DEBUG_API === "true";
}
// -----------------------------
// Main fetch
// -----------------------------
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = new Headers(options.headers || undefined);
  // Attach Authorization unless caller already provided it
  if (!headers.has("Authorization")) {
    const token = getStoredToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  // Normalize body:
  // - plain object => JSON.stringify
  // - FormData => keep as-is
  let body: any = options.body;
  if (isPlainObject(body)) body = JSON.stringify(body);
  // Only set JSON content type when not FormData and body exists
  if (body != null && !isFormData(body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (shouldDebug()) {
    // Don’t log the full token
    const auth = headers.get("Authorization");
    console.log("[apiFetch]", {
      url,
      method: options.method || "GET",
      hasAuthHeader: Boolean(auth),
      authPreview: auth ? auth.slice(0, 20) + "…" : null,
    });
  }
  const res = await fetch(url, { ...options, headers, body });
  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text);
      const msg =
        j?.error ||
        j?.message ||
        j?.msg ||
        `Request failed: ${res.status} ${res.statusText}`;
      const err = new Error(msg) as any;
      err.status = res.status;
      err.data = j;
      throw err;
    } catch {
      const err = new Error(
        text || `Request failed: ${res.status} ${res.statusText}`
      ) as any;
      err.status = res.status;
      err.data = text;
      throw err;
    }
  }
  if (!text) return null as any;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as any;
  }
}
