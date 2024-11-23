const Partner = require("../../../models/api/v1/Partner");

// Create a new partner
const create = async (req, res) => {
  const { name, address, contact_email, contact_phone, package } = req.body;

  // Validate required fields
  if (!name || !package) {
    return res.status(400).json({
      status: "error",
      message: "Name and package are required.",
    });
  }

  try {
    // Create a new partner
    const newPartner = new Partner({
      name,
      address: address || {},
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      package,
    });

    // Save the partner to the database
    await newPartner.save();

    res.status(201).json({
      status: "success",
      data: { partner: newPartner },
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
    const { partnerId } = req.params;

    if (!partnerId) {
      return res.status(400).json({
        status: "error",
        message: "Partner ID is required.",
      });
    }

    const partner = await Partner.findById(partnerId);

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
    const { partnerId } = req.params;
    const { name, address, contact_email, contact_phone, package } = req.body;

    if (!name || !package) {
      return res.status(400).json({
        status: "error",
        message: "Name and package are required.",
      });
    }

    const partner = await Partner.findById(partnerId);

    if (!partner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found.",
      });
    }

    // Update fields
    partner.name = name;
    partner.address = address || partner.address;
    partner.contact_email = contact_email || partner.contact_email;
    partner.contact_phone = contact_phone || partner.contact_phone;
    partner.package = package;

    // Save updates
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
    const { partnerId } = req.params;

    const deletedPartner = await Partner.findByIdAndDelete(partnerId);

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
