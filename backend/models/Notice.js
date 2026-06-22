const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    audience: {
      type: String,
      enum: ['all', 'teachers', 'students', 'class'],
      default: 'all',
    },
    classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' }, // used when audience = 'class'
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
