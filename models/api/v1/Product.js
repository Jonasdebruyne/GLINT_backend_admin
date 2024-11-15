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
    enum: ["optical", "sun"],
    default: "optical",
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
  activeUnactive: {
    type: String,
    required: false,
    enum: ["active", "inactive"],
    default: "active",
  },
  glassColor: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: false,
  },
  // materials: {
  //    type: [String],
  //     required: true,
  //   },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
