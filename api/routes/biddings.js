const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Cart = require("../models/cart");
const User = require("../models/user");
const Listing = require("../models/listing");
const Bidding = require("../models/bidding");

const checkAuth = require("../middleware/check-auth");

//Get all the current bids for a particular listing
router.get("/:listingId", (req, res, next) => {
  Bidding.find({ listingId: req.params.listingId })
    .select("-__v")
    .exec()
    .then((bids) => {
      if (bids.length < 1) {
        res.status(404).json({
          count: bids.length,
          message: "No current bids on this listing",
        });
      } else {
        res.status(200).json({
          count: bids.length,
          bids: bids,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//Bid to an existing listing
router.post("/:listingId", checkAuth, (req, res, next) => {
  const bid = new Bidding({
    _id: new mongoose.Types.ObjectId(),
    listingId: req.params.listingId,
    bidAmount: req.body.bidAmount,
    bidBy: req.body.userId,
  });
  bid
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Placed bid successfully",
        bidDetails: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//Update your bid amount
router.patch("/:listingId", checkAuth, (req, res, next) => {
  const id = req.params.listingId;
  // var currentBid

  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  // Bidding
  //     .find({ listingId: id })
  //     .exec()
  //     .then(result => {
  //         console.log(result[0].bidAmount)
  //         currentBid = result[0].bidAmount
  //     })
  //     .catch(err => {
  //         console.log(err);
  //         res.status(500).json({
  //             error: err
  //         })
  //     });

  // console.log("currentbid=")

  Bidding.updateOne({ listingId: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Bid updated",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//Get all bids by a particular user
router.get("/user/:userId", checkAuth, (req, res, next) => {
  Bidding.find({ bidBy: req.params.userId })
    .select("-__v")
    .exec()
    .then((bids) => {
      if (bids.length < 1) {
        res.status(404).json({
          count: bids.length,
          message: "No bids placed by you",
        });
      } else {
        res.status(200).json({
          count: bids.length,
          bids: bids,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
