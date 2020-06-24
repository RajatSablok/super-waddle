const mongoose = require("mongoose");

const biddingSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, //bidding ID
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  }, //original listing ID
  // listingName: { type: String, required: true }, //original listing name
  // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, //seller ID
  bidAmount: { type: Number, required: true },
  bidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Bidding", biddingSchema);
