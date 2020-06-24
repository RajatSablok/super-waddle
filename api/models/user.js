const mongoose = require("mongoose");

const Listing = require("../models/listing");
// const Bidding = require("../models/bidding")

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  mobileNumber: {
    type: Number,
    match: /^([7-9][0-9]{9})$/g,
  },
  password: { type: String, required: true },
  verify: { type: Boolean, default: false },
  cart: [
    {
      listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
      },
      quantity: { type: Number },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
