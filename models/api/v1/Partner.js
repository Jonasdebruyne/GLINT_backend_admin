const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Partner = mongoose.model("Partner", PartnerSchema);

module.exports = Partner;
