const Order = require("../../../models/api/v1/Order");
const Product = require("../../../models/api/v1/Product");

const create = async (req, res) => {
  const { lacesColor, soleColor, insideColor, outsideColor, productCode } =
    req.body;

  // Validate required fields
  if (
    !lacesColor ||
    !soleColor ||
    !insideColor ||
    !outsideColor ||
    !productCode
  ) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields.",
    });
  }

  try {
    // Create new order
    const newOrder = new Order({
      productCode,
      lacesColor,
      soleColor,
      insideColor,
      outsideColor,
      orderStatus: "pending", // Default status
    });

    // Save the order to the database
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
    const { orderStatus, productCode } = req.query;
    const filter = {};

    // Apply filters based on the query parameters
    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }
    if (productCode) {
      filter.productCode = productCode;
    }

    // Find orders with the applied filters
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
    const { orderId } = req.params;

    // Ensure orderId is provided
    if (!orderId) {
      return res.status(400).json({
        status: "error",
        message: "Order ID is required to retrieve the order.",
      });
    }

    const order = await Order.findById(orderId)
      .populate("products.productId", "productName productPrice") // Populate product details
      .populate("customerId", "name email"); // Populate customer details if needed

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    res.json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve the order",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  const { orderId } = req.params;
  let orderData = req.body;

  // Controleer of orderId en orderData aanwezig zijn
  if (!orderId || !orderData) {
    return res.status(400).json({
      status: "error",
      message: "Order ID and order data are required for update",
    });
  }

  // Specificeer de velden die we willen toestaan voor update
  const allowedFields = [
    "orderStatus",
    "shippingAddress",
    "totalPrice",
    "products",
  ];
  const filteredData = {};

  // Zorg ervoor dat alleen de toegestane velden worden meegegeven
  allowedFields.forEach((field) => {
    if (orderData[field] !== undefined) {
      filteredData[field] = orderData[field];
    }
  });

  // Als we producten bijwerken, moeten we de totaalprijs herberekenen
  if (filteredData.products) {
    try {
      let totalPrice = 0;
      for (const item of filteredData.products) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            status: "error",
            message: `Product with ID ${item.productId} not found.`,
          });
        }
        totalPrice += product.productPrice * item.quantity;
      }
      filteredData.totalPrice = totalPrice;
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: "Error calculating total price",
        error: err.message || err,
      });
    }
  }

  try {
    // Update de bestelling met de gefilterde gegevens
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: filteredData },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    res.json({
      status: "success",
      data: { order: updatedOrder },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      status: "error",
      message: "Order could not be updated",
      error: err.message || err,
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
