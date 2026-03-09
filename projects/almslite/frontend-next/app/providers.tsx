"use client";

import { PropsWithChildren, useMemo } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

export default function Providers({ children }: PropsWithChildren) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const stripePromise = useMemo(() => {
    return publishableKey ? loadStripe(publishableKey) : null;
  }, [publishableKey]);

  if (!publishableKey || !stripePromise) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h2 style={{ marginBottom: 8 }}>Missing Stripe publishable key</h2>
        <p>
          Add <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to{" "}
          <code>.env.local</code> and restart <code>npm run dev</code>.
        </p>
      </div>
    );
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}