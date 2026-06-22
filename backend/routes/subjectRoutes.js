const express = require('express');
const router = express.Router();
const {
  createSubject, getSubjects, updateSubject, deleteSubject,
} = require('../controllers/academicSetupController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.route('/')
  .get(getSubjects)
  .post(authorize('admin'), createSubject);

router.route('/:id')
  .put(authorize('admin'), updateSubject)
  .delete(authorize('admin'), deleteSubject);

module.exports = router;
