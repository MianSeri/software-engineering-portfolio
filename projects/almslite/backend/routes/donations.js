const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");

// PUBLIC: POST /donations/intent
// Creates Stripe PaymentIntent + creates Donation as PENDING (idempotent).
// Does NOT increment amountRaised (that happens on confirm/webhook).
router.post("/intent", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const idempotencyKey = req.header("Idempotency-Key");
    const { campaignId, donorName, donorEmail, amount, message } = req.body;

    if (!idempotencyKey) {
      return res.status(400).json({ error: "Missing Idempotency-Key header" });
    }
    if (!campaignId || !donorName || amount == null) {
      return res.status(400).json({
        error: "campaignId, donorName, and amount are required",
      });
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: "amount must be a number > 0" });
    }

    // Idempotency: If same intent repeated, reuse existing donation
    const existing = await Donation.findOne({ campaignId, idempotencyKey });
    if (existing) {
      let clientSecret = null;

      if (existing.paymentProvider === "stripe" && existing.providerPaymentId) {
        const pi = await stripe.paymentIntents.retrieve(existing.providerPaymentId);
        clientSecret = pi.client_secret;
      }

      return res.status(200).json({
        message: "Duplicate prevented (idempotency)",
        donation: existing,
        clientSecret,
      });
    }

    // Validate campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    if (campaign.status !== "active") {
      return res.status(400).json({ error: "Campaign is not active" });
    }

    // Stripe PaymentIntent (outside Mongo transaction)
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amountNum * 100),
        currency: "usd",
        metadata: {
          campaignId: String(campaignId),
          donorEmail: donorEmail || "",
          idempotencyKey,
        },
      },
      { idempotencyKey }
    );

    let donation;

    // Transaction: only the Mongo write is inside
    await session.withTransaction(async () => {
      const docs = await Donation.create(
        [
          {
            campaignId,
            donorName,
            donorEmail,
            amount: amountNum,
            message,
            idempotencyKey,

            paymentProvider: "stripe",
            providerPaymentId: paymentIntent.id,
            paymentStatus: "pending",
            currency: "usd",
          },
        ],
        { session }
      );

      donation = docs[0];
    });

    return res.status(201).json({
      message: "Donation intent created (pending)",
      donation,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    // Handle duplicate key error if you have a unique index on (campaignId, idempotencyKey)
    if (err.code === 11000) {
      const { campaignId } = req.body;
      const idempotencyKey = req.header("Idempotency-Key");
      const existing = await Donation.findOne({ campaignId, idempotencyKey });

      if (!existing) {
        return res.status(409).json({ error: "Duplicate detected, please retry" });
      }

      let clientSecret = null;
      if (existing.paymentProvider === "stripe" && existing.providerPaymentId) {
        const pi = await stripe.paymentIntents.retrieve(existing.providerPaymentId);
        clientSecret = pi.client_secret;
      }

      return res.status(200).json({
        message: "Duplicate prevented (idempotency)",
        donation: existing,
        clientSecret,
      });
    }

    console.error("INTENT ERROR:", err);

    if (err && err.type) {
      return res.status(err.statusCode || 500).json({
        error: err.message,
        type: err.type,
        code: err.code,
        statusCode: err.statusCode,
      });
    }

    return res.status(500).json({ error: err.message || "Server error" });
  } finally {
    session.endSession();
  }
});

// PRIVATE (or public MVP): POST /donations/confirm
// Confirms Stripe PaymentIntent and finalizes donation:
// - donation: pending -> succeeded
// - campaign: amountRaised += donation.amount
// All done atomically in a MongoDB transaction.
// POST /donations/confirm
router.post("/confirm", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { donationId } = req.body;
    if (!donationId) {
      return res.status(400).json({ error: "donationId is required" });
    }

    let updatedDonation;

    await session.withTransaction(async () => {
      // 1) Read donation inside the transaction (session-bound)
      const donation = await Donation.findById(donationId).session(session);
      if (!donation) {
        throw new Error("Donation not found");
      }

      // 2) Idempotency: if already finalized, return it (no double increment)
      if (donation.status === "COMPLETED" || donation.paymentStatus === "paid") {
        updatedDonation = donation;
        return;
      }

      // 3) Guardrails: must be Stripe + must have PaymentIntent id
      if (donation.paymentProvider !== "stripe" || !donation.providerPaymentId) {
        throw new Error("Donation is not a Stripe PaymentIntent donation");
      }

      // 4) Ask Stripe for the truth (source of truth)
      const paymentIntent = await stripe.paymentIntents.retrieve(
        donation.providerPaymentId
      );

      // 5) Only finalize if Stripe says succeeded
      if (paymentIntent.status !== "succeeded") {
        const err = new Error("Payment not successful yet");
        err.code = "PAYMENT_NOT_SUCCEEDED";
        err.paymentIntentStatus = paymentIntent.status;
        throw err;
      }

      // 6) Optional: verify amount matches
      const amountFromStripe = (paymentIntent.amount_received ?? paymentIntent.amount) / 100;
      if (Number(amountFromStripe) !== Number(donation.amount)) {
        const err = new Error("Amount mismatch");
        err.code = "AMOUNT_MISMATCH";
        err.expected = donation.amount;
        err.got = amountFromStripe;
        throw err;
      }

      // 7) Update donation (enum-safe)
      donation.paymentStatus = "paid"; //matches schema enum
      donation.status = "COMPLETED";
      donation.confirmedAt = new Date();
      donation.providerChargeId = paymentIntent.latest_charge || donation.providerChargeId;

      await donation.save({ session });

      // 8) Increment campaign exactly once
      const result = await Campaign.updateOne(
        { _id: donation.campaignId, status: "active" },
        { $inc: { amountRaised: donation.amount } },
        { session }
      );

      if (result.matchedCount === 0) {
        throw new Error("Campaign not found or not active");
      }

      updatedDonation = donation;
    });

    return res.status(200).json({
      message: "Donation confirmed",
      donation: updatedDonation,
    });
  } catch (err) {
    console.error("CONFIRM ERROR:", err);

    if (err.message === "Donation not found") {
      return res.status(404).json({ error: "Donation not found" });
    }

    if (err.code === "PAYMENT_NOT_SUCCEEDED") {
      return res.status(400).json({
        error: "Payment not successful yet",
        paymentIntentStatus: err.paymentIntentStatus,
      });
    }

    if (err.code === "AMOUNT_MISMATCH") {
      return res.status(400).json({
        error: "Amount mismatch",
        expected: err.expected,
        got: err.got,
      });
    }

    if (err.message === "Donation is not a Stripe PaymentIntent donation") {
      return res.status(400).json({ error: err.message });
    }

    if (err.message === "Campaign not found or not active") {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message || "Server error" });
  } finally {
    session.endSession();
  }
});


module.exports = router;
