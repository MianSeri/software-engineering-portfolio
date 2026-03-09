"use client";

import { apiFetch } from "@/lib/api";

export type LoginPayload = { email: string; password: string };

export type RegisterPayload = {
  organizationName: string;
  email: string;
  password: string;
};

export async function loginNonprofit(payload: LoginPayload) {
  return apiFetch("/auth/login", { method: "POST", body: payload as any });
}

export async function registerNonprofit(payload: RegisterPayload) {
  return apiFetch("/auth/register", { method: "POST", body: payload as any });
}

export async function forgotPassword(email: string) {
  return apiFetch("/auth/forgot-password", {
    method: "POST",
    body: { email } as any,
  });
}

export async function resetPassword({
  token,
  email,
  password,
}: {
  token: string;
  email: string;
  password: string;
}) {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      token,
      email,
      newPassword: password,
    }),
  });
}