const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Cart = require("../models/cart");
const User = require("../models/user");
const Listing = require("../models/listing");
const checkAuth = require("../middleware/check-auth");

router.get("/", checkAuth, (req, res, next) => {
  Cart.find({ createdBy: req.user.userId })
    .populate("name")
    .select("-__v")
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        cartItems: docs.map((doc) => {
          return {
            // cart_id: doc._id,
            // listingId: doc.listingId,
            // listingName: doc.listingName,
            // quantity: doc.quantity,
            // cart: docs,
            cart: doc,

            // "_id": "5ea02f877349fa4fdc46cfaf",
            // "listingId": "5ea025a3f7a0063e8c7d87b5",
            // "listingName": "iPhone 8",
            // "quantity": 2,
            // "userId": "5ea028d28ce7fa3f5c6e2816",
            // "userName": "testtest"
          };
        }),
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    });
});

router.post("/", checkAuth, (req, res, next) => {
  Listing.findById(req.body.listingId)
    .then((listing) => {
      if (!listing) {
        return res.status(404).json({
          message: "Listing not found",
        });
      }
      const cart = new Cart({
        _id: mongoose.Types.ObjectId(),
        listingId: req.body.listingId,
        listingName: listing.name,
        quantity: req.body.quantity,
        userId: req.user.userId,
      });
      return cart.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Item added to cart",
        userDetails: {
          userId: result.userId,
        },
        itemAdded: {
          cartItem_id: result._id,
          listingId: result.listing,
          listingName: result.listingName,
          quantity: result.quantity,
        },
      });
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    });
});

// this will get ind items in cart // /cart with userid in body can get user's cart
// router.get("/:userId", checkAuth, (req, res, next) => {
//   Cart.find({ userId: req.params.userId })
//     .populate("user", "-__v")
//     .select("-__v")
//     .exec()
//     .then((cart) => {
//       if (cart.length < 1) {
//         return res.status(404).json({
//           message: "No items found in cart",
//         });
//       }
//       res.status(200).json({
//         cartItem: cart,
//       });
//     })
//     .catch((err) => {
//       res.status(500).json({
//         error: err,
//       });
//     });
// });

router.delete("/:cartId", checkAuth, (req, res, next) => {
  Cart.deleteOne({ _id: req.params.cartId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Cart item deleted",
      });
    })
    .catch((err) => {
      res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    });
});

module.exports = router;
