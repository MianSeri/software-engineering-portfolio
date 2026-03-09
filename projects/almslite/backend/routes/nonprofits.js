const express = require("express");
const requireAuth = require("../middleware/auth");

const Nonprofit = require("../models/Nonprofit");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");

const router = express.Router();

/**
 * DELETE /nonprofits/me
 * Deletes the currently logged-in nonprofit + cleanup related data
 */
router.delete("/me", requireAuth, async (req, res) => {
  try {
    const nonprofitId = req.user.nonprofitId;

    // Clean up child records
    await Campaign.deleteMany({ nonprofitId });
    await Donation.deleteMany({ nonprofitId });

    await Nonprofit.findByIdAndDelete(nonprofitId);

    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /nonprofits/me error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;