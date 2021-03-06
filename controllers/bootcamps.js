const path = require('path');

const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');

exports.getBootcamps = asyncHandler(async (req, res) => {

  res.status(200).json(res.advancedResults);
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
  const { id: userId, role } = req.body.user;
  const publishedBootcamp = await Bootcamp.findOne({ user: userId });
  req.body.user = userId;

  if (publishedBootcamp && role !== 'admin') {
    return next(new ErrorResponse(`The user with ID ${userId} has already published a bootcamp.`, 401));
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
});

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const { id: userId, role } = req.body.user;
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
  }

  if (bootcamp.user.toString() !== userId && role !== 'admin') {
    return next(new ErrorResponse(`User ${userId} is not authorized to update this bootcamp`, 401));
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: bootcamp
  });
});

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { id: userId, role } = req.body.user;
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
  }

  if (bootcamp.user.toString() !== userId && role !== 'admin') {
    return next(new ErrorResponse(`User ${userId} is not authorized to update this bootcamp`, 401));
  }

  bootcamp.remove();

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

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const { id: userId, role } = req.body.user;
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
  }

  if (bootcamp.user.toString() !== userId && role !== 'admin') {
    return next(new ErrorResponse(`User ${userId} is not authorized to update this bootcamp`, 401));
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const { file } = req.files;

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      return next(new ErrorResponse('Problem with file Upload', 400));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
