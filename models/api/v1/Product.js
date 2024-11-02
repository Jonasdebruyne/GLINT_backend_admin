const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
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
  // price: {
  //   type: String,
  //   required: true,
  // },
  // headImage: {
  //   type: String,
  //   required: true,
  // },
  // modelImage: {
  //   type: String,
  //   required: true,
  // },
  // modelImage2: {
  //   type: String,
  //   required: true,
  // },
  //   stock: {
  //     type: Number,
  //     required: true,
  //   },
  // materials: {
  //     type: Array,
  //     required: true,
  //   },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
