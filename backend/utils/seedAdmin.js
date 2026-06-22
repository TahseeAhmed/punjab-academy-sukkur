// Run with: npm run seed
// Creates the first Admin account so you can log in and start using the system.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.ADMIN_EMAIL || 'admin@punjabacademy.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin account already exists: ${email}`);
    process.exit(0);
  }

  await User.create({
    name: 'Academy Admin',
    email,
    password,
    role: 'admin',
  });

  console.log('Admin account created successfully!');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('Please log in and change this password immediately.');
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
