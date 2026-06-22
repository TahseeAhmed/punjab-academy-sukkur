const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    examType: { type: String, enum: ['quiz', 'midterm', 'final', 'assignment'], required: true },
    term: { type: String, required: true }, // e.g. "Term 1 2026"
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    grade: { type: String },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  },
  { timestamps: true }
);

resultSchema.pre('save', function (next) {
  const pct = (this.marksObtained / this.totalMarks) * 100;
  if (pct >= 90) this.grade = 'A+';
  else if (pct >= 80) this.grade = 'A';
  else if (pct >= 70) this.grade = 'B';
  else if (pct >= 60) this.grade = 'C';
  else if (pct >= 50) this.grade = 'D';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('Result', resultSchema);
