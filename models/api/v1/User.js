const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/, // Verbeterde regex
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  activeUnactive: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  country: { type: String, default: "" },
  city: { type: String, default: "" },
  postalCode: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  bio: { type: String, default: "" },
});

// Voeg de plugin toe voor wachtwoordbeheer
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const User = mongoose.model("User", userSchema);

module.exports = User;
