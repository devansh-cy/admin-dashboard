# REAL-TIME NOTIFICATION SYSTEM
## Pop-up Notifications for New Inquiries

---

## 🔔 ARCHITECTURE

```
Website User                   Admin Dashboard
   │                                  │
   └─ Submits Inquiry ─────────────→  │
                                      │
                              Backend API
                              (New Inquiry)
                                      │
                            ┌─────────┴─────────┐
                            │                   │
                    Option 1: Polling      Option 2: WebSocket
                    (Check every 5s)        (Real-time)
                            │                   │
                            └─────────┬─────────┘
                                      │
                           Notification Service
                                      │
                        ┌─────────────┴─────────────┐
                        │                           │
                   Show Popup                  Badge Counter
                   (New Inquiry)               (Unread Count)
```

---

## 📡 OPTION 1: POLLING (RECOMMENDED FOR MVP)

**Simpler to implement, works everywhere**

### **Backend: New Inquiries Endpoint**

**File: `backend/routes/inquiries.js`** (Add this endpoint)

```javascript
// GET new inquiries (since last timestamp)
router.get('/new', verifyToken, isAdmin, async (req, res) => {
  try {
    const { since } = req.query; // timestamp from frontend
    const query = {};

    if (since) {
      query.createdAt = { $gt: new Date(parseInt(since)) };
    }

    const newInquiries = await ServiceInquiry.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('productId', 'name');

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

// Mark inquiry as read
router.put('/:id/read', verifyToken, isAdmin, async (req, res) => {
  try {
    const inquiry = await ServiceInquiry.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
```

**Update ServiceInquiry Model:**
```javascript
const serviceInquirySchema = new mongoose.Schema({
  // ... existing fields ...
  isRead: {
    type: Boolean,
    default: false
  }
});
```

---

### **Frontend: Notification Service**

**File: `admin/src/services/notificationService.js`**

```javascript
const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000/api';

class NotificationService {
  constructor() {
    this.pollingInterval = null;
    this.lastCheckTime = localStorage.getItem('lastInquiryCheck') || Date.now();
  }

  // Start polling for new inquiries
  startPolling(token, onNewInquiry, onNewInquiriesCount) {
    // Check immediately
    this.checkNewInquiries(token, onNewInquiry, onNewInquiriesCount);

    // Then poll every 5 seconds
    this.pollingInterval = setInterval(() => {
      this.checkNewInquiries(token, onNewInquiry, onNewInquiriesCount);
    }, 5000);
  }

  // Check for new inquiries
  async checkNewInquiries(token, onNewInquiry, onNewInquiriesCount) {
    try {
      const response = await fetch(
        `${API_BASE}/inquiries/new?since=${this.lastCheckTime}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.data && data.data.length > 0) {
          // New inquiries found
          data.data.forEach(inquiry => {
            onNewInquiry(inquiry);
          });

          this.lastCheckTime = data.timestamp;
          localStorage.setItem('lastInquiryCheck', this.lastCheckTime);
        }

        // Update unread count
        const unreadCount = await this.getUnreadCount(token);
        onNewInquiriesCount(unreadCount);
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  }

  // Get unread inquiry count
  async getUnreadCount(token) {
    try {
      const response = await fetch(`${API_BASE}/inquiries?status=new`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.length || 0;
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
      return 0;
    }
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Mark inquiry as read
  async markAsRead(token, inquiryId) {
    try {
      const response = await fetch(
        `${API_BASE}/inquiries/${inquiryId}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.ok;
    } catch (err) {
      console.error('Error marking as read:', err);
      return false;
    }
  }
}

export default new NotificationService();
```

---

### **Frontend: Notification Context**

**File: `admin/src/context/NotificationContext.jsx`**

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const { token, isAuthenticated } = useAuth();

  // Start polling when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      const handleNewInquiry = (inquiry) => {
        // Add to notifications
        setNotifications(prev => [inquiry, ...prev]);
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        // Show popup
        setShowPopup(true);
      };

      const handleCountUpdate = (count) => {
        setUnreadCount(count);
      };

      notificationService.startPolling(
        token,
        handleNewInquiry,
        handleCountUpdate
      );

      return () => notificationService.stopPolling();
    }
  }, [isAuthenticated, token]);

  // Mark inquiry as read
  const markAsRead = async (inquiryId) => {
    const success = await notificationService.markAsRead(token, inquiryId);
    if (success) {
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev =>
        prev.filter(n => n._id !== inquiryId)
      );
    }
  };

  // Close popup
  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      notifications,
      showPopup,
      closePopup,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
```

---

### **Frontend: Notification Popup Component**

**File: `admin/src/components/NotificationPopup.jsx`**

```javascript
import { useNotifications } from '../context/NotificationContext';
import styles from './NotificationPopup.module.css';

