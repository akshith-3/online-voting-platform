/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");
//const csrf = require("tiny-csrf")
const db = require("../models/index");
const app = require("../app");
let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}

describe("My-Voting-App", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });
  test("Sign up for first user", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/user").send({
      fName: "Test",
      lName: "User A",
      email: "user.a@test.com",
      passw: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign Out for first user", async () => {
    let res = await agent.get("/elections");
    const csrfToken = extractCsrfToken(res);
    res = await agent.get("/signout").send({
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Sign up for second user", async () => {
    let response = await agent.get("/signup");
    const csrfToken = extractCsrfToken(response);
    response = await agent.post("/user").send({
      fName: "Test",
      lName: "User B",
      email: "user.b@test.com",
      passw: "12345678",
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Sign Out for second user", async () => {
    let response = await agent.get("/election");
    const csrfToken = extractCsrfToken(response);
    response = await agent.get("/signout").send({
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });
});
