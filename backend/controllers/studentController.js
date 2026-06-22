const User = require('../models/User');
const Student = require('../models/Student');
const ClassSection = require('../models/ClassSection');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Register a new student (creates User + Student profile)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
  const {
    name, email, password, phone,
    rollNumber, classSection, dateOfBirth, gender,
    address, guardianName, guardianPhone, guardianEmail, bloodGroup,
  } = req.body;

  if (!name || !email || !password || !rollNumber || !classSection) {
    return res.status(400).json({ message: 'Missing required fields: name, email, password, rollNumber, classSection' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ message: 'A user with this email already exists' });
  }

  const existingRoll = await Student.findOne({ rollNumber });
  if (existingRoll) {
    return res.status(400).json({ message: 'A student with this roll number already exists' });
  }

  const classExists = await ClassSection.findById(classSection);
  if (!classExists) {
    return res.status(404).json({ message: 'Class/Section not found' });
  }

  const user = await User.create({ name, email, password, phone, role: 'student' });

  const student = await Student.create({
    user: user._id,
    rollNumber,
    classSection,
    dateOfBirth,
    gender,
    address,
    guardianName,
    guardianPhone,
    guardianEmail,
    bloodGroup,
  });

  const populated = await Student.findById(student._id)
    .populate('user', 'name email phone photoUrl isActive')
    .populate('classSection', 'className section academicYear');

  res.status(201).json(populated);
});

// @desc    Get all students with optional search/filter (by class, section, name, roll number, status)
// @route   GET /api/students
// @access  Private/Admin/Teacher
const getStudents = asyncHandler(async (req, res) => {
  const { classSection, status, search, page = 1, limit = 25 } = req.query;

  const filter = {};
  if (classSection) filter.classSection = classSection;
  if (status) filter.status = status;

  // Teachers may only browse students within their own assigned classes
  if (req.user.role === 'teacher') {
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ user: req.user._id });
    const allowedClassIds = teacher ? teacher.assignedClasses.map((id) => id.toString()) : [];

    if (classSection && !allowedClassIds.includes(classSection)) {
      return res.status(403).json({ message: 'Access denied: class not assigned to you' });
    }
    filter.classSection = classSection || { $in: allowedClassIds };
  }

  let query = Student.find(filter)
    .populate('user', 'name email phone photoUrl isActive')
    .populate('classSection', 'className section academicYear')
    .sort({ createdAt: -1 });

  let students = await query;

  // Text search across name, email, rollNumber (post-populate filter since name/email live on User)
  if (search) {
    const s = search.toLowerCase();
    students = students.filter(
      (st) =>
        st.rollNumber.toLowerCase().includes(s) ||
        (st.user && st.user.name && st.user.name.toLowerCase().includes(s)) ||
        (st.user && st.user.email && st.user.email.toLowerCase().includes(s))
    );
  }

  const total = students.length;
  const start = (Number(page) - 1) * Number(limit);
  const paginated = students.slice(start, start + Number(limit));

  res.json({ total, page: Number(page), limit: Number(limit), students: paginated });
});

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private/Admin/Teacher (or the student themself)
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('user', 'name email phone photoUrl isActive')
    .populate('classSection', 'className section academicYear');

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  // Students may only view their own profile
  if (req.user.role === 'student' && student.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(student);
});

// @desc    Update student profile
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const allowedFields = [
    'classSection', 'dateOfBirth', 'gender', 'address',
    'guardianName', 'guardianPhone', 'guardianEmail', 'bloodGroup', 'status',
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) student[field] = req.body[field];
  });

  await student.save();

  // Allow updating linked user's basic info too
  if (req.body.name || req.body.phone || req.body.isActive !== undefined) {
    const user = await User.findById(student.user);
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
    await user.save();
  }

  const populated = await Student.findById(student._id)
    .populate('user', 'name email phone photoUrl isActive')
    .populate('classSection', 'className section academicYear');

  res.json(populated);
});

// @desc    Delete (deactivate) a student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  student.status = 'inactive';
  await student.save();
  await User.findByIdAndUpdate(student.user, { isActive: false });

  res.json({ message: 'Student deactivated successfully' });
});

module.exports = { createStudent, getStudents, getStudentById, updateStudent, deleteStudent };
