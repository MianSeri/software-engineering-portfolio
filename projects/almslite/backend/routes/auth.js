const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Nonprofit = require("../models/Nonprofit");

const router = express.Router();
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isStrongPassword(pw) {
  const s = String(pw || "");
  return (
    s.length >= 8 &&
    /[a-z]/.test(s) &&
    /[A-Z]/.test(s) &&
    /\d/.test(s) &&
    /[^A-Za-z0-9]/.test(s)
  );
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    // log safe fields only
    console.log("REGISTER BODY (safe):", {
      organizationName: req.body?.organizationName,
      email: req.body?.email,
      hasPassword: Boolean(req.body?.password),
    });

    const { organizationName, password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!organizationName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be 8+ chars and include uppercase, lowercase, number, and special character.",
      });
    }

    const existingUser = await Nonprofit.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nonprofit = await Nonprofit.create({
      organizationName,
      email,
      passwordHash,
    });

    const token = jwt.sign(
      { nonprofitId: nonprofit._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      nonprofit: {
        id: nonprofit._id,
        organizationName: nonprofit.organizationName,
        email: nonprofit.email,
      },
    });
  } catch (err) {

    // Duplicate email error (Mongo unique index)
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    // safe logs only
    console.log("LOGIN BODY (safe):", {
      email: req.body?.email,
      normalizedEmail: email,
      hasPassword: Boolean(password),
    });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const nonprofit = await Nonprofit.findOne({ email });
    if (!nonprofit || !nonprofit.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, nonprofit.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { nonprofitId: nonprofit._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      nonprofit: {
        id: nonprofit._id,
        organizationName: nonprofit.organizationName,
        email: nonprofit.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    console.log("FORGOT BODY:", req.body);
    const { email } = req.body;

    // Always respond success (prevents email enumeration)
    const genericOk = () =>
      res.json({ ok: true, message: "If that email exists, a reset link was sent." });

    if (!email) return genericOk();

    const user = await Nonprofit.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return genericOk();

    // 1) create raw token (send to user)
    const rawToken = crypto.randomBytes(32).toString("hex");

    // 2) hash token for DB storage
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // 3) expiry (1 hour)
    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // 4) build reset URL for frontend
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${FRONTEND_URL}/nonprofit/reset-password?token=${rawToken}&email=${encodeURIComponent(
      user.email
    )}`;

    // DEV MODE: log it so you can finish today
    console.log("PASSWORD RESET LINK:", resetUrl);

    // Send email via Resend (works when RESEND_API_KEY is set)
    if (process.env.RESEND_API_KEY) {
      try {
        const from =
          process.env.RESEND_FROM || "Alms <onboarding@resend.dev>";

        await resend.emails.send({
          from,
          to: user.email,
          subject: "Reset your password",
          html: `
                <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height: 1.5">
                  <h2 style="margin:0 0 12px 0;">Reset your password</h2>
                  <p style="margin:0 0 12px 0;">You requested a password reset for your AlmsLite nonprofit account.</p>
                  <p style="margin:0 0 16px 0;">
                    <a href="${resetUrl}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#0ea5a4;color:#fff;text-decoration:none;font-weight:700;">
                      Reset password
                    </a>
                  </p>
                  <p style="margin:0 0 8px 0;color:#475569;font-size:14px;">If you didn’t request this, you can ignore this email.</p>
                  <p style="margin:0;color:#475569;font-size:14px;">Link: ${resetUrl}</p>
                </div>
              `,
        });

        console.log("Resend: reset email sent to", user.email);
      } catch (e) {
        console.error("Resend send failed:", e);
        // Keep generic response (no enumeration). Still let DEV log be the fallback.
      }
    }

    // Later: email it (nodemailer, resend, etc.)
    return genericOk();
  } catch (err) {
    console.error("forgot-password error:", err);
    // still return generic ok to avoid giving signals
    return res.json({ ok: true, message: "If that email exists, a reset link was sent." });
  }
});

// POST /reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ ok: false, message: "Missing required fields." });
    }

    const user = await Nonprofit.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(400).json({ ok: false, message: "Invalid token." });

    // hash incoming token and compare with DB
    const tokenHash = crypto.createHash("sha256").update(String(token)).digest("hex");

    const notExpired = user.resetPasswordExpiresAt && user.resetPasswordExpiresAt > new Date();
    const matches = user.resetPasswordTokenHash && user.resetPasswordTokenHash === tokenHash;

    if (!matches || !notExpired) {
      return res.status(400).json({ ok: false, message: "Token expired or invalid." });
    }

    // Update password
    const hashed = await bcrypt.hash(String(newPassword), 12);
    user.passwordHash = hashed; // ✅ correct field

    // Clear token
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    return res.json({ ok: true, message: "Password updated successfully." });
  } catch (err) {
    console.error("reset-password error:", err);
    return res.status(500).json({ ok: false, message: "Server error." });
  }
});

module.exports = router;