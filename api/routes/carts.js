const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Cart = require('../models/cart');
const Listing = require('../models/listing');
const checkAuth = require('../middleware/check-auth');

router.get('/', checkAuth, (req, res, next) => {
    Cart
        .find()
        .populate('name')
        .select('-__v')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                cartItems: docs.map(doc => {
                    return {
                        _id: doc._id,
                        listing: doc.listing,
                        quantity: doc.quantity
                    }
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
});

router.post("/", checkAuth, (req, res, next) => {
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

router.get('/:cartId', checkAuth, (req, res, next) => {
    Cart
        .findById(req.params.cartId)
        .populate('listing', '-__v')
        .select('-__v')
        .exec()
        .then(cart => {
            if (!cart) {
                return res.status(404).json({
                    message: 'Item not found in cart??'
                })
            }
            res.status(200).json({
                cartItem: cart,
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

router.delete('/:cartId', checkAuth, (req, res, next) => {
    Cart
    .deleteOne({ _id: req.params.cartId })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Cart item deleted'
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
});

module.exports = router;
