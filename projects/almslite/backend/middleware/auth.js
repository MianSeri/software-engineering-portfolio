const jwt = require("jsonwebtoken");
const Nonprofit = require("../models/Nonprofit");


async function requireAuth(req, res, next) {
  try {
    const auth = req.header("Authorization");
    if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = auth.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload should be: { nonprofitId: "...", iat, exp }

    const nonprofit = await Nonprofit.findById(payload.nonprofitId).select("_id organizationName email");
    if (!nonprofit) {
      return res.status(401).json({ error: "Invalid token (user not found)" });
    }

    // Attach to request so routes can use it
    req.user = { nonprofitId: nonprofit._id, nonprofit };

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = requireAuth;
