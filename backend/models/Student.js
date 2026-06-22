const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    classSection: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    admissionDate: { type: Date, default: Date.now },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    address: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    guardianEmail: { type: String, trim: true },
    bloodGroup: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive', 'graduated'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
