const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function register(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const existing = await User.findOne({ username });
  if (existing) return res.status(409).json({ error: "username already taken" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, passwordHash });

  return res.status(201).json({ id: user._id, username: user.username });
}

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const token = jwt.sign(
    { username: user.username },
    process.env.JWT_SECRET,
    { subject: String(user._id), expiresIn: "24h" }
  );

  return res.json({ token });
}

module.exports = { register, login };