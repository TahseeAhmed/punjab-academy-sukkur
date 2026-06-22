const express = require('express');
const router = express.Router();
const {
  createFee, getFees, getMyFees, recordPayment, getMonthlyFeeReport,
} = require('../controllers/feeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/my', authorize('student'), getMyFees);
router.get('/report', authorize('admin'), getMonthlyFeeReport);

router.route('/')
  .get(authorize('admin'), getFees)
  .post(authorize('admin'), createFee);

router.put('/:id/pay', authorize('admin'), recordPayment);

module.exports = router;
