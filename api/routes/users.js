const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

const Cart = require("../models/cart");
const User = require("../models/user");
const Listing = require("../models/listing");
const checkAuth = require("../middleware/check-auth");

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

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Email not found, please sugn up to continue",
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
router.get("/profile", checkAuth, (req, res, next) => {
  User.findById(req.user.userId)
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
router.delete("/profile", checkAuth, (req, res, next) => {
  User.deleteOne({ _id: req.user.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err,
      });
    });
});

//Get all registered accounts for admin use
// router.get('/accounts', (req, res, next) => {
//     User
//         .find()
//         .then(docs => {
//             const result = {
//                 count: docs.length,
//                 listings: docs.map(doc => {
//                     return {
//                         individualUser: doc
//                     }
//                 })
//             }
//             res.status(200).json(result);
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({
//                 error: err
//             })
//         })
// })

module.exports = router;
