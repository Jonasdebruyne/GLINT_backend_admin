const jwt = require("jsonwebtoken");
const Product = require("../../../models/api/v1/Product");
require("dotenv").config(); // Zorg ervoor dat dotenv eerst wordt geladen
const cloudinary = require("cloudinary").v2;

// Cloudinary configureren
cloudinary.config({
  url: process.env.CLOUDINARY_URL, // Gebruik de volledige URL uit je .env bestand
});

const create = async (req, res) => {
  const product = req.body.product;

  // Validatie van vereiste velden
  if (
    !product ||
    !product.productCode ||
    !product.productName ||
    !product.productPrice ||
    !product.description ||
    !product.brand ||
    !product.colors ||
    !product.sizeOptions || // Vereist
    !product.lacesColor || // Vereist
    !product.soleColor || // Vereist
    !product.insideColor || // Vereist
    !product.outsideColor // Vereist
  ) {
    return res.status(400).json({
      status: "error",
      message: "Product is missing required fields.",
    });
  }

  // Validatie voor typeOfProduct (indien aanwezig)
  if (
    product.typeOfProduct &&
    !["sneaker", "boot", "sandals", "formal", "slippers"].includes(
      product.typeOfProduct
    )
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "Invalid typeOfProduct, valid values are: sneaker, boot, sandals, formal, slippers.",
    });
  }

  const {
    productCode,
    productName,
    productPrice,
    typeOfProduct = "sneaker", // Standaardwaarde
    description,
    brand,
    colors,
    sizeOptions,
    images = [], // Zet op lege array als geen afbeeldingen
    lacesColor,
    soleColor,
    insideColor, // Nieuw veld
    outsideColor, // Nieuw veld
  } = product;

  // Validatie voor kleurenvelden
  const validateColorArray = (colors, fieldName) => {
    if (
      !Array.isArray(colors) ||
      !colors.every((color) => typeof color === "string")
    ) {
      throw new Error(`${fieldName} must be an array of strings.`);
    }
  };

  try {
    validateColorArray(lacesColor, "lacesColor");
    validateColorArray(soleColor, "soleColor");
    validateColorArray(insideColor, "insideColor");
    validateColorArray(outsideColor, "outsideColor");

    // Upload afbeeldingen naar Cloudinary als ze geen Cloudinary-URL zijn
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

    // Maak het product aan met alle velden, inclusief nieuwe velden
    const newProduct = new Product({
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
    });

    // Sla het product op in de database
    await newProduct.save();

    res.json({
      status: "success",
      data: { product: newProduct },
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

const show = async (req, res) => {
  try {
    const { productCode } = req.params; // Verkrijg de productcode uit de URL-parameters

    // Zorg ervoor dat de productcode aanwezig is
    if (!productCode) {
      return res.status(400).json({
        status: "error",
        message: "Product code is required to retrieve a single product",
      });
    }

    // Zoek het product op basis van de productCode
    const product = await Product.findOne({ productCode }); // Gebruik findOne en zoek op productCode

    // Als het product niet bestaat
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: `Product with code ${productCode} not found`,
      });
    }

    res.json({
      status: "success",
      data: {
        product: product, // Toon het product
      },
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
  const { id } = req.params; // Verkrijg het product ID uit de URL-parameters
  const product = req.body.product; // Verkrijg de productgegevens uit de body

  // Controleer of de productgegevens zijn meegegeven
  if (!product) {
    return res.status(400).json({
      status: "error",
      message: "Product data is required for update.",
    });
  }

  // Haal de productvelden uit de body (je kunt de destructuring gebruiken)
  const {
    productCode,
    productName,
    productPrice,
    typeOfProduct = "sneaker", // Standaardwaarde
    description,
    brand,
    colors,
    sizeOptions,
    images = [], // Zet op lege array als geen afbeeldingen
    lacesColor,
    soleColor,
    insideColor,
    outsideColor,
  } = product;

  // Validatie van vereiste velden
  if (
    !productCode ||
    !productName ||
    !productPrice ||
    !description ||
    !brand ||
    !colors ||
    !sizeOptions || // Vereist
    !lacesColor || // Vereist
    !soleColor || // Vereist
    !insideColor || // Vereist
    !outsideColor // Vereist
  ) {
    return res.status(400).json({
      status: "error",
      message: "Product is missing required fields.",
    });
  }

  // Validatie voor typeOfProduct (indien aanwezig)
  if (
    product.typeOfProduct &&
    !["sneaker", "boot", "sandals", "formal", "slippers"].includes(
      product.typeOfProduct
    )
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "Invalid typeOfProduct, valid values are: sneaker, boot, sandals, formal, slippers.",
    });
  }

  // Validatie voor kleurenvelden
  const validateColorArray = (colors, fieldName) => {
    if (
      !Array.isArray(colors) ||
      !colors.every((color) => typeof color === "string")
    ) {
      throw new Error(`${fieldName} must be an array of strings.`);
    }
  };

  try {
    validateColorArray(lacesColor, "lacesColor");
    validateColorArray(soleColor, "soleColor");
    validateColorArray(insideColor, "insideColor");
    validateColorArray(outsideColor, "outsideColor");

    // Upload afbeeldingen naar Cloudinary als ze geen Cloudinary-URL zijn
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

    // Werk het product bij in de database
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
        releaseDate,
        lacesColor,
        soleColor,
        insideColor,
        outsideColor,
      },
      { new: true, runValidators: true } // Zorg ervoor dat de geüpdatete versie wordt teruggegeven
    );

    // Als het product niet bestaat
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
  show,
  update,
  destroy,
};
