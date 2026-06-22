const Assignment = require('../models/Assignment');
const Result = require('../models/Result');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { asyncHandler } = require('../middleware/errorHandler');

// ---------- Assignments ----------

// @desc    Create an assignment
// @route   POST /api/assignments
// @access  Private/Teacher
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, subject, classSection, dueDate, fileUrl } = req.body;
  if (!title || !subject || !classSection || !dueDate) {
    return res.status(400).json({ message: 'title, subject, classSection and dueDate are required' });
  }

  const teacher = await Teacher.findOne({ user: req.user._id });
  if (!teacher && req.user.role === 'teacher') {
    return res.status(404).json({ message: 'Teacher profile not found' });
  }

  const assignment = await Assignment.create({
    title, description, subject, classSection, dueDate, fileUrl,
    teacher: teacher ? teacher._id : req.body.teacher,
  });

  res.status(201).json(assignment);
});

// @desc    Get assignments (filter by classSection, subject)
// @route   GET /api/assignments
// @access  Private
const getAssignments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.classSection) filter.classSection = req.query.classSection;
  if (req.query.subject) filter.subject = req.query.subject;

  // If logged-in user is a student, restrict to their own class automatically when no filter given
  if (req.user.role === 'student' && !filter.classSection) {
    const student = await Student.findOne({ user: req.user._id });
    if (student) filter.classSection = student.classSection;
  }

  const assignments = await Assignment.find(filter)
    .populate('subject', 'name code')
    .populate('classSection', 'className section')
    .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
    .sort({ dueDate: 1 });

  res.json(assignments);
});

// @desc    Update an assignment
// @route   PUT /api/assignments/:id
// @access  Private/Teacher(owner)/Admin
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || assignment.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own assignments' });
    }
  }

  Object.assign(assignment, req.body);
  await assignment.save();
  res.json(assignment);
});

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher(owner)/Admin
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher || assignment.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own assignments' });
    }
  }

  await assignment.deleteOne();
  res.json({ message: 'Assignment deleted successfully' });
});

// ---------- Results ----------

// @desc    Enter/update an exam result for a student (upsert per student+subject+examType+term)
// @route   POST /api/results
// @access  Private/Teacher/Admin
const enterResult = asyncHandler(async (req, res) => {
  const { student, subject, classSection, examType, term, marksObtained, totalMarks } = req.body;
  if (!student || !subject || !classSection || !examType || !term || marksObtained === undefined || !totalMarks) {
    return res.status(400).json({ message: 'student, subject, classSection, examType, term, marksObtained and totalMarks are required' });
  }

  const teacher = await Teacher.findOne({ user: req.user._id });

  let result = await Result.findOne({ student, subject, examType, term });
  if (result) {
    result.marksObtained = marksObtained;
    result.totalMarks = totalMarks;
    result.enteredBy = teacher ? teacher._id : result.enteredBy;
    await result.save();
  } else {
    result = await Result.create({
      student, subject, classSection, examType, term, marksObtained, totalMarks,
      enteredBy: teacher ? teacher._id : undefined,
    });
  }

  res.status(201).json(result);
});

// @desc    Get results (filter by student, classSection, subject, term)
// @route   GET /api/results
// @access  Private
const getResults = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.student) filter.student = req.query.student;
  if (req.query.classSection) filter.classSection = req.query.classSection;
  if (req.query.subject) filter.subject = req.query.subject;
  if (req.query.term) filter.term = req.query.term;

  if (req.user.role === 'student' && !filter.student) {
    const student = await Student.findOne({ user: req.user._id });
    if (student) filter.student = student._id;
  }

  const results = await Result.find(filter)
    .populate('subject', 'name code')
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .sort({ createdAt: -1 });

  res.json(results);
});

// @desc    Get a consolidated result card for a student for a given term
// @route   GET /api/results/card/:studentId?term=
// @access  Private
const getResultCard = asyncHandler(async (req, res) => {
  const { term } = req.query;
  if (!term) return res.status(400).json({ message: 'term query param is required' });

  const results = await Result.find({ student: req.params.studentId, term }).populate('subject', 'name code');

  const totalObtained = results.reduce((sum, r) => sum + r.marksObtained, 0);
  const totalMax = results.reduce((sum, r) => sum + r.totalMarks, 0);
  const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;

  const student = await Student.findById(req.params.studentId)
    .populate('user', 'name email')
    .populate('classSection', 'className section');

  res.json({ student, term, results, totalObtained, totalMax, percentage });
});

module.exports = {
  createAssignment, getAssignments, updateAssignment, deleteAssignment,
  enterResult, getResults, getResultCard,
};
