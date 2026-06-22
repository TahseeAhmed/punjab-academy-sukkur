const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { asyncHandler } = require('../middleware/errorHandler');

const generateReceiptNumber = () => {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(100 + Math.random() * 900);
  return `RCPT-${ts}-${rand}`;
};

// @desc    Create a fee record for a student (single month) or bulk for a whole class
// @route   POST /api/fees
// @access  Private/Admin
// Body (single): { student, month, year, amount, dueDate }
// Body (bulk):   { classSection, month, year, amount, dueDate }
const createFee = asyncHandler(async (req, res) => {
  const { student, classSection, month, year, amount, dueDate } = req.body;

  if (!month || !year || !amount || !dueDate) {
    return res.status(400).json({ message: 'month, year, amount and dueDate are required' });
  }

  if (student) {
    const fee = await Fee.create({ student, month, year, amount, dueDate, createdBy: req.user._id });
    return res.status(201).json(fee);
  }

  if (classSection) {
    const students = await Student.find({ classSection, status: 'active' });
    const created = [];
    for (const st of students) {
      try {
        const fee = await Fee.create({ student: st._id, month, year, amount, dueDate, createdBy: req.user._id });
        created.push(fee);
      } catch (e) {
        // skip duplicates (already has a fee record for this month/year)
      }
    }
    return res.status(201).json({ message: `Fee records created for ${created.length} student(s)`, fees: created });
  }

  return res.status(400).json({ message: 'Either student or classSection must be provided' });
});

// @desc    Get fee records with filters (student, status, month, year, classSection)
// @route   GET /api/fees
// @access  Private/Admin/Teacher (students see only their own via /fees/my)
const getFees = asyncHandler(async (req, res) => {
  const { student, status, month, year } = req.query;
  const filter = {};
  if (student) filter.student = student;
  if (status) filter.status = status;
  if (month) filter.month = month;
  if (year) filter.year = Number(year);

  let fees = await Fee.find(filter)
    .populate({ path: 'student', populate: [{ path: 'user', select: 'name' }, { path: 'classSection', select: 'className section' }] })
    .sort({ year: -1, createdAt: -1 });

  if (req.query.classSection) {
    fees = fees.filter((f) => f.student && f.student.classSection && f.student.classSection._id.toString() === req.query.classSection);
  }

  res.json(fees);
});

// @desc    Get logged-in student's own fee records
// @route   GET /api/fees/my
// @access  Private/Student
const getMyFees = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) return res.status(404).json({ message: 'Student profile not found' });

  const fees = await Fee.find({ student: student._id }).sort({ year: -1, createdAt: -1 });
  res.json(fees);
});

// @desc    Record a payment against a fee record (full or partial) and generate a receipt
// @route   PUT /api/fees/:id/pay
// @access  Private/Admin
const recordPayment = asyncHandler(async (req, res) => {
  const { paidAmount, paymentMethod, remarks } = req.body;
  if (!paidAmount || paidAmount <= 0) {
    return res.status(400).json({ message: 'paidAmount must be greater than 0' });
  }

  const fee = await Fee.findById(req.params.id);
  if (!fee) return res.status(404).json({ message: 'Fee record not found' });

  fee.paidAmount = Math.min(fee.amount, fee.paidAmount + Number(paidAmount));
  fee.paidDate = new Date();
  if (paymentMethod) fee.paymentMethod = paymentMethod;
  if (remarks) fee.remarks = remarks;
  if (!fee.receiptNumber) fee.receiptNumber = generateReceiptNumber();

  await fee.save();
  res.json(fee);
});

// @desc    Monthly fee collection report (totals + per-student breakdown)
// @route   GET /api/fees/report?month=&year=
// @access  Private/Admin
const getMonthlyFeeReport = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ message: 'month and year query params are required' });

  const fees = await Fee.find({ month, year: Number(year) }).populate({
    path: 'student',
    populate: [{ path: 'user', select: 'name' }, { path: 'classSection', select: 'className section' }],
  });

  const totalExpected = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalOutstanding = totalExpected - totalCollected;

  const byStatus = {
    paid: fees.filter((f) => f.status === 'paid').length,
    partial: fees.filter((f) => f.status === 'partial').length,
    unpaid: fees.filter((f) => f.status === 'unpaid').length,
  };

  res.json({ totalExpected, totalCollected, totalOutstanding, byStatus, records: fees });
});

module.exports = { createFee, getFees, getMyFees, recordPayment, getMonthlyFeeReport };
