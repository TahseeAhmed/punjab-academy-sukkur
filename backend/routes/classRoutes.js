const express = require('express');
const router = express.Router();
const {
  createClass, getClasses, updateClass, deleteClass,
} = require('../controllers/academicSetupController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.route('/')
  .get(getClasses) // all roles can view classes
  .post(authorize('admin'), createClass);

router.route('/:id')
  .put(authorize('admin'), updateClass)
  .delete(authorize('admin'), deleteClass);

module.exports = router;
