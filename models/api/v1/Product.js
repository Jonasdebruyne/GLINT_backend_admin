const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  typeOfProduct: {
    type: String,
    required: true,
    enum: ["sneaker", "boot", "sandals", "formal", "slippers"],
    default: "sneaker",
  },
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  colors: {
    type: [String],
    required: true,
  },
  sizeOptions: {
    type: [String],
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  lacesColor: {
    type: [String],
    required: true,
  },
  soleColor: {
    type: [String],
    required: true,
  },
  insideColor: {
    type: [String],
    required: true,
  },
  outsideColor: {
    type: [String],
    required: true,
  },
  partnerId: {
    // Nieuwe veld voor partnerId
    type: mongoose.Schema.Types.ObjectId, // Gebruik ObjectId als het een referentie is naar een ander model, zoals Partner.
    required: true, // Aannemende dat dit een verplicht veld is
  },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
