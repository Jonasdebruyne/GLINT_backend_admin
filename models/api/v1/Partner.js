const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    postal_code: { type: String, required: false },
    country: { type: String, required: false },
  },
  contact_email: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // E-mailvalidatie
      },
      message: (props) => `${props.value} is geen geldig e-mailadres!`,
    },
  },
  contact_phone: {
    type: String,
    required: false,
  },
  package: {
    type: String,
    enum: ["standard", "pro"],
    default: "standard",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Partner = mongoose.model("Partner", PartnerSchema);

module.exports = Partner;
