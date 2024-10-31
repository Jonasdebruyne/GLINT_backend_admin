const jwt = require("jsonwebtoken");
const Product = require("../../../models/api/v1/Product");

const create = async (req, res) => {
  const product = req.body.product;

  if (
    !product ||
    !product.productCode ||
    !product.productName ||
    !product.productPrice ||
    !product.typeOfProduct ||
    !product.description || // Ensure description is in the request body
    !product.brand || // Ensure brand is in the request body
    !product.colors ||
    !product.activeUnactive ||
    !product.glassColor
  ) {
    return res.status(400).json({
      status: "error",
      message: "Product is missing required fields.",
    });
  }

  if (!["active", "inactive"].includes(product.activeUnactive)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid status, expected 'active' or 'inactive'.",
    });
  }

  const {
    productCode,
    productName,
    productPrice,
    typeOfProduct,
    description,
    brand,
    colors,
    activeUnactive,
    glassColor,
  } = product;

  try {
    const p = new Product({
      productCode,
      productName,
      productPrice,
      typeOfProduct,
      description,
      brand,
      colors,
      activeUnactive,
      glassColor,
    });

    await p.save();

    res.json({
      status: "success",
      data: { product: p },
    });
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(500).json({
      status: "error",
      message: "Product could not be saved",
      error: err.message || err,
    });
  }
};

const index = async (req, res) => {
  try {
    const { typeOfProduct, brand } = req.query;
    const filter = {};

    if (typeOfProduct) {
      filter.typeOfProduct = typeOfProduct;
    }
    if (brand) {
      filter.brand = brand;
    }

    const products = await Product.find(filter);

    res.json({
      status: "success",
      data: {
        products: products,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve products",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  const productData = req.body.product;
  const { id } = req.params; // Zorg ervoor dat je de id uit de params haalt

  if (!productData) {
    return res.status(400).json({
      status: "error",
      message: "Product data is required for update",
    });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id, // Hier geef je de ID door
      { $set: productData },
      { new: true, runValidators: true } // runValidators om ervoor te zorgen dat de validatie wordt uitgevoerd
    );

    if (!updatedProduct) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    res.json({
      status: "success",
      data: { product: updatedProduct },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      status: "error",
      message: "Product could not be updated",
      error: err.message || err,
    });
  }
};

const destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting Product", error: error.message });
  }
};

module.exports = {
  create,
  index,
  update,
  destroy,
};
