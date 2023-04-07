require("dotenv").config();

const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");
const morgon = require("morgan");

const connectDB = require("./config/db");
const router = require("./api/routes");

const app = express();

connectDB();

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgon("dev"));

app.use("/api", router);

app.use(function (err, req, res, next) {
  res.status(err.status || 404).send("error: route doesn't exist!");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("server running on port:", PORT);
});
