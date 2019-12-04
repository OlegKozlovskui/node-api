const Bootcamp = require('../models/Bootcamp');

exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ data: { id: 10 } });
};

exports.getBootcamp = (req, res, next) => {
  res.status(200).json({ data: { id: 10 } });
};

exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data: bootcamp
    });
  } catch (e) {
    res.status(400).json({
      success: fasle,
    });
  }
};

exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({ data: { id: 10 } });
};

exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({ data: { id: 10 } });
};