export default function NotificationPopup() {
  const { notifications, showPopup, closePopup, markAsRead } = useNotifications();

  if (!showPopup || notifications.length === 0) {
    return null;
  }

  const inquiry = notifications[0];

  const getTypeLabel = () => {
    const typeMap = {
      product: 'Product Inquiry',
      service: 'Service Inquiry',
      general: 'General Inquiry'
    };
    return typeMap[inquiry.type] || inquiry.type;
  };

  const handleViewDetails = () => {
    markAsRead(inquiry._id);
    window.location.href = `/inquiries/${inquiry._id}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.popup}>
        {/* Close button */}
        <button
          className={styles.closeButton}
          onClick={closePopup}
        >
          ✕
        </button>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.icon}>🔔</span>
          <h3>New Inquiry Received</h3>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <p>
            <strong>From:</strong> {inquiry.customerName}
          </p>
          <p>
            <strong>Type:</strong> {getTypeLabel()}
          </p>
          <p>
            <strong>Email:</strong> {inquiry.email}
          </p>

          {inquiry.productName && (
            <p>
              <strong>Product:</strong> {inquiry.productName}
            </p>
          )}

          {inquiry.serviceType && (
            <p>
              <strong>Service:</strong> {inquiry.serviceType}
            </p>
          )}

          {inquiry.quantityNeeded && (
            <p>
              <strong>Quantity:</strong> {inquiry.quantityNeeded}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            onClick={handleViewDetails}
          >
            View Details
          </button>
          <button
            className={styles.secondaryButton}
            onClick={closePopup}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### **Notification Popup Styles**

**File: `admin/src/components/NotificationPopup.module.css`**

```css
.container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.popup {
  width: 350px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 20px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.closeButton {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  color: #666666;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
}

.closeButton:hover {
  color: #000000;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.icon {
  font-size: 20px;
}

.header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #000000;
}

.content {
  margin-bottom: 20px;
  font-size: 13px;
  line-height: 1.6;
  color: #666666;
}

.content p {
  margin: 8px 0;
}

.content strong {
  color: #000000;
}

.actions {
  display: flex;
  gap: 10px;
}

.primaryButton {
  flex: 1;
  padding: 10px;
  background: #003366;
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.primaryButton:hover {
  background: #002244;
}

.secondaryButton {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
  color: #000000;
  border: 1px solid #e0e0e0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.secondaryButton:hover {
  background: #eeeeee;
}

@media (max-width: 480px) {
  .container {
    top: 10px;
    right: 10px;
    left: 10px;
  }

  .popup {
    width: 100%;
  }
}
```

---

### **Backend: Update App.js**

**Add to `backend/server.js`:**

```javascript
// Add to top with other imports
const { verifyToken, isAdmin } = require('./middleware/authMiddleware');

// Add to routes section
app.get('/api/inquiries/new', verifyToken, isAdmin, require('./routes/inquiries'));
app.put('/api/inquiries/:id/read', verifyToken, isAdmin, require('./routes/inquiries'));
```

---

## 🚀 INTEGRATION INTO APP

**File: `admin/src/App.jsx`**

```javascript
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationPopup from './components/NotificationPopup';
import Routes from './routes';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <NotificationPopup />
        <Routes />
      </NotificationProvider>
    </AuthProvider>
  );
}
```

---

## 📊 HOW IT WORKS

```
1. Admin logs in
   ↓
2. NotificationContext starts polling
   ↓
3. Poll every 5 seconds: GET /api/inquiries/new?since=timestamp
   ↓
4. New inquiry on website?
   ↓
5. Backend returns new inquiry in response
   ↓
6. Frontend shows popup with inquiry details
   ↓
7. Admin clicks "View Details"
   ↓
8. Mark as read: PUT /api/inquiries/:id/read
   ↓
9. Navigate to inquiry detail page
```

---

## ✅ TESTING

### **Test 1: Submit Inquiry on Website**
1. Go to https://ccsi-frontend.vercel.app
2. Submit an inquiry
3. Check admin dashboard
4. Popup should appear within 5 seconds

### **Test 2: Check Polling**
1. Open DevTools → Network
2. Look for repeated GET requests to `/api/inquiries/new`
3. Should happen every 5 seconds

### **Test 3: Mark as Read**
1. New inquiry popup appears
2. Click "Dismiss"
3. Badge count should decrease

---

## 🎯 POLLING VS WEBSOCKET

**Polling (Current):**
- ✅ Simple to implement
- ✅ Works everywhere (no WebSocket needed)
- ✅ Good for small scale
- ❌ Uses more server resources (constant checks)
- ❌ Slight delay (up to 5 seconds)

**WebSocket (Future):**
- ✅ True real-time
- ✅ More efficient
- ✅ Lower latency
- ❌ More complex
- ❌ Requires server support

**For MVP: Polling is perfect!** ✅

---

**Real-time notifications are ready!** 🚀