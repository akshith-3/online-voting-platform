/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
const session = require("express-session");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.get("/", async function (request, response) {
  response.render("index");
});

app.get("/signup", function (request, response) {
  response.render("signup");
});

app.get("/signin", function (request, response) {
  response.render("signin");
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/signin",
  }),
  function (request, response) {
    response.redirect("/election");
  }
);

module.exports = app;
