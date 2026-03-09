const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    donorName: { type: String, required: true, trim: true },
    donorEmail: { type: String, trim: true },

    amount: { type: Number, required: true }, // later: amountCents (int)
    message: { type: String, trim: true, maxlength: 500 },

    // Payment tracking
    paymentProvider: {
      type: String,
      enum: ["none", "stripe", "paypal", "offline"],
      default: "none",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Stripe PI id or PayPal order/capture id
    providerPaymentId: { type: String, default: null },

    // Stripe Charge ID (ch_...) – created after success
    providerChargeId: { type: String, default: null },

    currency: { type: String, default: "usd" },

    // Idempotency (per campaign)
    idempotencyKey: { type: String, required: true },

    // App-level status
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },

    // When the donation was successfully confirmed
    confirmedAt: { type: Date, default: null },

    // Receipt tracking (idempotent email safety)
    receiptSentAt: { type: Date, default: null },
    receiptId: { type: String, default: null },
  },
  { timestamps: true }
);

// Enforce idempotency per campaign (correct approach)
donationSchema.index(
  { campaignId: 1, idempotencyKey: 1 },
  { unique: true }
);

module.exports = mongoose.model("Donation", donationSchema);