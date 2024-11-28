const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  productId: {
    // Verander van productCode naar productId
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Verbindt met het Product model
    required: true, // Maak dit veld verplicht
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
