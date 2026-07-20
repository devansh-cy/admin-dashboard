const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminUser = require('./models/AdminUser');
const Product = require('./models/Product');
const Inquiry = require('./models/Inquiry');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // 1. Seed Admin User
    const existingAdmin = await AdminUser.findOne({ email: 'admin@ccsi.com' });
    if (!existingAdmin) {
      const admin = new AdminUser({
        name: 'Admin User',
        email: 'admin@ccsi.com',
        password: 'SecurePassword123',
        role: 'admin',
        isActive: true
      });
      await admin.save();
      console.log('Admin user seeded: admin@ccsi.com / SecurePassword123');
    } else {
      console.log('Admin user already exists.');
    }

    // 2. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = [
        {
          name: 'CCSI PAC 1000W',
          category: 'Panel AC',
          price: 45000,
          description: 'High efficiency industrial panel air conditioner designed for electrical enclosures.',
          images: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&q=80'],
          threeSixtyImages: []
        },
        {
          name: 'Water Chiller WC-1.5',
          category: 'Chiller',
          price: 125000,
          description: '1.5 Ton heavy duty water chiller for process cooling applications.',
          images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80'],
          threeSixtyImages: []
        },
        {
          name: 'Industrial Fan Tray FT-300',
          category: 'Fan Tray',
          price: 12000,
          description: 'High volume industrial exhaust fan tray with thermal protection.',
          images: [],
          threeSixtyImages: []
        }
      ];
      await Product.insertMany(products);
      console.log('Sample products seeded.');
    } else {
      console.log('Products already exist.');
    }

    // 3. Seed Inquiries if empty
    const inquiryCount = await Inquiry.countDocuments();
    if (inquiryCount === 0) {
      const inquiries = [
        {
          customerName: 'John Doe',
          email: 'johndoe@example.com',
          phone: '+1 555-0199',
          type: 'product',
          productName: 'CCSI PAC 1000W',
          quantityNeeded: 5,
          message: 'Hello, I would like to get a quote for 5 units of CCSI PAC 1000W including shipping to California. Thanks!',
          status: 'new',
          isRead: false
        },
        {
          customerName: 'Alice Smith',
          email: 'alice@company.com',
          phone: '+1 555-0244',
          type: 'service',
          serviceType: 'maintenance',
          message: 'Looking for a maintenance contract for our existing cooling chillers. Please send detail terms.',
          status: 'in-progress',
          isRead: true
        },
        {
          customerName: 'Robert Johnson',
          email: 'robert@engineering.org',
          phone: '+1 555-0311',
          type: 'general',
          message: 'Do you offer custom customization sizes for panel air conditioners? Our cabinets are non-standard sizes.',
          status: 'replied',
          isRead: true,
          response: 'Yes Robert, we do support custom dimensions. Our engineering team will contact you shortly.'
        }
      ];
      await Inquiry.insertMany(inquiries);
      console.log('Sample inquiries seeded.');
    } else {
      console.log('Inquiries already exist.');
    }

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

seed();
