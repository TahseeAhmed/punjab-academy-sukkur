const express = require('express');
const router = express.Router();
const {
  enterResult, getResults, getResultCard,
} = require('../controllers/academicController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.post('/', authorize('admin', 'teacher'), enterResult);
router.get('/', getResults);
router.get('/card/:studentId', getResultCard);

module.exports = router;
