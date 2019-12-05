const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');

exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();

    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    });
  } catch (err) {
    next(err);
  }
};

exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (err) {
    next(err);
  }
};

exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data: bootcamp
    });
  } catch (err) {
    next(err);
  }
};

exports.updateBootcamp = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (err) {
    next(err);
  }
};