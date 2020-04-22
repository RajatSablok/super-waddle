const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true},
    listingName: { type: String, required: true },
    quantity: { type: Number, required: true},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, //jiska cart hai wo user
    userName: { type: String, ref: 'User', required: true } //jiska cart hai wo user
});

module.exports = mongoose.model('Cart', cartSchema);