const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const config = require("config");
const cors = require("cors");
const mongoose = require("mongoose");

// Database connectie
const connection = config.get("mongodb");
mongoose
  .connect(connection, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routers
const productRouter = require("./routes/api/v1/products");
const userRouter = require("./routes/api/v1/users");
const houseStyleRouter = require("./routes/api/v1/houseStyle");

// Express-app
const app = express();

// View engine instellen
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// API-routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/houseStyle", houseStyleRouter);

// Foutafhandeling voor 404
app.use(function (req, res, next) {
  next(createError(404));
});

// Algemene foutafhandeling
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
