import { apiFetch } from "@/lib/api";

export type DonationIntentResponse = {
  message: string;
  donation: {
    _id: string;
    campaignId: string;
    amount: number;
    donorName: string;
    donorEmail?: string;
    paymentStatus: string;
    status?: string;
    providerPaymentId?: string;
  };
  clientSecret: string | null;
};

export async function createDonationIntent(input: {
  campaignId: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  message?: string;
}) {
  // IMPORTANT: backend requires Idempotency-Key header
  const idempotencyKey =
    (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

  return apiFetch("/donations/intent", {
    method: "POST",
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(input),
  }) as Promise<DonationIntentResponse>;
}

export async function confirmDonation(donationId: string) {
  return apiFetch("/donations/confirm", {
    method: "POST",
    body: JSON.stringify({ donationId }),
  });
}