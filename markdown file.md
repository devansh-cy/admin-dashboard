# ADMIN DASHBOARD - DESIGN & SPECIFICATION
## Minimal White/Black Theme | Real-time Inquiries | Product Management

---

## 🎨 DESIGN PHILOSOPHY

**Minimal. Clean. Professional.**

- White background (#FFFFFF)
- Black text (#000000)
- Subtle grays for borders (#F5F5F5, #E0E0E0)
- Single accent color: Dark blue (#003366) for actions only
- No gradients, no shadows, no animations
- Functional design, not decorative
- Fast and responsive

---

## 📊 COLOR PALETTE

```css
Primary: #FFFFFF (White background)
Text: #000000 (Black text)
Secondary Text: #666666 (Gray text)
Borders: #E0E0E0 (Light gray)
Hover: #F5F5F5 (Very light gray)
Accent: #003366 (Dark blue - buttons only)
Success: #28A745 (Green)
Warning: #FF9800 (Orange)
Error: #DC3545 (Red)
Info: #0056B3 (Blue)
```

---

## 📐 LAYOUT STRUCTURE

```
┌─────────────────────────────────────────────┐
│  HEADER                                     │
│  Logo | Dashboard | Products | Inquiries    │
│                                    [Logout] │
├────────────┬──────────────────────────────┤
│ SIDEBAR    │ MAIN CONTENT AREA            │
│            │                              │
│ • Products │ Real-time Notifications      │
│ • Inquiries│ (Pop-up style)               │
│ • Reports  │                              │
│ • Settings │ Dashboard Cards              │
│            │ - Total Inquiries            │
│            │ - New Inquiries              │
│            │ - Products                   │
│            │                              │
│            │ Recent Inquiries Table       │
│            │ (Filterable, searchable)     │
│            │                              │
└────────────┴──────────────────────────────┘
```

---

## 🎯 CORE FEATURES

### **1. Dashboard Home**
✅ Overview cards (statistics)
✅ Recent inquiries list
✅ Real-time notification badge
✅ Quick stats

### **2. Inquiry Management**
✅ All inquiries (product, service, general)
✅ Filter by type and status
✅ Search by customer name/email
✅ View inquiry details
✅ Respond to inquiry
✅ Change status (new → in-progress → replied → closed)
✅ Mark as resolved

### **3. Product Management**
✅ View all products
✅ Add new product
✅ Edit product details
✅ Upload/manage images
✅ Manage 360° images
✅ Delete product
✅ Search and filter

### **4. Real-time Notifications**
✅ New inquiry pop-up notification
✅ Badge counter on sidebar
✅ Sound alert (optional)
✅ Mark as read

### **5. Admin Settings**
✅ Manage admin users
✅ Change email notifications
✅ View activity logs

---

## 🔐 AUTHENTICATION

### **Login Page**
- Email / Password login
- "Stay logged in" option
- Minimal form
- Session management
- Logout functionality

**For MVP: Simple email/password (no OAuth yet)**

---

## 📱 RESPONSIVE DESIGN

```
Mobile (<768px):
- Sidebar collapses to icon menu
- Single column layout
- Stacked cards
- Touch-friendly buttons (48px min)

Tablet (768px-1024px):
- Sidebar visible
- 2 column layout
- Card grid

Desktop (>1024px):
- Full layout
- 3 column layout possible
- Optimal viewing
```

---

## ⚡ TECH STACK

**Frontend:**
```javascript
- React (Vite)
- React Router (navigation)
- Context API (state management)
- Fetch API (real-time)
- Tailwind CSS (styling)
```

**Backend:**
```javascript
- Node.js / Express (existing)
- Socket.io or Polling (real-time)
- MongoDB (existing)
- JWT (authentication)
```

**Hosting:**
- Vercel (frontend)
- Render (backend - existing)

---

## 📂 FILE STRUCTURE

```
admin-dashboard/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Dashboard.jsx
│   │   ├── InquiryList.jsx
│   │   ├── InquiryDetail.jsx
│   │   ├── ProductList.jsx
│   │   ├── ProductForm.jsx
│   │   ├── NotificationPopup.jsx
│   │   └── LoginPage.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── websocket.js (or polling)
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .gitignore
├── package.json
└── vite.config.js
```

---

## 🎨 COMPONENT BREAKDOWN

### **1. Header Component**
```
Logo | Dashboard | Products | Inquiries | [User] Logout
- Fixed top
- Always visible
- Simple navigation
```

### **2. Sidebar Component**
```
Products (with count)
Inquiries (with new count badge)
Reports
Settings

- Fixed left
- Collapsible on mobile
- Active indicator
- Icons + text
```

### **3. Dashboard Home**
```
Stats Cards:
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Total    │ │ New      │ │ Products │
│ Inquiries│ │ Inquiries│ │          │
│    42    │ │    5     │ │    10    │
└──────────┘ └──────────┘ └──────────┘

Recent Inquiries Table:
┌────────────────────────────────────┐
│ Customer | Type | Status | Actions │
├────────────────────────────────────┤
│ John Doe | PRO  | New    | View    │
│ Jane Smith| SER | Replied| View    │
│ ...      | ...  | ...    | ...     │
└────────────────────────────────────┘
```

### **4. Inquiry List & Detail**
```
Left: List (filterable, searchable)
Right: Detail view when clicked

Filters:
- Type (Product, Service, General)
- Status (New, In Progress, Replied, Closed)
- Date range
```

### **5. Product List**
```
Table view:
┌────────────────────────────────────────┐
│ Product | Category | Price | Actions   │
├────────────────────────────────────────┤
│ PAC 1000| Panel AC | 45K  | Edit/Delete│
│ WC 1.5  | Water Ch | 125K | Edit/Delete│
└────────────────────────────────────────┘

Buttons:
- [+ Add Product]
- [Search box]
- [Filter by category]
```

### **6. Notification Popup**
```
┌─────────────────────────────────────┐
│ ✓ New Inquiry Received              │ X
│                                     │
│ From: John Doe                      │
│ Type: Product Quote                 │
│ Product: CCSI PAC 1000W             │
│ Quantity: 5 units                   │
│                                     │
│ [View Details] [Mark as Read]       │
└─────────────────────────────────────┘
```

---

## 📡 API ENDPOINTS NEEDED

### **Authentication**
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/register (admin only)
GET /api/auth/verify
```

### **Inquiries**
```
GET /api/inquiries
GET /api/inquiries/:id
PUT /api/inquiries/:id/status
PUT /api/inquiries/:id/respond
DELETE /api/inquiries/:id
```

### **Products**
```
GET /api/products (admin view)
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
POST /api/products/:id/images (360° images)
```

### **Real-time**
```
GET /api/inquiries/new (polling)
or
WebSocket: /socket.io (Socket.io)
```

---

## 🎯 USER WORKFLOWS

### **Workflow 1: Check Inquiries**
1. Admin logs in
2. Sees notification badge
3. Clicks on "Inquiries"
4. Sees list of all inquiries
5. Clicks inquiry to view details
6. Clicks "Respond"
7. Types response
8. Clicks "Send Response"
9. Status changes to "Replied"

### **Workflow 2: Pop-up Notification**
1. Customer submits inquiry on website
2. Pop-up appears on admin dashboard
3. Admin clicks "View Details"
4. Detail view opens
5. Admin can respond immediately

### **Workflow 3: Manage Products**
1. Admin clicks "Products"
2. Sees list of all products
3. Clicks "Edit" on a product
4. Updates details
5. Uploads new images
6. Clicks "Save"
7. Product updated in database

### **Workflow 4: Filter Inquiries**
1. Admin clicks "Inquiries"
2. Selects filter: "Status = New"
3. Selects filter: "Type = Service"
4. Selects filter: "Date = Last 7 days"
5. Sees filtered results
6. Searches by customer name

---

## 🔔 REAL-TIME NOTIFICATION SYSTEM

### **Option 1: Polling (Simpler)**
```javascript
// Every 5 seconds, check for new inquiries
setInterval(async () => {
  const newInquiries = await fetch('/api/inquiries/new');
  if (newInquiries.length > 0) {
    showPopup(newInquiries[0]);
  }
}, 5000);
```

**Pros:** Simple, works everywhere
**Cons:** Uses more server resources

### **Option 2: Socket.io (Real-time)**
```javascript
// Real-time connection
socket.on('new-inquiry', (inquiry) => {
  showPopup(inquiry);
});
```

**Pros:** True real-time, efficient
**Cons:** Requires Socket.io setup

**Recommendation: Start with Polling, upgrade to Socket.io later**

---

## 💾 DATABASE SCHEMA ADDITIONS

### **Admin User Model**
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String, // "admin" | "super-admin"
  createdAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

### **Admin Log Model** (optional)
```javascript
{
  adminId: ObjectId,
  action: String, // "viewed", "responded", "edited"
  resourceType: String, // "inquiry", "product"
  resourceId: ObjectId,
  createdAt: Date
}
```

---

## 🎨 MINIMAL DESIGN RULES

**DO:**
✅ Use lots of white space
✅ Clear typography (2 font sizes max)
✅ Consistent spacing (8px grid)
✅ Dark blue accent for CTAs only
✅ Simple tables with clear borders
✅ Hover states (background change)
✅ Loading states (disabled buttons)
✅ Success/error messages (text only)

**DON'T:**
❌ No shadows
❌ No gradients
❌ No rounded corners (maybe 4px max)
❌ No animations
❌ No emojis
❌ No icons (text labels)
❌ No color gradients
❌ No decorative elements

---

## 📱 MOBILE-FIRST APPROACH

**Mobile:**
- Single column
- Full width inputs
- Stack buttons vertically
- Large touch targets

**Tablet:**
- Two columns
- Side-by-side layout
- Visible sidebar

**Desktop:**
- Three columns
- Full layout
- Optimal spacing

---

## ⚡ PERFORMANCE TARGETS

- Page load: < 2 seconds
- Notification pop-up: < 500ms
- Product list load: < 1 second
- No unnecessary API calls
- Lazy load images
- Minimal bundle size

---

## 🔒 SECURITY FEATURES

✅ JWT authentication
✅ Password hashing (bcrypt)
✅ HTTPS only
✅ CSRF protection
✅ Rate limiting on login
✅ Session timeout (30 min)
✅ Secure cookies
✅ Input validation

---

## 📋 CHECKLIST FOR MVP

- [ ] Login page (email/password)
- [ ] Dashboard home (stats + recent inquiries)
- [ ] Inquiry list (filterable)
- [ ] Inquiry detail (view + respond)
- [ ] Product list (view)
- [ ] Product add/edit/delete
- [ ] Real-time notifications (popup)
- [ ] Responsive design
- [ ] Authentication system
- [ ] Logout functionality

---

## 🚀 DEPLOYMENT PLAN

**Development:**
- Build locally
- Test with Antigravity IDE

**Staging:**
- Deploy to Vercel preview
- Test with backend
- Get feedback

**Production:**
- Deploy to Vercel
- Configure environment variables
- Monitor performance

---

## 📊 NEXT STEPS

1. **Design approval** - Confirm this design
2. **API updates** - Add auth endpoints if needed
3. **Component structure** - Build components in order
4. **Testing** - Test each feature
5. **Deployment** - Deploy to Vercel
6. **Integration** - Connect with website

---

**Ready to build?** Let me create the component guides next! 🚀