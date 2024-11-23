const jwt = require("jsonwebtoken");
const Product = require("../../../models/api/v1/Product");
require("dotenv").config(); // Ensure dotenv is loaded first
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const create = async (req, res) => {
  try {
    const {
      productCode,
      productName,
      productPrice,
      typeOfProduct,
      description,
      brand,
      colors,
      sizeOptions,
      images,
      lacesColor,
      soleColor,
      insideColor,
      outsideColor,
    } = req.body;

    // Ensure all required fields are present
    if (
      !productCode ||
      !productName ||
      !productPrice ||
      !description ||
      !brand
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: productCode, productName, productPrice, description, brand",
      });
    }

    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization required" });
    }

    // Verify and decode the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure to use your secret key here
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Extract partnerId from the decoded token
    const partnerId = decoded.companyId;

    // Create new product
    const newProduct = new Product({
      productCode,
      productName,
      productPrice,
      typeOfProduct,
      description,
      brand,
      colors,
      sizeOptions,
      images,
      lacesColor,
      soleColor,
      insideColor,
      outsideColor,
      partnerId,
    });

    // Save the new product to the database
    await newProduct.save();

    res.status(201).json({
      status: "success",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the product." });
  }
};

const index = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization required" });
    }

    // Verify and decode the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure to use your secret key here
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Extract partnerId from the decoded token
    const partnerId = decoded.companyId;

    const { typeOfProduct, brand } = req.query;
    const filter = { partnerId }; // Add filter for partnerId to ensure we only return products belonging to the logged-in company

    if (typeOfProduct) {
      filter.typeOfProduct = typeOfProduct;
    }
    if (brand) {
      filter.brand = brand;
    }

    // Fetch products using the filter
    const products = await Product.find(filter);

    res.json({
      status: "success",
      data: { products },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve products",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const { productCode } = req.params;

    if (!productCode) {
      return res.status(400).json({
        status: "error",
        message: "Product code is required to retrieve a single product",
      });
    }

    const product = await Product.findOne({ productCode });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: `Product with code ${productCode} not found`,
      });
    }

    res.json({
      status: "success",
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve product",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  const product = req.body.product;

  if (!product) {
    return res.status(400).json({
      status: "error",
      message: "Product data is required for update.",
    });
  }

  const {
    productCode,
    productName,
    productPrice,
    typeOfProduct = "sneaker",
    description,
    brand,
    colors,
    sizeOptions,
    images = [],
    lacesColor,
    soleColor,
    insideColor,
    outsideColor,
  } = product;

  if (
    !productCode ||
    !productName ||
    !productPrice ||
    !description ||
    !brand ||
    !colors ||
    !sizeOptions ||
    !lacesColor ||
    !soleColor ||
    !insideColor ||
    !outsideColor
  ) {
    return res.status(400).json({
      status: "error",
      message: "Product is missing required fields.",
    });
  }

  try {
    validateColorArray(lacesColor, "lacesColor");
    validateColorArray(soleColor, "soleColor");
    validateColorArray(insideColor, "insideColor");
    validateColorArray(outsideColor, "outsideColor");

    let uploadedImages = [];
    for (const image of images) {
      if (image.startsWith("https://res.cloudinary.com")) {
        uploadedImages.push(image);
      } else {
        const result = await cloudinary.uploader.upload(image, {
          folder: "Odette Lunettes",
          resource_type: "auto",
          format: "png",
        });
        uploadedImages.push(result.secure_url);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        productCode,
        productName,
        productPrice,
        typeOfProduct,
        description,
        brand,
        colors,
        sizeOptions,
        images: uploadedImages,
        lacesColor,
        soleColor,
        insideColor,
        outsideColor,
      },
      { new: true, runValidators: true }
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
    console.error("Error updating product:", err);
    res.status(500).json({
      status: "error",
      message: "Product could not be updated",
      error: err.message || err,
    });
  }
};

const destroy = async (req, res) => {
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
  show,
  update,
  destroy,
};
