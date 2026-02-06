const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 1️⃣ Serve all static files (index.html, App.js, etc.) from this folder
app.use(express.static(__dirname));

// 2️⃣ Explicit route for "/", just to be clear
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 3️⃣ Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
