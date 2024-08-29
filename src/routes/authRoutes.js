const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  const { username, password } = req.body;

  const users = fs
    .readFileSync(path.join(__dirname, "../../users.txt"), "utf8")
    .split("\n");
  const userExists = users.some((user) => user.split(":")[0] === username);

  if (userExists) {
    return res.send("The user name is already in use");
  }

  fs.appendFile(
    path.join(__dirname, "../../users.txt"),
    `${username}:${password}\n`,
    (err) => {
      if (err) {
        return res.send("Error when registering the user");
      }

      res.send("User successfully registered");
    }
  );
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const users = fs
    .readFileSync(path.join(__dirname, "../../users.txt"), "utf8")
    .split("\n");
  const validUser = users.some((user) => {
    const [storedUsername, storedPassword] = user.split(":");
    return storedUsername === username && storedPassword === password;
  });

  if (validUser) {
    req.session.loggedIn = true;
    req.session.username = username;
    res.redirect("/");
  } else {
    res.send("Incorrect username or password");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
