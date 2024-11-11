const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Change from "Customer" to "User"
    required: true,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    type: Object, // Changed from String to Object
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
