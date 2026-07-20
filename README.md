# Climate Control India - Admin Dashboard

A secure, real-time administrative dashboard built from scratch to manage product catalogs and client service inquiries for Climate Control Systems India.

## Features

- **Dashboard Statistics**: Dynamic metrics for total inquiries, new requests, active products, and closed tickets.
- **Inquiry Management**: Complete workflow system for client inquiries with status transitions (`New` ➔ `Contacted` ➔ `Quoted` ➔ `Converted` ➔ `Closed`).
- **Product Management**: Complete CRUD interface for managing panel ACs, water chillers, air dryers, and fan trays, with support for 360-degree product image frames.
- **Real-Time Notifications**: Local polling engine that alerts admins with slide-in popups when new inquiries are submitted on the main website.
- **Branded Minimal Design**: Styled to perfectly match the color palette and typography of the main website.

---

## Directory Structure

```
admin-dashboard/
├── admin/          # React + Vite Frontend App
├── backend/        # Node.js + Express API Backend
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or Atlas connection string)

### 1. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```
4. Seed the database with demo products and inquiries:
   ```bash
   node test-db.js
   ```
5. Start the API server:
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `admin/` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The dashboard will be running at `http://localhost:5173`.

---

## Default Login Credentials
Use the following seeded credentials to access the admin account:
- **Email**: `admin@ccsi.com`
- **Password**: `SecurePassword123`
