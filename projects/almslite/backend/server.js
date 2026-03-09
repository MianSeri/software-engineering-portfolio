require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const campaignRoutes = require("./routes/campaigns");
const donationRoutes = require("./routes/donations");
const webhookRoutes = require("./routes/webhooks");

const nonprofitRoutes = require("./routes/nonprofits");

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173", "https://almslite-frontend.onrender.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
};

const path = require("path");

// serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS must be before routes
app.use(cors(corsOptions));

// Preflight (Express 4 + 5 safe)
app.options(/.*/, cors(corsOptions));

/**
 * Webhook MUST be raw (BEFORE express.json)
 */
app.use("/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

// Normal JSON for everything else
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/donations", donationRoutes);
app.use("/nonprofits", nonprofitRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "Alms Lite backend is running!" });
});

const PORT = process.env.PORT || 5050;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();