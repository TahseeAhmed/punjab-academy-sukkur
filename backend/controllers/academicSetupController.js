const ClassSection = require('../models/ClassSection');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const { asyncHandler } = require('../middleware/errorHandler');

// ---------- ClassSection ----------

// @desc    Create a class/section
// @route   POST /api/classes
// @access  Private/Admin
const createClass = asyncHandler(async (req, res) => {
  const { className, section, academicYear, classTeacher, capacity } = req.body;
  if (!className || !section || !academicYear) {
    return res.status(400).json({ message: 'className, section and academicYear are required' });
  }
  const newClass = await ClassSection.create({ className, section, academicYear, classTeacher, capacity });
  res.status(201).json(newClass);
});

// @desc    Get all classes (with student counts)
// @route   GET /api/classes
// @access  Private
const getClasses = asyncHandler(async (req, res) => {
  const classes = await ClassSection.find()
    .populate({ path: 'classTeacher', populate: { path: 'user', select: 'name' } })
    .sort({ className: 1, section: 1 });

  const withCounts = await Promise.all(
    classes.map(async (c) => {
      const count = await Student.countDocuments({ classSection: c._id, status: 'active' });
      return { ...c.toObject(), studentCount: count };
    })
  );

  res.json(withCounts);
});

// @desc    Update a class/section
// @route   PUT /api/classes/:id
// @access  Private/Admin
const updateClass = asyncHandler(async (req, res) => {
  const cls = await ClassSection.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  res.json(cls);
});

// @desc    Delete a class/section
// @route   DELETE /api/classes/:id
// @access  Private/Admin
const deleteClass = asyncHandler(async (req, res) => {
  const studentCount = await Student.countDocuments({ classSection: req.params.id, status: 'active' });
  if (studentCount > 0) {
    return res.status(400).json({ message: `Cannot delete: ${studentCount} active student(s) assigned to this class` });
  }
  const cls = await ClassSection.findByIdAndDelete(req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  res.json({ message: 'Class deleted successfully' });
});

// ---------- Subject ----------

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = asyncHandler(async (req, res) => {
  const { name, code, classSection, teacher } = req.body;
  if (!name || !code || !classSection) {
    return res.status(400).json({ message: 'name, code and classSection are required' });
  }
  const subject = await Subject.create({ name, code, classSection, teacher });
  res.status(201).json(subject);
});

// @desc    Get subjects (optionally filtered by class)
// @route   GET /api/subjects
// @access  Private
const getSubjects = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.classSection) filter.classSection = req.query.classSection;
  if (req.query.teacher) filter.teacher = req.query.teacher;

  const subjects = await Subject.find(filter)
    .populate('classSection', 'className section')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } });

  res.json(subjects);
});

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  res.json(subject);
});

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  res.json({ message: 'Subject deleted successfully' });
});

module.exports = {
  createClass, getClasses, updateClass, deleteClass,
  createSubject, getSubjects, updateSubject, deleteSubject,
};
