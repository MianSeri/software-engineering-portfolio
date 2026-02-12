require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");

const authRoutes = require("./routes/authRoutes");
const dogRoutes = require("./routes/dogRoutes");

const app = express();

// 1) middleware
app.use(cors());
app.use(express.json()); // JSON parsing (requirement #9)

// 2) routes
app.get("/ping", (req, res) => res.json({ message: "Dog Adoption API running" }));
app.use("/auth", authRoutes);
app.use("/dogs", dogRoutes);

// 3) error fallback
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// 4) start server only when run directly (helps tests)
if (require.main === module) {
  const port = process.env.PORT || 3000;
  connectDB(process.env.MONGO_URI)
    .then(() => app.listen(port, () => console.log(`Listening on ${port}`)))
    .catch((err) => {
      console.error("DB connection failed:", err.message);
      process.exit(1);
    });
}

module.exports = app;