const express = require("express");
const router = express.Router();
const orderController = require("../../../controllers/api/v1/order"); // Make sure this path is correct

// Define your POST route
router.post("/", orderController.create); // Ensure this refers to a valid function

// Similarly, define other routes like GET, PUT, DELETE
router.get("/", orderController.index);
router.get("/:orderId", orderController.show);
router.put("/:orderId", orderController.update);
router.delete("/:orderId", orderController.destroy);

module.exports = router;
