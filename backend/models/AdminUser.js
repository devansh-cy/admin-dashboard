const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },

    name: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ['admin', 'super-admin'],
      default: 'admin'
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    lastLogin: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Hash password before saving
adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
adminUserSchema.methods.comparePassword = async function(inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('AdminUser', adminUserSchema);
