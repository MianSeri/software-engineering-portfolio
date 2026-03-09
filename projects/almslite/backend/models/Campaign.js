const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    nonprofitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nonprofit",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    goalAmount: { type: Number, required: true, min: 1 },
    amountRaised: { type: Number, default: 0, min: 0 },
    category: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "draft", "paused", "completed"],
      default: "active",
    },
    imageUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campaign", campaignSchema);