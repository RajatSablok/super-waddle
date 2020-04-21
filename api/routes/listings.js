const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const router = express.Router();


const Listing = require('../models/listing');

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

router.post('/', upload.single('listingImage'), (req, res, next) => {
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

router.patch('/', (req, res, next) => {
    res.status(200).json({
        message: 'listing updated'
    });
});

router.delete('/', (req, res, next) => {
    res.status(200).json({
        message: 'listing deleted'
    });
});

module.exports = router;