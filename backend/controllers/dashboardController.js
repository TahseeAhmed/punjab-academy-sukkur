const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const ClassSection = require('../models/ClassSection');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Notice = require('../models/Notice');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get summary stats for the admin dashboard
// @route   GET /api/dashboard/summary
// @access  Private/Admin
const getAdminSummary = asyncHandler(async (req, res) => {
  const [studentCount, teacherCount, classCount] = await Promise.all([
    Student.countDocuments({ status: 'active' }),
    Teacher.countDocuments({ status: 'active' }),
    ClassSection.countDocuments(),
  ]);

  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  const fees = await Fee.find({ month, year });
  const totalExpected = fees.reduce((s, f) => s + f.amount, 0);
  const totalCollected = fees.reduce((s, f) => s + f.paidAmount, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAttendance = await Attendance.find({ date: today });
  const presentToday = todayAttendance.filter((a) => a.status === 'present').length;

  const recentNotices = await Notice.find().sort({ createdAt: -1 }).limit(5).populate('postedBy', 'name');

  res.json({
    studentCount,
    teacherCount,
    classCount,
    currentMonthFees: { month, year, totalExpected, totalCollected, outstanding: totalExpected - totalCollected },
    todayAttendance: { marked: todayAttendance.length, present: presentToday },
    recentNotices,
  });
});

// @desc    Get summary for a teacher's own dashboard
// @route   GET /api/dashboard/teacher-summary
// @access  Private/Teacher
const getTeacherSummary = asyncHandler(async (req, res) => {
  const Assignment = require('../models/Assignment');
  const teacher = await Teacher.findOne({ user: req.user._id }).populate('assignedClasses', 'className section').populate('subjects', 'name code');
  if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

  const classIds = teacher.assignedClasses.map((c) => c._id);
  const studentCount = await Student.countDocuments({ classSection: { $in: classIds }, status: 'active' });
  const upcomingAssignments = await Assignment.find({ teacher: teacher._id, dueDate: { $gte: new Date() } })
    .sort({ dueDate: 1 })
    .limit(5);

  res.json({ teacher, studentCount, classCount: classIds.length, upcomingAssignments });
});

// @desc    Get summary for a student's own dashboard
// @route   GET /api/dashboard/student-summary
// @access  Private/Student
const getStudentSummary = asyncHandler(async (req, res) => {
  const Assignment = require('../models/Assignment');
  const student = await Student.findOne({ user: req.user._id }).populate('classSection', 'className section');
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  const attendanceRecords = await Attendance.find({ student: student._id });
  const present = attendanceRecords.filter((a) => a.status === 'present').length;
  const attendancePercentage = attendanceRecords.length > 0 ? Number(((present / attendanceRecords.length) * 100).toFixed(1)) : 0;

  const pendingFees = await Fee.find({ student: student._id, status: { $ne: 'paid' } });
  const upcomingAssignments = await Assignment.find({ classSection: student.classSection, dueDate: { $gte: new Date() } })
    .sort({ dueDate: 1 })
    .limit(5);

  res.json({ student, attendancePercentage, pendingFeesCount: pendingFees.length, upcomingAssignments });
});

module.exports = { getAdminSummary, getTeacherSummary, getStudentSummary };
