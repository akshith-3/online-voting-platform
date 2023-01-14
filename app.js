/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
var csrf = require("tiny-csrf");
const flash = require("connect-flash");
const { elec, admin } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
var cookieParser = require("cookie-parser");

const bcrypt = require("bcrypt");

const saltRounds = 10;
const passport = require("passport");
const session = require("express-session");
const connectEnsureLogin = require("connect-ensure-login");
app.use(cookieParser("ssh! some secret string"));
app.set("view engine", "ejs");
const path = require("path");
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

const LocalStrategy = require("passport-local");

app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));

app.use(flash());

app.use(
  session({
    secret: "my-secret-super-key-21728172615261562",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "passw",
    },
    (username, password, done) => {
      admin
        .findOne({ where: { email: username } })
        .then(async function (user) {
          const result = await bcrypt.compare(password, user.passw);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return done(null, false, { message: "Invalid Email-Id" });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  admin
    .findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.get("/", async function (request, response) {
  response.render("index", {
    csrfToken: request.csrfToken(),
  });
});

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.post("/user", async (request, response) => {
  const hashedpwd = await bcrypt.hash(request.body.passw, saltRounds);
  const fName = request.body.fName;
  const lName = request.body.lName;
  const email = request.body.email;
  const pwd = request.body.passw;
  if (!fName) {
    request.flash("error", "Please make sure you enter first name");
    return response.redirect("/signup");
  }
  if (!lName) {
    request.flash("error", "Please make sure you enter last name");
    return response.redirect("/signup");
  }
  if (!email) {
    request.flash("error", "Please make sure you enter Email-ID");
    return response.redirect("/signup");
  }
  if (!pwd) {
    request.flash("error", "Please make sure you enter password");
    return response.redirect("/signup");
  }
  console.log(hashedpwd);
  try {
    const admin1 = await admin.create({
      fName: request.body.fName,
      lName: request.body.lName,
      email: request.body.email,
      passw: hashedpwd,
    });
    request.login(admin1, (err) => {
      if (err) {
        response.redirect("/signin");
      }
      response.redirect("/election");
    });
  } catch (error) {
    console.log(error);
    request.flash("error", error.message);
    return response.redirect("/signup");
  }
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/signin",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.user);
    response.redirect("/election");
  }
);

app.get(
  "/election",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    const newelections1 = await elec.allelec(loggedInUser);
    if (request.accepts("html")) {
      response.render("election", {
        newelections1,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        newelections1,
      });
    }
  }
);

app.get(
  "/election/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const Election1 = await elec.findByPk(request.params.id);
      return response.json(Election1);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.post(
  "/election/create",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const title1 = request.body.name;
    const loggedInUser = request.user.id;
    try {
      const Election1 = await elec.createelec({
        name: title1,
        adminId: loggedInUser,
      });
      response.redirect("/election");
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.get("/create", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
  res.render("create", { csrfToken: req.csrfToken() });
});

app.get("/signup", function (req, res) {
  res.render("signup", { csrfToken: req.csrfToken() });
});

app.get("/signin", function (req, res) {
  res.render("signin", { csrfToken: req.csrfToken() });
});

module.exports = app;
