const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true},
    quantity: { type: Number, required: true}
});

module.exports = mongoose.model('Cart', cartSchema);