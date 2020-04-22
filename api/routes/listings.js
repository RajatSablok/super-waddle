const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();

const Listing = require('../models/listing');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + Date.now())
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.post('/', checkAuth ,upload.single('listingImage'), (req, res, next) => {
    const listing = new Listing({
        _id: new mongoose.Types.ObjectId,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        listingImage: req.file.path
    });
    listing
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created listing successfully',
                createdListing: {
                    name: result.name,
                    price: result.price,
                    _id: result.id,
                    listingImage: result.listingImage,
                    description: result.description
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })

});

router.get('/', (req, res, next) => {
    Listing
        .find()
        .select('name price listingImage _id')
        .exec()
        .then(docs => {
            const result = {
                count: docs.length,
                listings: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        description: doc.description,
                        listingImage: doc.listingImage,
                        listing_id: doc._id
                    }
                })
            }
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })

});

router.get('/:listingId', (req, res, next) => {
    const id = req.params.listingId;
    Listing
        .findById(id)
        .select('name price description listingImage _id')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    product: doc
                })
            } else {
                res.status(404).json({
                    message: 'No valid listing found for given ID'
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

router.patch('/:listingId', checkAuth, (req, res, next) => {
    const id = req.params.listingId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value
    }
    Listing
        .updateOne({ _id: id }, { $set : updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Listing updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/listings/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.delete("/:listingId", checkAuth, (req, res, next) => {
    const id = req.params.listingId;
    Listing.deleteOne({ _id: id })
      .exec()
      .then(result => {
        res.status(200).json({
            message: 'Product deleted'
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });

module.exports = router;