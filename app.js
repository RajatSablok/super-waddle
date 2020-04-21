const express = require('express');
const mongoose = require("mongoose");
const morgan = require('morgan');
const bodyParser = require("body-parser");

const app = express ();

const listingRoutes = require('./api/routes/listings');

const PORT = process.env.PORT || 3000;
const dbPass = process.env.MONGO_ATLAS_PW
const dbURI = 'mongodb+srv://RajatSablok:'+dbPass+'@cluster0-w6myw.mongodb.net/test?retryWrites=true&w=majority';

mongoose
  .connect( dbURI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
  .then(() => console.log( 'Database Connected' ))
  .catch(err => console.log( err ));

mongoose.Promise = global.Promise;

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/listings', listingRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.listen(3000, () => {
    console.log(`Listening on port ${PORT}`)
})