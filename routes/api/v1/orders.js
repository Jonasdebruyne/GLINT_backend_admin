const express = require("express");
const router = express.Router();
const passport = require("passport");
const orderController = require("../../../controllers/api/v1/order"); // Import the order controller

// Create a new order
router.post("/", orderController.create);

// Get a list of orders (with optional filtering by customerId or orderStatus)
router.get("/", orderController.index);

// Get a single order by orderId
router.get("/:orderId", orderController.show);

// Update an existing order by orderId
router.put("/:orderId", orderController.update);

// Delete an order by orderId
router.delete("/:orderId", orderController.destroy);

module.exports = router;
