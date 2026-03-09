const express = require("express");
const Campaign = require("../models/Campaign");
const requireAuth = require("../middleware/auth");
const mongoose = require("mongoose");
const upload = require("../utils/upload");

const router = express.Router();

/**
 * Building the final image URL for create/edit.
 * Added after deployement - img disapeared after each redeployment
 * Priority:
 * 1. Uploaded file
 * 2. Manual/public image URL from form
 * 3. Existing image (when editing and nothing new is provided)
 */
function getUploadedImagePath(req) {
  if (req.file) {
    return `/uploads/${req.file.filename}`;
  }
  return "";
}

function getCleanImageUrl(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * PUBLIC: GET /campaigns
 * List all campaigns (donor-facing)
 */
router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return res.json({ campaigns });
  } catch (err) {
    console.error("GET /campaigns error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PROTECTED: GET /campaigns/mine/list
 * Campaigns owned by the logged-in nonprofit
 */
router.get("/mine/list", requireAuth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      nonprofitId: req.user.nonprofitId,
    }).sort({ createdAt: -1 });

    return res.json({ campaigns });
  } catch (err) {
    console.error("GET /campaigns/mine/list error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUBLIC: GET /campaigns/:id
 * Get one campaign by id (donor-facing)
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid campaign ID" });
  }

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    return res.json({ campaign });
  } catch (err) {
    console.error("GET /campaigns/:id error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PROTECTED: POST /campaigns
 * Accepts multipart/form-data with optional file field "image"
 * Also supports manual/public image URL via imageUrl
 */
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const nonprofitId = req.user?.nonprofitId;
    if (!nonprofitId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, description, goalAmount, status, imageUrl } = req.body;

    if (!title || !goalAmount) {
      return res
        .status(400)
        .json({ error: "title and goalAmount are required" });
    }

    const uploadedImagePath = getUploadedImagePath(req);
    const cleanImageUrl = getCleanImageUrl(imageUrl);

    // Uploaded file wins; otherwise use public/manual URL
    const finalImageUrl = uploadedImagePath || cleanImageUrl || "";

    const campaign = await Campaign.create({
      nonprofitId,
      title: title.trim(),
      description: description ? description.trim() : "",
      goalAmount: Number(goalAmount || 0),
      imageUrl: finalImageUrl,
      amountRaised: 0,
      status: status || "active",
    });

    return res.status(201).json({ campaign });
  } catch (err) {
    console.error("CREATE CAMPAIGN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PROTECTED: PATCH /campaigns/:id
 * Update a campaign (owner only). Supports:
 * - new uploaded file
 * - manual/public image URL
 * - keep existing image if neither is provided
 */
router.patch("/:id", requireAuth, upload.single("image"), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid campaign ID" });
  }

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (String(campaign.nonprofitId) !== String(req.user.nonprofitId)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const { title, description, goalAmount, status, imageUrl } = req.body;

    if (title !== undefined) {
      campaign.title = title.trim();
    }

    if (description !== undefined) {
      campaign.description = description.trim();
    }

    if (goalAmount !== undefined) {
      campaign.goalAmount = Number(goalAmount || 0);
    }

    if (status !== undefined) {
      campaign.status = status;
    }

    const uploadedImagePath = getUploadedImagePath(req);
    const cleanImageUrl = getCleanImageUrl(imageUrl);

    /**
     * Image update rules:
     * 1. If a file is uploaded, use it
     * 2. Else if imageUrl is provided in the request, use it
     * 3. Else keep the existing campaign.imageUrl
     */
    if (uploadedImagePath) {
      campaign.imageUrl = uploadedImagePath;
    } else if (imageUrl !== undefined) {
      campaign.imageUrl = cleanImageUrl;
    }

    await campaign.save();
    return res.json({ campaign });
  } catch (err) {
    console.error("PATCH /campaigns/:id error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PROTECTED: DELETE /campaigns/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }

    const nonprofitId = req.user?.nonprofitId;
    if (!nonprofitId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await Campaign.deleteOne({ _id: id, nonprofitId });

    if (result.deletedCount === 0) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this campaign" });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /campaigns/:id error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;