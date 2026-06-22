const mongoose = require('mongoose');

const classSectionSchema = new mongoose.Schema(
  {
    className: { type: String, required: true, trim: true }, // e.g. "Class 9", "FSC Part 1"
    section: { type: String, required: true, trim: true }, // e.g. "A", "B"
    academicYear: { type: String, required: true, trim: true }, // e.g. "2025-2026"
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    capacity: { type: Number, default: 50 },
  },
  { timestamps: true }
);

classSectionSchema.index({ className: 1, section: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('ClassSection', classSectionSchema);
