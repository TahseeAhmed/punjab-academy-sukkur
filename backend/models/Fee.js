const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    month: { type: String, required: true }, // e.g. "January"
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    receiptNumber: { type: String, unique: true, sparse: true },
    paymentMethod: { type: String, enum: ['cash', 'bank_transfer', 'online', 'cheque'], default: 'cash' },
    remarks: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

feeSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

// Auto-update status based on paid amount
feeSchema.pre('save', function (next) {
  if (this.paidAmount <= 0) this.status = 'unpaid';
  else if (this.paidAmount < this.amount) this.status = 'partial';
  else this.status = 'paid';
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
