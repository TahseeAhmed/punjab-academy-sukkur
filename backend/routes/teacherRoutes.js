const express = require('express');
const router = express.Router();
const {
  createTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher,
} = require('../controllers/teacherController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.route('/')
  .get(authorize('admin'), getTeachers)
  .post(authorize('admin'), createTeacher);

router.route('/:id')
  .get(authorize('admin', 'teacher'), getTeacherById)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

module.exports = router;
