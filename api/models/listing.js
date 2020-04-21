const mongoose = require('mongoose');

const listingSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    listingImage: {type: String, required: true},
    description: { type: String, required: true }
});

module.exports = mongoose.model('Listing', listingSchema);