const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Panel AC", "Chiller", "Air Dryer", "Dehumidifier", "Fan Tray"],
    index: true
  },
  description: {
    type: String
  },
  specifications: {
    coolingCapacity: { type: Number },
    power: { type: Number },
    refrigerant: { type: String },
    dimensions: { type: String },
    weight: { type: Number },
    maxAmbientTemp: { type: Number },
    workingTempRange: { type: String },
    starRating: { type: String },
    capacity: { type: String },
    voltage: { type: String },
    coolingType: { type: String }
  },
  images: {
    type: [String],
    default: []
  },
  images360: {
    type: [String],
    default: []
  },
  threeSixtyImages: {
    type: [String],
    default: []
  },
  images3d: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    default: null,
    index: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  applications: {
    type: [String],
    default: []
  },
  features: {
    type: [String],
    default: []
  },
  material: {
    type: String
  },
  hsnCode: {
    type: String
  },
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  }
});

// Pre-save middleware to auto-generate/update createdAt and updatedAt, and synchronize 360 images
productSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }
  
  // Synchronize 360 image arrays
  if (this.threeSixtyImages && this.threeSixtyImages.length > 0 && (!this.images360 || this.images360.length === 0)) {
    this.images360 = this.threeSixtyImages;
  } else if (this.images360 && this.images360.length > 0 && (!this.threeSixtyImages || this.threeSixtyImages.length === 0)) {
    this.threeSixtyImages = this.images360;
  }
  
  next();
});

productSchema.index({ name: 'text' });

// Instance methods: toJSON() to format response
productSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id;
  // Ensure both arrays are set in returned object
  if (obj.images360 && !obj.threeSixtyImages) obj.threeSixtyImages = obj.images360;
  if (obj.threeSixtyImages && !obj.images360) obj.images360 = obj.threeSixtyImages;
  return obj;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
