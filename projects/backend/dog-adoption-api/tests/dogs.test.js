process.env.NODE_ENV = "test";
require("dotenv").config();

const request = require("supertest");
const { expect } = require("chai");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const Dog = require("../models/Dog");

async function registerAndLogin(username) {
  await request(app).post("/auth/register").send({ username, password: "pw123456" });
  const res = await request(app).post("/auth/login").send({ username, password: "pw123456" });
  return res.body.token;
}

describe("Dogs", function () {
  before(async function () {
    await mongoose.connect(process.env.MONGO_URI);
  });

  beforeEach(async function () {
    await Promise.all([User.deleteMany({}), Dog.deleteMany({})]);
  });

  after(async function () {
    await mongoose.connection.close();
  });

  it("requires auth to create a dog", async function () {
    const res = await request(app).post("/dogs").send({ name: "Milo", description: "Good boy" });
    expect(res.status).to.equal(401);
  });

  it("creates a dog for an authenticated user", async function () {
    const token = await registerAndLogin("owner1");

    const res = await request(app)
      .post("/dogs")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Milo", description: "Good boy" });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("name", "Milo");
  });

  it("prevents adopting your own dog", async function () {
    const token = await registerAndLogin("owner1");

    const dogRes = await request(app)
      .post("/dogs")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Milo", description: "Good boy" });

    const adoptRes = await request(app)
      .post(`/dogs/${dogRes.body._id}/adopt`)
      .set("Authorization", `Bearer ${token}`)
      .send({ thankYouMessage: "Thanks!" });

    expect(adoptRes.status).to.equal(403);
  });

  it("allows adopting someone else's dog", async function () {
    const ownerToken = await registerAndLogin("owner1");
    const adopterToken = await registerAndLogin("adopter1");

    const dogRes = await request(app)
      .post("/dogs")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Milo", description: "Good boy" });

    const adoptRes = await request(app)
      .post(`/dogs/${dogRes.body._id}/adopt`)
      .set("Authorization", `Bearer ${adopterToken}`)
      .send({ thankYouMessage: "Thank you for caring for Milo!" });

    expect(adoptRes.status).to.equal(200);
    expect(adoptRes.body).to.have.property("status", "adopted");
  });

  it("prevents removing an adopted dog", async function () {
    const ownerToken = await registerAndLogin("owner1");
    const adopterToken = await registerAndLogin("adopter1");

    const dogRes = await request(app)
      .post("/dogs")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Milo", description: "Good boy" });

    await request(app)
      .post(`/dogs/${dogRes.body._id}/adopt`)
      .set("Authorization", `Bearer ${adopterToken}`)
      .send({ thankYouMessage: "Thanks!" });

    const delRes = await request(app)
      .delete(`/dogs/${dogRes.body._id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(delRes.status).to.equal(409);
  });
});