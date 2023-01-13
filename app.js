const express = require("express");
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.get("/", async function (request, response) {
  response.render("index");
});

module.exports = app;
