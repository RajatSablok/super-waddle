const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Cart = require('../models/cart');
const User = require('../models/user');
const Listing = require('../models/listing');
const Bidding = require('../models/bidding');

const checkAuth = require('../middleware/check-auth');

//Get all the current bids for a particular listing
router.get('/:listingId', (req, res, next) => {
    Bidding
        .find({ listingId: req.params.listingId })
        .select('-__v')
        .exec()
        .then(bids => {
            if (bids.length < 1) {
                res.status(404).json({
                    count: bids.length,
                    message: 'No current bids on this listing'
                })
            } else {
                res.status(200).json({
                    count: bids.length,
                    bids: bids
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}); 

//Bid to an existing listing
router.post('/:listingId', checkAuth, (req, res, next) => {
    const bid =  new Bidding({
        _id : new mongoose.Types.ObjectId,
        listingId: req.params.listingId,
        bidAmount: req.body.bidAmount,
        bidBy: req.body.userId
    });
    bid
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Placed bid successfully',
                bidDetails: result
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});

//Update your bid amount


module.exports = router;