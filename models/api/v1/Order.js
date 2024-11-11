const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId, // reference to the Customer model
    required: true,
    ref: "Customer", // assuming there's a Customer model
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now,
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
        type: mongoose.Schema.Types.ObjectId, // reference to the Product model
        required: true,
        ref: "Product", // assuming you still have the Product model
      },
      productName: {
        type: String,
        required: true,
      },
      productPrice: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  deliveryDate: {
    type: Date,
    required: false,
  },
  notes: {
    type: String,
    required: false,
  },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
