// lib/auth.ts
// Storage helpers + client auth utilities ONLY (no API calls)

const TOKEN_KEY = "token";
const NONPROFIT_KEY = "nonprofit";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(TOKEN_KEY);
  return v ? v.trim() : null;
}

export function storeToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // optional: let navbar/pages react immediately
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

export function getStoredNonprofit<T = any>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(NONPROFIT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storeNonprofit(nonprofit: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NONPROFIT_KEY, JSON.stringify(nonprofit));
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearNonprofit() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(NONPROFIT_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

export function logoutClient() {
    clearToken();
    clearNonprofit();
  
    // notify UI that auth changed
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-changed"));
    }
  }