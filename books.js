const express = require("express");
const Book = require("../models/book");

const jsonschema = require("jsonschema");
const ExpressError = require("../expressError");
const bookNewSchema = require("../schemas/bookNew.json");
const bookUpdateSchema = require("../schemas/bookUpdate.json");
const bookPatchSchema = require("../schemas/bookPatch.json");

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(); //removed req.query
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

// router.get("/:id", async function (req, res, next) {
//   try {
//     const book = await Book.findOne(req.params.id);
//     return res.json({ book });
//   } catch (err) {
//     return next(err);
//   }
// });

// To match the prompt and keep naming consistent with your PATCH/PUT/DELETE routes, changed it to:
router.get("/:isbn", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.isbn);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookNewSchema); //validation
    if (!result.valid) {
      const errors = result.errors.map(e => e.stack);
      throw new ExpressError(errors, 400);
    }

    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookUpdateSchema); //validation
    if (!result.valid) {
      const errors = result.errors.map(e => e.stack);
      throw new ExpressError(errors, 400);
    }

    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** Further study: PATCH /[isbn]   bookData => {book: updatedBook} (partial update) */

router.patch("/:isbn", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, bookPatchSchema);
    if (!result.valid) {
      const errors = result.errors.map(e => e.stack);
      throw new ExpressError(errors, 400);
    }

    const book = await Book.updatePartial(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
