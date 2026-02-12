process.env.NODE_ENV = "test";
require("dotenv").config();

const request = require("supertest");
const { expect } = require("chai");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");

describe("Auth", function () {
  before(async function () {
    await mongoose.connect(process.env.MONGO_URI);
  });

  beforeEach(async function () {
    await User.deleteMany({});
  });

  after(async function () {
    await mongoose.connection.close();
  });

  it("registers a user", async function () {
    const res = await request(app)
      .post("/auth/register")
      .send({ username: "rosey", password: "secret123" });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("username", "rosey");
  });

  it("logs in and returns a token", async function () {
    await request(app)
      .post("/auth/register")
      .send({ username: "rosey", password: "secret123" });

    const res = await request(app)
      .post("/auth/login")
      .send({ username: "rosey", password: "secret123" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
  });
});