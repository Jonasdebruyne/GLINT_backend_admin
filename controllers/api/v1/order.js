const Order = require("../../../models/api/v1/Order");
const Product = require("../../../models/api/v1/Product");

const create = async (req, res) => {
  const { customerId, products, shippingAddress, paymentStatus } = req.body;

  // Validate required fields
  if (
    !customerId ||
    !Array.isArray(products) ||
    !products.length ||
    !shippingAddress ||
    !paymentStatus
  ) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields.",
    });
  }

  try {
    // Calculate total price and verify product details
    let totalPrice = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          status: "error",
          message: `Product with ID ${item.productId} not found.`,
        });
      }
      // Calculate total price
      totalPrice += product.productPrice * item.quantity;

      // Optionally, add productName and productPrice to the products array in order
      item.productPrice = product.productPrice;
      item.productName = product.productName;
    }

    // Create order
    const order = new Order({
      customerId,
      orderDate: new Date(),
      orderStatus: "pending",
      products,
      totalPrice,
      shippingAddress,
      paymentStatus,
    });

    await order.save();

    res.json({
      status: "success",
      data: { order },
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({
      status: "error",
      message: "Order could not be created",
      error: err.message || err,
    });
  }
};

const index = async (req, res) => {
  try {
    const { customerId, orderStatus } = req.query;
    const filter = {};

    if (customerId) {
      filter.customerId = customerId;
    }
    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }

    const orders = await Order.find(filter)
      .populate("products.productId", "productName productPrice") // Populate product details
      .populate("customerId", "name email"); // Populate customer details if needed

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
