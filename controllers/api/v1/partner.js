const mongoose = require("mongoose");
const Partner = require("../../../models/api/v1/Partner");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const create = async (req, res) => {
  const { name, address, contact_email, contact_phone, package } = req.body;

  if (!name || !package) {
    return res.status(400).json({
      status: "error",
      message: "Name and package are required.",
    });
  }

  try {
    // Hoofdmap voor de partner, hardcoded op basis van de 'name' die wordt meegegeven
    const cloudinaryFolder = name;

    // Submap "Huisstijl" in de hoofdmap
    const huisstijlFolder = `${cloudinaryFolder}/Huisstijl`;

    // Gebruik een dummy bestand (transparante afbeelding) om de mappenstructuur te creëren
    const dummyImageURL =
      "https://static.vecteezy.com/vite/assets/photo-masthead-375-BoK_p8LG.webp";

    // Maak de hoofdmap aan in Cloudinary
    await cloudinary.uploader.upload(dummyImageURL, {
      folder: cloudinaryFolder,
      public_id: "placeholder", // Dummy bestand
    });

    // Maak de submap "Huisstijl" aan in Cloudinary
    await cloudinary.uploader.upload(dummyImageURL, {
      folder: huisstijlFolder,
      public_id: "placeholder", // Dummy bestand
    });

    // Sla de partner op in de database
    const newPartner = new Partner({
      name,
      address: address || {},
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      package,
    });

    await newPartner.save();

    res.status(201).json({
      status: "success",
      data: {
        partner: newPartner,
        folders: {
          main: cloudinaryFolder, // Hoofdmap naam
          huisstijl: huisstijlFolder, // Submap naam
        },
      },
    });
  } catch (err) {
    console.error("Error creating partner:", err);
    res.status(500).json({
      status: "error",
      message: "Partner could not be created.",
      error: err.message,
    });
  }
};

// List all partners
const index = async (req, res) => {
  try {
    const partners = await Partner.find();

    res.json({
      status: "success",
      data: { partners },
    });
  } catch (err) {
    console.error("Error fetching partners:", err);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve partners.",
      error: err.message,
    });
  }
};

// Retrieve a specific partner by ID
const show = async (req, res) => {
  try {
    const { id } = req.params; // Let op de parameternaam 'id'

    // Controleer of id aanwezig is
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Partner ID is required.",
      });
    }

    // Controleer of id een geldig MongoDB ObjectId is
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid Partner ID format.",
      });
    }

    const partner = await Partner.findById(id);

    if (!partner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found.",
      });
    }

    res.json({
      status: "success",
      data: { partner },
    });
  } catch (err) {
    console.error("Error retrieving partner:", err);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve the partner.",
      error: err.message,
    });
  }
};

// Update a partner
const update = async (req, res) => {
  try {
    const { id } = req.params; // Gebruik nu :id zoals gedefinieerd in de route
    const { name, address, contact_email, contact_phone, package } = req.body;

    if (!name || !package) {
      return res.status(400).json({
        status: "error",
        message: "Name and package are required.",
      });
    }

    const partner = await Partner.findById(id); // Gebruik id hier

    if (!partner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found.",
      });
    }

    // Update de partner met de nieuwe gegevens
    partner.name = name;
    partner.address = address || partner.address;
    partner.contact_email = contact_email || partner.contact_email;
    partner.contact_phone = contact_phone || partner.contact_phone;
    partner.package = package;

    // Sla de bijgewerkte partner op
    await partner.save();

    res.json({
      status: "success",
      data: { partner },
    });
  } catch (err) {
    console.error("Error updating partner:", err);
    res.status(500).json({
      status: "error",
      message: "Could not update the partner.",
      error: err.message,
    });
  }
};

// Delete a partner
const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPartner = await Partner.findByIdAndDelete(id);

    if (!deletedPartner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Partner deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting partner:", err);
    res.status(500).json({
      status: "error",
      message: "Could not delete the partner.",
      error: err.message,
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
