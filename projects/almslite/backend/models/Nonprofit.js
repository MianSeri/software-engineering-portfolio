const mongoose = require("mongoose");

const nonprofitSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,   
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"]
    },

    passwordHash: { type: String, required: true },
    resetPasswordTokenHash: { type: String },
    resetPasswordExpiresAt: { type: Date },
    logoUrl: { type: String, default: "" },
    description: { type: String, default: "", maxlength: 500 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Nonprofit", nonprofitSchema);