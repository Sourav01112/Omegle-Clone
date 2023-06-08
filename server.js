const express = require("express");
// Path module will access and manipulate FileSystem
const path = require("path");
require("dotenv").config();
const bodyparser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyparser.urlencoded({ extended: true }));

app.use(bodyparser.json());

// to use EJS
app.set("view engine", "ejs");

// Using Path module
app.use("/css", express.static(path.resolve(__dirname, "Assets/css")));
app.use("/img", express.static(path.resolve(__dirname, "Assets/img")));
app.use("/js", express.static(path.resolve(__dirname, "Assets/js")));

// Routes
app.use("/", require("./Server-backend/routes/router"));

// Server
var server = app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
