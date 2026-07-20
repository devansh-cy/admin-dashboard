const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod';
const JWT_EXPIRE = '7d';

// REGISTER (Admin only - initial setup)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // Check if user exists
    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new admin user
    const adminUser = new AdminUser({
      email,
      password,
      name,
      role: 'admin'
    });

    await adminUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      user: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user (include password field for comparison)
    const adminUser = await AdminUser.findOne({ email }).select('+password');

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!adminUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Compare passwords
    const isPasswordValid = await adminUser.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    adminUser.lastLogin = new Date();
    await adminUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    // Set HTTP-only cookie (optional, for extra security)
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// VERIFY TOKEN
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      message: 'Token is valid',
      user: decoded
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Token is invalid or expired'
    });
  }
});

// LOGOUT
router.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
