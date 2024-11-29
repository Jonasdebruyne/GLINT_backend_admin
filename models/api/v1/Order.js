const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    lacesColor: { type: String, required: true },
    soleColor: { type: String, required: true },
    insideColor: { type: String, required: true },
    outsideColor: { type: String, required: true },
    orderStatus: { type: String, default: "pending" },
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      address: {
        street: { type: String, required: true },
        houseNumber: { type: String, required: true },
        postalCode: { type: String, required: true },
        city: { type: String, required: true },
      },
      message: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
