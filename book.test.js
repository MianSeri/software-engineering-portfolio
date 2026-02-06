process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testBook;

beforeEach(async () => {
  // Clear table so each test starts clean
  await db.query("DELETE FROM books");

  // Insert one known book we can test against
  const result = await db.query(
    `INSERT INTO books
      (isbn, amazon_url, author, language, pages, publisher, title, year)
     VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING isbn, amazon_url, author, language, pages, publisher, title, year`,
    [
      "0691161518",
      "http://a.co/eobPtX2",
      "Matthew Lane",
      "english",
      264,
      "Princeton University Press",
      "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      2017,
    ]
  );

  testBook = result.rows[0];
});

afterAll(async () => {
  await db.end();
});

describe("GET /books", function () {
  test("Gets a list of all books", async function () {
    const resp = await request(app).get("/books");

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      books: [testBook],
    });
  });
});

describe("GET /books/:isbn", function () {
  test("Gets a single book", async function () {
    const resp = await request(app).get(`/books/${testBook.isbn}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ book: testBook });
  });

  test("Responds with 404 if book not found", async function () {
    const resp = await request(app).get("/books/does-not-exist");

    expect(resp.statusCode).toBe(404);
    // Based on your app.js 404 handler
    expect(resp.body.error.status).toBe(404);
    expect(resp.body.error.message).toContain("There is no book with an isbn");
  });
});

describe("POST /books", function () {
  test("Creates a new book", async function () {
    const newBook = {
      isbn: "1234567890",
      amazon_url: "http://a.co/newBook",
      author: "Rosey Dev",
      language: "english",
      pages: 123,
      publisher: "Test Publisher",
      title: "My Test Book",
      year: 2026,
    };

    const resp = await request(app).post("/books").send(newBook);

    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({
      book: newBook,
    });
  });

  test("Rejects invalid book data (schema validation)", async function () {
    const badBook = {
      isbn: "9999999999",
      amazon_url: "not-a-url", // invalid uri
      author: 123, // wrong type
      language: "english",
      // missing pages, publisher, title, year
    };

    const resp = await request(app).post("/books").send(badBook);

    expect(resp.statusCode).toBe(400);
    expect(resp.body.error.status).toBe(400);
    expect(Array.isArray(resp.body.error.message)).toBe(true);
    // Optional: make sure we got more than one validation error
    expect(resp.body.error.message.length).toBeGreaterThan(0);
  });
});

describe("PUT /books/:isbn", function () {
  test("Updates an existing book", async function () {
    const updateData = {
      amazon_url: "http://a.co/updated",
      author: "Updated Author",
      language: "english",
      pages: 999,
      publisher: "Updated Publisher",
      title: "Updated Title",
      year: 2020,
    };

    const resp = await request(app)
      .put(`/books/${testBook.isbn}`)
      .send(updateData);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      book: { isbn: testBook.isbn, ...updateData },
    });
  });

  test("Rejects invalid update data (schema validation)", async function () {
    const badUpdate = {
      pages: "nope", // should be integer AND likely missing required fields
    };

    const resp = await request(app)
      .put(`/books/${testBook.isbn}`)
      .send(badUpdate);

    expect(resp.statusCode).toBe(400);
    expect(resp.body.error.status).toBe(400);
    expect(Array.isArray(resp.body.error.message)).toBe(true);
  });

  test("Responds 404 if book not found", async function () {
    const updateData = {
      amazon_url: "http://a.co/updated",
      author: "Updated Author",
      language: "english",
      pages: 999,
      publisher: "Updated Publisher",
      title: "Updated Title",
      year: 2020,
    };

    const resp = await request(app).put("/books/does-not-exist").send(updateData);

    expect(resp.statusCode).toBe(404);
    expect(resp.body.error.status).toBe(404);
  });
});

describe("PATCH /books/:isbn", function () {
  test("Partially updates a book", async function () {
    const resp = await request(app)
      .patch(`/books/${testBook.isbn}`)
      .send({ pages: 999 });

    expect(resp.statusCode).toBe(200);
    expect(resp.body.book.pages).toBe(999);
    expect(resp.body.book.isbn).toBe(testBook.isbn);
  });

  test("Rejects invalid patch data", async function () {
    const resp = await request(app)
      .patch(`/books/${testBook.isbn}`)
      .send({ pages: "nope" });

    expect(resp.statusCode).toBe(400);
  });

  test("Rejects empty patch body", async function () {
    const resp = await request(app)
      .patch(`/books/${testBook.isbn}`)
      .send({});

    expect(resp.statusCode).toBe(400);
  });
});

describe("DELETE /books/:isbn", function () {
  test("Deletes a book", async function () {
    const resp = await request(app).delete(`/books/${testBook.isbn}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ message: "Book deleted" });
  });

  test("Responds 404 if book not found", async function () {
    const resp = await request(app).delete("/books/does-not-exist");

    expect(resp.statusCode).toBe(404);
    expect(resp.body.error.status).toBe(404);
  });
});
