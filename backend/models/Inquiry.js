const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  inquiryNumber: {
    type: String,
    unique: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  productName: {
    type: String,
    required: false
  },
  customerName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['product', 'service', 'general'],
    default: 'product',
    index: true
  },
  companyName: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  quantityNeeded: {
    type: Number,
    required: false,
    min: 1
  },
  application: {
    type: String,
    required: false
  },
  budgetRange: {
    type: String,
    enum: ["<50K", "50K-100K", "100K-500K", "500K+"],
    required: false
  },
  timeline: {
    type: String,
    enum: ["ASAP", "1-3 months", "3-6 months", "6+ months"],
    required: false
  },
  // ===== SERVICE INQUIRY SPECIFIC =====
  serviceType: {
    type: String,
    enum: ['maintenance', 'repair', 'installation', 'support', 'inspection', ''],
    default: ''
  },
  equipmentModel: {
    type: String,
    default: ''
  },
  serialNumber: {
    type: String,
    default: ''
  },
  issueDescription: {
    type: String,
    default: ''
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical', ''],
    default: ''
  },
  serviceLocation: {
    type: String,
    default: ''
  },
  preferredDate: {
    type: Date,
    default: null
  },
  // ===== GENERAL INQUIRY SPECIFIC =====
  subject: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ["new", "contacted", "quoted", "converted", "closed", "in-progress", "replied"],
    default: "new"
  },
  isRead: {
    type: Boolean,
    default: false
  },
  response: {
    type: String,
    required: false
  },
  respondedAt: {
    type: Date,
    required: false
  },
  respondedBy: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  }
});

// Generate a unique inquiry number in format CCSI-<TYPE>-YYYY-XXXXXX
inquirySchema.methods.generateInquiryNumber = async function() {
  const currentYear = new Date().getFullYear();
  const typeCode = this.type ? this.type.substring(0, 3).toUpperCase() : 'INQ';
  const lastInquiry = await mongoose.model('Inquiry')
    .findOne({}, {}, { sort: { 'createdAt': -1 } });
  
  let nextNum = 1;
  if (lastInquiry && lastInquiry.inquiryNumber) {
    const parts = lastInquiry.inquiryNumber.split('-');
    if (parts.length === 4) {
      const lastNum = parseInt(parts[3], 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
  }
  return `CCSI-${typeCode}-${currentYear}-${String(nextNum).padStart(6, '0')}`;
};

// Instance method to update status to contacted
inquirySchema.methods.markAsContacted = function() {
  this.status = 'contacted';
  return this.save();
};

// Instance method toJSON to format output
inquirySchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id;
  return obj;
};

// Pre-save hook
inquirySchema.pre('save', async function(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }
  
  // Auto-generate inquiryNumber if not already set
  if (!this.inquiryNumber) {
    this.inquiryNumber = await this.generateInquiryNumber();
  }
  
  next();
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;
