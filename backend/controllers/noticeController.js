const Notice = require('../models/Notice');
const Student = require('../models/Student');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create a notice/announcement
// @route   POST /api/notices
// @access  Private/Admin/Teacher
const createNotice = asyncHandler(async (req, res) => {
  const { title, content, audience, classSection, isPinned } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'title and content are required' });
  }

  const notice = await Notice.create({
    title, content, audience: audience || 'all', classSection, isPinned,
    postedBy: req.user._id,
  });

  res.status(201).json(notice);
});

// @desc    Get notices relevant to the logged-in user's role/class
// @route   GET /api/notices
// @access  Private
const getNotices = asyncHandler(async (req, res) => {
  let filter = {};

  if (req.user.role === 'student') {
    const student = await Student.findOne({ user: req.user._id });
    filter = {
      $or: [
        { audience: 'all' },
        { audience: 'students' },
        ...(student ? [{ audience: 'class', classSection: student.classSection }] : []),
      ],
    };
  } else if (req.user.role === 'teacher') {
    filter = { $or: [{ audience: 'all' }, { audience: 'teachers' }] };
  }
  // admin sees everything (no filter)

  const notices = await Notice.find(filter)
    .populate('postedBy', 'name role')
    .populate('classSection', 'className section')
    .sort({ isPinned: -1, createdAt: -1 });

  res.json(notices);
});

// @desc    Update a notice
// @route   PUT /api/notices/:id
// @access  Private/Admin or the original poster
const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ message: 'Notice not found' });

  if (req.user.role !== 'admin' && notice.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  Object.assign(notice, req.body);
  await notice.save();
  res.json(notice);
});

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin or the original poster
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ message: 'Notice not found' });

  if (req.user.role !== 'admin' && notice.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }

  await notice.deleteOne();
  res.json({ message: 'Notice deleted successfully' });
});

module.exports = { createNotice, getNotices, updateNotice, deleteNotice };
