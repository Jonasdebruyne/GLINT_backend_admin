const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const config = require("config");
const cors = require("cors");
const connection = config.get("mongodb");
const passport = require("./passport/passport");
const mongoose = require("mongoose");
mongoose.connect(connection);
const productRouter = require("./routes/api/v1/products");
const userRouter = require("./routes/api/v1/users");
const houseStyleRouter = require("./routes/api/v1/housestyle");
const app = express();

// Set the port
const PORT = process.env.PORT || 3001; // Gebruik poort uit omgevingsvariabelen of 3000 als standaard

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/houseStyle", houseStyleRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

// Start de server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
