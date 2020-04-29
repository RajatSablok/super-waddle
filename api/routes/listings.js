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
        cb(null,  Date.now() + file.originalname)
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
        quantity: req.body.quantity,
        description: req.body.description,
        listingImage: req.file.path,
        createdBy: req.body.createdBy,
        biddingApplicable: req.body.biddingApplicable,
        offerApplicable: req.body.offerApplicable
    });
    listing
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Created listing successfully',
                createdListing: {
                    listing_id: result.id,
                    name: result.name,
                    price: result.price,
                    quantity: result.quantity,
                    listingImage: result.listingImage,
                    description: result.description,
                    listingCreatedBy: result.createdBy,
                    biddingApplicable: result.biddingApplicable,
                    offerApplicable: result.offerApplicable
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

//Get all listings
router.get('/', (req, res, next) => {
    Listing
        .find()
        .select('-__v')
        .exec()
        .then(docs => {
            const result = {
                count: docs.length,
                listings: docs.map(doc => {
                    return {
                        individualListing: doc
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

//Get individual listings
router.get('/:listingId', (req, res, next) => {
    const id = req.params.listingId;
    Listing
        .findById(id)
        .select('-__v')
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

//Update a listing
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

//Delete a listing
router.delete("/:listingId", checkAuth, (req, res, next) => {
    const id = req.params.listingId;
    Listing
    .deleteOne({ _id: id })
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

//Get all listings for a particular user
router.get('/user/:createdBy', checkAuth, (req, res, next) => {
    Listing
        .find({ createdBy : req.params.createdBy })
        .select('-__v')
        .exec()
        .then(listings => {
            if (listings.length < 1) {
                res.status(200).json({
                    count: listings.length,
                    message: 'No listings found for the given userId'
                })
            } else {
                res.status(200).json({
                    count: listings.length,
                    individualListings: listings
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});


module.exports = router;