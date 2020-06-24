const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Cart = require("../models/cart");
const User = require("../models/user");
const Listing = require("../models/listing");
const checkAuth = require("../middleware/check-auth");

//Get items in a user's cart
router.get("/", checkAuth, async (req, res, next) => {
  const userId = req.user.userId;
  await User.findById(userId)
    // .populate({
    //   path: "shoppingCart",
    //   populate: { path: "listingId" },
    // })
    .exec()
    .then(async (user) => {
      const numItems = user.shoppingCart.length;
      await res.status(200).json({
        count: numItems,
        cart: user.shoppingCart,
      });
    })
    .catch(async (err) => {
      await res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    });
});

//Add to cart
router.post("/", checkAuth, async (req, res, next) => {
  const userId = req.user.userId;
  const listingId = req.body.listingId;
  const quantity = req.body.quantity;
  await User.updateOne(
    { _id: userId },
    { $push: { shoppingCart: { listingId, quantity } } }
  )
    .then(async (result) => {
      res.status(200).json({
        message: "Item added to cart",
      });
    })
    .catch(async (err) => {
      res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    });
});

router.delete("/:cartItemId", checkAuth, async (req, res, next) => {
  const userId = req.user.userId;
  const cartItemId = req.params.cartItemId;
  await User.updateOne(
    { _id: userId },
    { $pull: { shoppingCart: { _id: cartItemId } } }
  )
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
