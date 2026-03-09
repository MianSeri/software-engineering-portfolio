"use client";

import React, { useMemo, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createDonationIntent, confirmDonation } from "@/lib/donations";
import "./DonationForm.css";

const PRESETS = [10, 25, 50, 100];

type DonationFrequency = "one-time" | "monthly";

type Props = {
  campaignId: string;
  onSuccess?: () => void;
};

export default function DonationForm({ campaignId, onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();

  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  const [frequency, setFrequency] = useState<DonationFrequency>("one-time");

  const [amount, setAmount] = useState(25);
  const [customMode, setCustomMode] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  // Keep this only if your backend model/controller still accepts it.
  // Remove fully if your backend no longer uses message.
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const finalAmount = useMemo(() => {
    if (!customMode) return Number(amount) || 0;
    const n = Number(customAmount);
    return Number.isFinite(n) ? n : 0;
  }, [amount, customAmount, customMode]);

  function selectPreset(v: number) {
    setCustomMode(false);
    setCustomAmount("");
    setAmount(v);
  }

  function chooseCustom() {
    setCustomMode(true);
    setCustomAmount("");
  }

  function amountLabel() {
    if (!finalAmount || finalAmount < 1) return "Donate";
    return frequency === "monthly"
      ? `Donate $${finalAmount}/month`
      : `Donate $${finalAmount}`;
  }

  function impactCopy() {
    if (!finalAmount || finalAmount < 1) {
      return "Your donation helps move this mission forward.";
    }

    if (frequency === "monthly") {
      return `Your $${finalAmount}/month helps create steady support for this campaign.`;
    }

    return `Your $${finalAmount} donation helps move this mission forward.`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!campaignId) {
      setError("Missing campaignId.");
      return;
    }

    const cleanName = donorName.trim();
    const cleanEmail = donorEmail.trim();
    const cleanMessage = message.trim();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (!stripe || !elements) {
      setError("Stripe is still loading. Please try again in a moment.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not ready.");
      return;
    }

    if (!finalAmount || finalAmount < 1) {
      setError("Please choose an amount of $1 or more.");
      return;
    }

    setSubmitting(true);

    try {
        const intentData = await createDonationIntent({
            campaignId,
            donorName: cleanName,
            donorEmail: cleanEmail || undefined,
            amount: finalAmount,
            message: cleanMessage || undefined,
          });

      console.log("createDonationIntent response:", intentData);

      const donationId = intentData?.donation?._id;
      const clientSecret = intentData?.clientSecret;

      if (!donationId || !clientSecret) {
        throw new Error("Missing donationId or clientSecret from server.");
      }

      const stripeResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cleanName,
            email: cleanEmail || undefined,
          },
        },
      });

      console.log("stripe.confirmCardPayment result:", stripeResult);

      if (stripeResult.error) {
        throw new Error(stripeResult.error.message);
      }

      const status = stripeResult.paymentIntent?.status;
      if (status !== "succeeded") {
        throw new Error(`Payment status: ${status}`);
      }

      const confirmResult = await confirmDonation(donationId);

      console.log("confirmDonation response:", confirmResult);

      // Be strict here:
      // only show success if backend actually confirms it.
      // Adjust these checks to match your backend response shape.
      if (!confirmResult) {
        throw new Error("Donation was paid in Stripe, but backend confirmation returned no response.");
      }

      if (confirmResult.error) {
        throw new Error(confirmResult.error);
      }

      setSuccess(true);

      cardElement.clear();
      setDonorName("");
      setDonorEmail("");
      setFrequency("one-time");
      setAmount(25);
      setCustomMode(false);
      setCustomAmount("");
      setMessage("");

      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const disableSubmit = submitting || !stripe || finalAmount < 1;

  return (
    <form className="df" onSubmit={handleSubmit}>
      <div className="df-header">
        <h3 className="df-title">Support this campaign</h3>
        <p className="df-subtitle">Fast, secure, and impact-driven giving.</p>
      </div>

      <div className="df-field">
        <span className="df-label">Donation frequency</span>
        <div className="df-segment" role="group" aria-label="Donation frequency">
          <button
            type="button"
            className={`df-segmentBtn ${frequency === "one-time" ? "is-active" : ""}`}
            onClick={() => setFrequency("one-time")}
          >
            One-time
          </button>
          <button
            type="button"
            className={`df-segmentBtn ${frequency === "monthly" ? "is-active" : ""}`}
            onClick={() => setFrequency("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="df-field">
        <div className="df-labelRow">
          <span className="df-label">Choose amount</span>
          <span className="df-mini">
            {customMode ? "Enter your amount" : `Selected: $${finalAmount}`}
          </span>
        </div>

        <div className="df-pills" role="group" aria-label="Donation amount presets">
          {PRESETS.map((v) => {
            const active = !customMode && amount === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => selectPreset(v)}
                className={`df-pill ${active ? "is-active" : ""}`}
              >
                ${v}
              </button>
            );
          })}

          <button
            type="button"
            onClick={chooseCustom}
            className={`df-pill ${customMode ? "is-active" : ""}`}
          >
            Custom
          </button>
        </div>

        {customMode ? (
          <div className="df-custom">
            <div className="df-currency">$</div>
            <input
              className="df-input df-input--currency"
              inputMode="numeric"
              type="number"
              min={1}
              step={1}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="45"
              required
            />
          </div>
        ) : null}

        <p className="df-hint">Most donors choose $25.</p>
      </div>

      <div className="df-field">
        <label className="df-label" htmlFor="donorName">
          Name
        </label>
        <input
          id="donorName"
          className="df-input"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          required
          placeholder="Your name"
          autoComplete="name"
        />
      </div>

      <div className="df-field">
        <label className="df-label" htmlFor="donorEmail">
          Email (optional)
        </label>
        <input
          id="donorEmail"
          className="df-input"
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          type="email"
          placeholder="you@email.com"
          autoComplete="email"
        />
      </div>

      {/* Remove this block later if message is no longer part of your backend */}
      <div className="df-field">
        <label className="df-label" htmlFor="message">
          Message (optional)
        </label>
        <input
          id="message"
          className="df-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          placeholder="Leave a note (optional)"
        />
      </div>

      <div className="df-field">
        <label className="df-label">Card details</label>
        <div className="df-cardBox">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "15px",
                  color: "#F7FAFC",
                  fontFamily:
                    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  "::placeholder": {
                    color: "rgba(247,250,252,0.48)",
                  },
                },
                invalid: { color: "#FCA5A5" },
              },
            }}
          />
        </div>
      </div>

      <div className="df-impact" aria-live="polite">
        <span className="df-impactLabel">Impact</span>
        <span className="df-impactText">{impactCopy()}</span>
      </div>

      {error ? <div className="df-alert df-alert--error">{error}</div> : null}
      {success ? (
        <div className="df-alert df-alert--success">Donation successful — thank you!</div>
      ) : null}

      <button className="df-submit" type="submit" disabled={disableSubmit}>
        {submitting ? "Processing…" : amountLabel()}
      </button>

      <div className="df-trust" aria-label="Payment trust information">
        <span className="df-dot" />
        Secure payments by Stripe
        <span className="df-sep">•</span>
        Email receipt included
      </div>
    </form>
  );
}