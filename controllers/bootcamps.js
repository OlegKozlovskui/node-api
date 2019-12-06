const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');

exports.getBootcamps = asyncHandler(async (req, res) => {
  let query;
  let queryStr = JSON.stringify(req.query);

  queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  query = Bootcamp.find(JSON.parse(queryStr));
  const bootcamps = await query;

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  console.log('Bootcamp', bootcamp);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const location = await geocoder.geocode(zipcode);
  const lng = location[0].longitude;
  const lat = location[0].latitude;
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [ [ lng, lat, ], radius ] } }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.left,
    data: bootcamps
  });
});