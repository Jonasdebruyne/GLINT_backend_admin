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
    required: false,
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
  activeUnactive: {
    type: String,
    required: false,
    enum: ["active", "inactive"],
    default: "active",
  },
  material: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  inStock: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: false,
  },
  releaseDate: {
    type: Date,
    required: false,
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
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
