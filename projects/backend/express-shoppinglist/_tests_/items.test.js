const request = require("supertest");
const app = require("../app");
let items = require("../fakeDb");

beforeEach(function () {
  items.push({ name: "popsicle", price: 1.45 });
  items.push({ name: "cheerios", price: 3.4 });
});

afterEach(function () {
  items.length = 0;
});

describe("GET /items", function () {
  test("Gets a list of items", async function () {
    const resp = await request(app).get("/items");
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual([
      { name: "popsicle", price: 1.45 },
      { name: "cheerios", price: 3.4 },
    ]);
  });
});

describe("POST /items", function () {
  test("Creates a new item", async function () {
    const resp = await request(app)
      .post("/items")
      .send({ name: "chips", price: 2.0 });

    expect(resp.statusCode).toBe(201);
    expect(resp.body).toEqual({ added: { name: "chips", price: 2.0 } });
  });
});

describe("GET /items/:name", function () {
  test("Gets a single item", async function () {
    const resp = await request(app).get("/items/popsicle");
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ name: "popsicle", price: 1.45 });
  });

  test("Responds 404 if item not found", async function () {
    const resp = await request(app).get("/items/notreal");
    expect(resp.statusCode).toBe(404);
  });
});

describe("PATCH /items/:name", function () {
  test("Updates an item", async function () {
    const resp = await request(app)
      .patch("/items/popsicle")
      .send({ name: "new popsicle", price: 2.45 });

    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({
      updated: { name: "new popsicle", price: 2.45 },
    });
  });
});

describe("DELETE /items/:name", function () {
  test("Deletes an item", async function () {
    const resp = await request(app).delete("/items/popsicle");
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toEqual({ message: "Deleted" });
  });
});
