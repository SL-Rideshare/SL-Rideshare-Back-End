require("dotenv").config();

const express = require("express");
const http = require("http");

const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const router = require("./api/routes");

const app = express();
const server = http.createServer(app);

connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api", router);

app.use(function (err, req, res, next) {
  res.status(err.status || 404).send("error: route doesn't exist!");
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Server running on port:", PORT);
});
