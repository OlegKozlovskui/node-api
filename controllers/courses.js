const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

exports.getCourses = asyncHandler(async (req, res) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcampId: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if(!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

exports.addCourse = asyncHandler(async (req, res, next) => {
  const { id: userId, role } = req.body.user;
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = userId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if(!bootcamp) {
    return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404));
  }

  if (bootcamp.user.toString() !== userId && role !== 'admin') {
    return next(new ErrorResponse(`User ${userId} is not authorized to add a course`, 401));
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course
  });
});

exports.updateCourse = asyncHandler(async (req, res, next) => {
  const { id: userId, role } = req.body.user;
  let course = await Course.findById(req.params.id);

  if(!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
  }

  if (course.user.toString() !== userId && role !== 'admin') {
    return next(new ErrorResponse(`User ${userId} is not authorized to update a course`, 401));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const { id: userId, role } = req.body.user;
  const course = await Course.findById(req.params.id);

  if(!course) {
    return next(new ErrorResponse(`No course with the id of ${req.params.id}`, 404));
  }

  if (course.user.toString() !== userId && role !== 'admin') {
    return next(new ErrorResponse(`User ${userId} is not authorized to update a course`, 401));
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
