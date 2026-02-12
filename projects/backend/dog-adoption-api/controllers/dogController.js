const mongoose = require("mongoose");
const Dog = require("../models/Dog");

// POST /dogs
async function createDog(req, res) {
  const { name, description } = req.body || {};
  if (!name || !description) {
    return res.status(400).json({ error: "name and description are required" });
  }

  const dog = await Dog.create({
    name,
    description,
    owner: req.user.id,
  });

  return res.status(201).json(dog);
}

// POST /dogs/:id/adopt
async function adoptDog(req, res) {
  const { id } = req.params;
  const { thankYouMessage = "" } = req.body || {};

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "invalid dog id" });
  }

  const dog = await Dog.findById(id);
  if (!dog) return res.status(404).json({ error: "dog not found" });

  // rule: can't adopt your own dog
  if (String(dog.owner) === String(req.user.id)) {
    return res.status(403).json({ error: "you cannot adopt your own dog" });
  }

  // rule: can't adopt twice
  if (dog.status === "adopted") {
    return res.status(409).json({ error: "dog is already adopted" });
  }

  dog.status = "adopted";
  dog.adoptedBy = req.user.id;
  dog.thankYouMessage = thankYouMessage;

  await dog.save();

  return res.json(dog);
}

// DELETE /dogs/:id
async function deleteDog(req, res) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "invalid dog id" });
  }

  const dog = await Dog.findById(id);
  if (!dog) return res.status(404).json({ error: "dog not found" });

  // rule: only owner can delete
  if (String(dog.owner) !== String(req.user.id)) {
    return res.status(403).json({ error: "you can only remove your own dogs" });
  }

  // rule: can't delete if adopted
  if (dog.status === "adopted") {
    return res.status(409).json({ error: "cannot remove an adopted dog" });
  }

  await Dog.deleteOne({ _id: id });
  return res.status(204).send();
}

// GET /dogs/mine?status=&page=&limit=
async function listMyDogs(req, res) {
  const { status } = req.query;
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
  const skip = (page - 1) * limit;

  const filter = { owner: req.user.id };
  if (status) {
    if (!["available", "adopted"].includes(status)) {
      return res.status(400).json({ error: "status must be available or adopted" });
    }
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    Dog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Dog.countDocuments(filter),
  ]);

  return res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items,
  });
}

// GET /dogs/adopted?page=&limit=
async function listAdoptedDogs(req, res) {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
  const skip = (page - 1) * limit;

  const filter = { adoptedBy: req.user.id };

  const [items, total] = await Promise.all([
    Dog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Dog.countDocuments(filter),
  ]);

  return res.json({
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items,
  });
}

module.exports = {
  createDog,
  adoptDog,
  deleteDog,
  listMyDogs,
  listAdoptedDogs,
};