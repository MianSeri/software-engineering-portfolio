const express = require("express");
const router = new express.Router();

const items = require("../fakeDb");

// helper to find item by name
function findItem(name) {
  return items.find(i => i.name === name);
}

/** GET /items - list all items */
router.get("/", function (req, res) {
  return res.json(items);
});

/** POST /items - add new item */
router.post("/", function (req, res) {
  const { name, price } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: "name and price required" });
  }

  const newItem = { name, price };
  items.push(newItem);

  return res.status(201).json({ added: newItem });
});

/** GET /items/:name - get one item */
router.get("/:name", function (req, res) {
  const item = findItem(req.params.name);

  if (!item) return res.status(404).json({ error: "Item not found" });

  return res.json(item);
});

/** PATCH /items/:name - update item */
router.patch("/:name", function (req, res) {
  const item = findItem(req.params.name);
  if (!item) return res.status(404).json({ error: "Item not found" });

  const { name, price } = req.body;

  if (name !== undefined) item.name = name;
  if (price !== undefined) item.price = price;

  return res.json({ updated: item });
});

/** DELETE /items/:name - delete item */
router.delete("/:name", function (req, res) {
  const idx = items.findIndex(i => i.name === req.params.name);
  if (idx === -1) return res.status(404).json({ error: "Item not found" });

  items.splice(idx, 1);
  return res.json({ message: "Deleted" });
});

module.exports = router;
