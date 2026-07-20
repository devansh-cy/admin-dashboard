const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// POST submit new inquiry (Public - for customer site integration)
router.post('/', async (req, res) => {
  try {
    const { customerName, email, phone, type, productName, serviceType, quantityNeeded, message } = req.body;

    if (!customerName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    const inquiry = new Inquiry({
      customerName,
      email,
      phone,
      type,
      productName,
      serviceType,
      quantityNeeded,
      message
    });

    await inquiry.save();
    res.status(201).json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all inquiries (Protected Admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET new inquiries (since last timestamp) - Protected Admin
router.get('/new', verifyToken, isAdmin, async (req, res) => {
  try {
    const { since } = req.query; // timestamp from frontend
    const query = {};

    if (since) {
      query.createdAt = { $gt: new Date(parseInt(since)) };
    }

    const newInquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: newInquiries,
      timestamp: Date.now()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// GET single inquiry (Protected Admin)
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    res.json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT mark inquiry as read (Protected Admin)
router.put('/:id/read', verifyToken, isAdmin, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// PUT update inquiry status (Protected Admin)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    inquiry.status = status;
    await inquiry.save();

    res.json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT respond to inquiry (Protected Admin)
router.put('/:id/respond', verifyToken, isAdmin, async (req, res) => {
  try {
    const { response } = req.body;
    if (!response) {
      return res.status(400).json({ success: false, message: 'Response message is required' });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    inquiry.response = response;
    inquiry.status = 'replied';
    inquiry.isRead = true;
    inquiry.respondedAt = new Date();
    await inquiry.save();

    res.json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE inquiry (Protected Admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
