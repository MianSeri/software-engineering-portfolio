// lib/nonprofits.ts
import { apiFetch } from "@/lib/api";

export async function deleteMyNonprofit(): Promise<any> {
  // Try common “delete my account” routes:
  const tries = ["/nonprofits/me", "/nonprofits/mine", "/nonprofits"];

  let lastErr: any = null;

  for (const path of tries) {
    try {
      return await apiFetch(path, { method: "DELETE" });
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("Delete failed");
}