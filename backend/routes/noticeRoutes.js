const express = require('express');
const router = express.Router();
const {
  createNotice, getNotices, updateNotice, deleteNotice,
} = require('../controllers/noticeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.route('/')
  .get(getNotices)
  .post(authorize('admin', 'teacher'), createNotice);

router.route('/:id')
  .put(authorize('admin', 'teacher'), updateNotice)
  .delete(authorize('admin', 'teacher'), deleteNotice);

module.exports = router;
