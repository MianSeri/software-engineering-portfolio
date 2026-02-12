const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const {
  createDog,
  adoptDog,
  deleteDog,
  listMyDogs,
  listAdoptedDogs,
} = require("../controllers/dogController");

const router = express.Router();

router.use(requireAuth);

router.post("/", createDog);
router.post("/:id/adopt", adoptDog);
router.delete("/:id", deleteDog);

router.get("/mine", listMyDogs);
router.get("/adopted", listAdoptedDogs);

module.exports = router;