const Order = require("../../../models/api/v1/Order");
const Product = require("../../../models/api/v1/Product");

const mongoose = require("mongoose");

const create = async (req, res) => {
  const { lacesColor, soleColor, insideColor, outsideColor } = req.body;
  const productId = req.params.productId; // Haal productId uit de URL-parameter

  // Valideer de verplichte velden
  if (
    !lacesColor ||
    !soleColor ||
    !insideColor ||
    !outsideColor ||
    !productId
  ) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields.",
    });
  }

  // Valideer of productId een geldig ObjectId is
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid productId. It must be a valid 24-character hex string.",
    });
  }

  try {
    // Zet productId om naar ObjectId
    const validProductId = new mongoose.Types.ObjectId(productId); // Gebruik 'new' om een ObjectId te creëren

    // Maak een nieuwe bestelling aan
    const newOrder = new Order({
      productId: validProductId, // Gebruik de geconverteerde productId
      lacesColor,
      soleColor,
      insideColor,
      outsideColor,
      orderStatus: "pending", // Standaard status
    });

    // Sla de bestelling op in de database
    await newOrder.save();

    res.status(201).json({
      status: "success",
      data: { order: newOrder },
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({
      status: "error",
      message: "Order could not be created.",
      error: err.message || err,
    });
  }
};

const index = async (req, res) => {
  try {
    const { orderStatus, productId } = req.query; // Verwacht 'productId' in plaats van 'productCode'
    const filter = {};

    // Pas de filters aan op basis van de queryparameters
    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }
    if (productId) {
      // Wijzig dit naar productId
      filter.productId = productId; // Verander hier naar productId
    }

    // Zoek orders met de toegevoegde filters
    const orders = await Order.find(filter);

    res.json({
      status: "success",
      data: { orders },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve orders",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const { orderId } = req.params; // Verwacht orderId in de URL

    if (!orderId) {
      return res.status(400).json({
        status: "error",
        message: "Order ID is required to retrieve the order.",
      });
    }

    // Zoek de order met orderId in plaats van productCode
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    // Stuur de gevonden order als JSON
    res.json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    console.error("Error retrieving order:", error.message);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve the order",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { orderId } = req.params; // Verwacht orderId in de URL
    const { orderStatus, lacesColor, soleColor, insideColor, outsideColor } =
      req.body;

    // Validatie van de velden
    if (
      !orderStatus ||
      !lacesColor ||
      !soleColor ||
      !insideColor ||
      !outsideColor
    ) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields.",
      });
    }

    // Zoek de order op basis van orderId
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found.",
      });
    }

    // Werk de order bij
    order.orderStatus = orderStatus;
    order.lacesColor = lacesColor;
    order.soleColor = soleColor;
    order.insideColor = insideColor;
    order.outsideColor = outsideColor;

    // Sla de gewijzigde order op
    await order.save();

    res.json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    console.error("Error updating order:", error.message);
    res.status(500).json({
      status: "error",
      message: "Could not update the order.",
      error: error.message,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error deleting order",
      error: error.message,
    });
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  destroy,
};
