const express = require('express');
const router = express.Router();
const {
  markAttendance, getClassAttendanceByDate, getStudentAttendanceHistory, getClassMonthlyReport,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.post('/mark', authorize('admin', 'teacher'), markAttendance);
router.get('/class/:classSectionId', authorize('admin', 'teacher'), getClassAttendanceByDate);
router.get('/report/:classSectionId', authorize('admin', 'teacher'), getClassMonthlyReport);
router.get('/student/:studentId', authorize('admin', 'teacher', 'student'), getStudentAttendanceHistory);

module.exports = router;
