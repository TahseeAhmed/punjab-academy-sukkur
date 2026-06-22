const User = require('../models/User');
const Teacher = require('../models/Teacher');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Register a new teacher (creates User + Teacher profile)
// @route   POST /api/teachers
// @access  Private/Admin
const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, phone, employeeId, qualification, subjects, assignedClasses } = req.body;

  if (!name || !email || !password || !employeeId) {
    return res.status(400).json({ message: 'Missing required fields: name, email, password, employeeId' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: 'A user with this email already exists' });
  }

  const existingEmp = await Teacher.findOne({ employeeId });
  if (existingEmp) {
    return res.status(400).json({ message: 'A teacher with this employee ID already exists' });
  }

  const user = await User.create({ name, email, password, phone, role: 'teacher' });

  const teacher = await Teacher.create({
    user: user._id,
    employeeId,
    qualification,
    subjects: subjects || [],
    assignedClasses: assignedClasses || [],
  });

  const populated = await Teacher.findById(teacher._id)
    .populate('user', 'name email phone photoUrl isActive')
    .populate('subjects', 'name code')
    .populate('assignedClasses', 'className section');

  res.status(201).json(populated);
});

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private/Admin
const getTeachers = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  let teachers = await Teacher.find(filter)
    .populate('user', 'name email phone photoUrl isActive')
    .populate('subjects', 'name code')
    .populate('assignedClasses', 'className section')
    .sort({ createdAt: -1 });

  if (search) {
    const s = search.toLowerCase();
    teachers = teachers.filter(
      (t) =>
        t.employeeId.toLowerCase().includes(s) ||
        (t.user && t.user.name && t.user.name.toLowerCase().includes(s)) ||
        (t.user && t.user.email && t.user.email.toLowerCase().includes(s))
    );
  }

  res.json(teachers);
});

// @desc    Get a single teacher
// @route   GET /api/teachers/:id
// @access  Private/Admin/Teacher(self)
const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('user', 'name email phone photoUrl isActive')
    .populate('subjects', 'name code')
    .populate('assignedClasses', 'className section');

  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

  if (req.user.role === 'teacher' && teacher.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(teacher);
});

// @desc    Update teacher profile
// @route   PUT /api/teachers/:id
// @access  Private/Admin
const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

  const allowedFields = ['qualification', 'subjects', 'assignedClasses', 'status'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) teacher[field] = req.body[field];
  });
  await teacher.save();

  if (req.body.name || req.body.phone || req.body.isActive !== undefined) {
    const user = await User.findById(teacher.user);
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    await user.save();
  }

  const populated = await Teacher.findById(teacher._id)
    .populate('user', 'name email phone photoUrl isActive')
    .populate('subjects', 'name code')
    .populate('assignedClasses', 'className section');

  res.json(populated);
});

// @desc    Delete (deactivate) a teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

  teacher.status = 'inactive';
  await teacher.save();
  await User.findByIdAndUpdate(teacher.user, { isActive: false });

  res.json({ message: 'Teacher deactivated successfully' });
});

module.exports = { createTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher };
