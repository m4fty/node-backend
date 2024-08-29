const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 5000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "node_course_secret",
    resave: false,
    saveUninitialized: true,
  })
);

const authRoutes = require("./src/routes/authRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");

app.use("/", authRoutes);
app.use("/", reviewRoutes);

app.listen(port, () => {
  console.log(`Server running`);
});
