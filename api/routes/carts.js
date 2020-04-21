const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Cart = require('../models/cart');
const Listing = require('../models/listing');

router.get('/', (req, res) => {
    
});

router.post("/", (req, res, next) => {
    Listing.findById(req.body.listingId)
        .then(listing => {
            if (!listing) {
            return res.status(404).json({
                message: "Listing not found"
            });
            }
        const cart = new Cart({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            listing: req.body.listingId,
            listingName: listing.name
        });
        return cart.save();
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
            message: "Item added to cart",
            itemAdded: {
                _id: result._id,
                listing: result.listing,
                quantity: result.quantity
            }
        });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/', (req, res) => {

});

router.delete('/', (req, res) => {

});

module.exports = router;
