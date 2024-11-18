const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
  },
  lacesColor: {
    type: String,
    required: true,
  },
  soleColor: {
    type: String,
    required: true,
  },
  insideColor: {
    type: String,
    required: true,
  },
  outsideColor: {
    type: String,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
