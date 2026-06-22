const express = require('express');
const router = express.Router();
const {
  getAdminSummary, getTeacherSummary, getStudentSummary,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/summary', authorize('admin'), getAdminSummary);
router.get('/teacher-summary', authorize('teacher'), getTeacherSummary);
router.get('/student-summary', authorize('student'), getStudentSummary);

module.exports = router;
