const express = require('express');
const router = express.Router();
const {
  createAssignment, getAssignments, updateAssignment, deleteAssignment,
} = require('../controllers/academicController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(authorize('admin', 'teacher'), createAssignment);

router.route('/:id')
  .put(authorize('admin', 'teacher'), updateAssignment)
  .delete(authorize('admin', 'teacher'), deleteAssignment);

module.exports = router;
