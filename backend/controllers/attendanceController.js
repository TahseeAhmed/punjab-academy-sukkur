const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { asyncHandler } = require('../middleware/errorHandler');

// Returns true if the class is one the teacher is assigned to (admins always pass)
const canAccessClass = async (user, classSectionId) => {
  if (user.role !== 'teacher') return true;
  const teacher = await Teacher.findOne({ user: user._id });
  if (!teacher) return false;
  return teacher.assignedClasses.map((id) => id.toString()).includes(classSectionId.toString());
};

// @desc    Mark attendance for multiple students in a class on a given date (bulk upsert)
// @route   POST /api/attendance/mark
// @access  Private/Teacher/Admin
// Body: { classSection, date, records: [{ student, status, remarks }] }
const markAttendance = asyncHandler(async (req, res) => {
  const { classSection, date, records } = req.body;

  if (!classSection || !date || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'classSection, date and records[] are required' });
  }

  if (!(await canAccessClass(req.user, classSection))) {
    return res.status(403).json({ message: 'You are not assigned to this class' });
  }

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const results = await Promise.all(
    records.map(async (r) => {
      return Attendance.findOneAndUpdate(
        { student: r.student, date: day },
        {
          student: r.student,
          classSection,
          date: day,
          status: r.status,
          remarks: r.remarks || '',
          markedBy: req.user._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
      );
    })
  );

  res.status(200).json({ message: `Attendance recorded for ${results.length} student(s)`, records: results });
});

// @desc    Get attendance for a class on a specific date
// @route   GET /api/attendance/class/:classSectionId?date=YYYY-MM-DD
// @access  Private/Teacher/Admin
const getClassAttendanceByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'date query param is required' });

  if (!(await canAccessClass(req.user, req.params.classSectionId))) {
    return res.status(403).json({ message: 'You are not assigned to this class' });
  }

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const records = await Attendance.find({ classSection: req.params.classSectionId, date: day }).populate({
    path: 'student',
    select: 'rollNumber user',
    populate: { path: 'user', select: 'name' },
  });

  res.json(records);
});

// @desc    Get a single student's attendance history (optionally filtered by month/year)
// @route   GET /api/attendance/student/:studentId
// @access  Private (own record for student, any for admin/teacher)
const getStudentAttendanceHistory = asyncHandler(async (req, res) => {
  if (req.user.role === 'student') {
    const own = await Student.findOne({ user: req.user._id });
    if (!own || own._id.toString() !== req.params.studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }
  }

  const { month, year } = req.query;
  const filter = { student: req.params.studentId };

  if (year) {
    const y = Number(year);
    const m = month ? Number(month) - 1 : null;
    const start = m !== null ? new Date(y, m, 1) : new Date(y, 0, 1);
    const end = m !== null ? new Date(y, m + 1, 1) : new Date(y + 1, 0, 1);
    filter.date = { $gte: start, $lt: end };
  }

  const records = await Attendance.find(filter).sort({ date: -1 });

  const summary = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    leave: records.filter((r) => r.status === 'leave').length,
    late: records.filter((r) => r.status === 'late').length,
    total: records.length,
  };
  summary.percentage = summary.total > 0 ? Number(((summary.present / summary.total) * 100).toFixed(1)) : 0;

  res.json({ summary, records });
});

// @desc    Monthly attendance report for a whole class
// @route   GET /api/attendance/report/:classSectionId?month=&year=
// @access  Private/Admin/Teacher
const getClassMonthlyReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ message: 'month and year query params are required' });

  if (!(await canAccessClass(req.user, req.params.classSectionId))) {
    return res.status(403).json({ message: 'You are not assigned to this class' });
  }

  const y = Number(year);
  const m = Number(month) - 1;
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1);

  const students = await Student.find({ classSection: req.params.classSectionId, status: 'active' }).populate('user', 'name');

  const report = await Promise.all(
    students.map(async (st) => {
      const records = await Attendance.find({ student: st._id, date: { $gte: start, $lt: end } });
      const present = records.filter((r) => r.status === 'present').length;
      const total = records.length;
      return {
        student: { _id: st._id, name: st.user.name, rollNumber: st.rollNumber },
        present,
        absent: records.filter((r) => r.status === 'absent').length,
        leave: records.filter((r) => r.status === 'leave').length,
        total,
        percentage: total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0,
      };
    })
  );

  res.json(report);
});

module.exports = { markAttendance, getClassAttendanceByDate, getStudentAttendanceHistory, getClassMonthlyReport };
