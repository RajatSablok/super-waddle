const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const Cart = require("../models/cart");
const User = require("../models/user");
const Listing = require("../models/listing");

const checkAuth = require("../middleware/check-auth");

//Signup
router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        res.status(409).json({
          message: "Email already exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(400).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              name: req.body.name,
            });
            user.save().then((result) => {
              res.status(201).json({
                message: "User created",
                userDetails: {
                  userId: result._id,
                  email: result.email,
                  name: result.name,
                },
              });
            });
          }
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: "Something went wrong",
      });
    });
});

//Login
router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Email not found, please sign up to continue",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(403).json({
            message: "Incorrect password",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
              name: user[0].name,
              mobileNumber: user[0].mobileNumber,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1d",
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            userDetails: {
              userId: user[0]._id,
              userName: user[0].name,
              token: token,
            },
          });
        }
        res.status(401).json({
          message: "Auth failed",
        });
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

//Get user's profile
router.get("/profile", checkAuth, async (req, res, next) => {
  await User.findById(req.user.userId)
    .select("-__v -password")
    .exec()
    .then((user) => {
      res.status(200).json({
        userDetails: user,
      });
    })
    .catch((err) => {
      res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    });
});

//Update user's profile
router.patch("/profile", checkAuth, (req, res, next) => {
  const userId = req.user.userId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  User.updateOne({ _id: userId }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Profile updated",
      });
    })
    .catch((err) => {
      res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    });
});

//Delete current user
router.delete("/profile", checkAuth, async (req, res, next) => {
  const userId = req.user.userId;
  await Listing.deleteMany({ createdBy: userId })
    .then(async (result1) => {
      await User.deleteOne({ _id: userId })
        .exec()
        .then(async (result) => {
          await res.status(200).json({
            message: "User deleted",
          });
        })
        .catch(async (err) => {
          await res.status(500).json({
            message: "Something went wrong",
            error: err,
          });
        });
    })
    .catch(async (err) => {
      await res.status(500).json({
        message: "Something went wrong",
        error: err,
      });
    });
});

//Get all listings creaded by a particular user
router.get("/allListings", checkAuth, (req, res, next) => {
  const userId = req.user.userId;
  Listing.find({ createdBy: userId })
    .select("-__v")
    .exec()
    .then((listings) => {
      if (listings.length < 1) {
        res.status(404).json({
          count: listings.length,
          message: "No listings found for the given userId",
        });
      } else {
        res.status(200).json({
          count: listings.length,
          individualListings: listings,
        });
      }
    })
    .catch((err) => {
      res.status(400).json({
        message: "Something went wrong",
        error: err,
      });
    });
});

// //Get all items in a user's cart
// router.get("/cart", checkAuth, async (req, res, next) => {
//   const userId = req.user.userId;
//   await User.findById(userId)
//     .populate("shoppingCart.listingId")
//     .exec()
//     .then(async (result) => {
//       res.status(200).json({
//         message: "Successfully retrieved",
//         cart: result,
//       });
//     })
//     .catch(async (err) => {
//       await res.status(400).json({
//         message: "Something went wrong",
//         error: err,
//       });
//     });
// });

module.exports = router;
