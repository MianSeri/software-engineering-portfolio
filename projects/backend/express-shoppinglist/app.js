const express = require ("express");
const app = express();

const itemsRoutes = require ("./routes/items");

app.use(express.json()); // so req.body works

app.use("/items", itemsRoutes);

// 404 handler
app.use(function (req, res){
    return res.status(404).json({ error: "Not Found" });
});

module.exports = app;