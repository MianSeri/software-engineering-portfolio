const mongoose = require("mongoose");

const DogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: { type: String, enum: ["available", "adopted"], default: "available" },

    adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    thankYouMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dog", DogSchema);