# ADMIN DASHBOARD - COMPONENTS IMPLEMENTATION
## Step-by-Step Component Building Guide

---

## 📋 COMPONENTS TO BUILD

1. ✅ LoginPage (authentication)
2. ➕ Header (navigation)
3. ➕ Sidebar (menu)
4. ➕ Dashboard (home page with stats)
5. ➕ InquiryList (view all inquiries)
6. ➕ InquiryDetail (single inquiry with response)
7. ➕ ProductList (view all products)
8. ➕ ProductForm (add/edit products)
9. ✅ NotificationPopup (real-time notifications)

---

## 🎯 COMPONENT 2: Header

**File: `admin/src/components/Header.jsx`**

```javascript
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/dashboard" className={styles.logo}>
          Admin Dashboard
        </Link>
      </div>

      <div className={styles.right}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name || user?.email}</span>
        </div>
        <button
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
```

**File: `admin/src/components/Header.module.css`**

```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  text-decoration: none;
  transition: color 0.2s;
}

.logo:hover {
  color: #003366;
}

.right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.userInfo {
  display: flex;
  flex-direction: column;
}

.userName {
  font-size: 13px;
  color: #000000;
  font-weight: 500;
}

.logoutButton {
  padding: 8px 16px;
  background: #f5f5f5;
  color: #000000;
  border: 1px solid #e0e0e0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.logoutButton:hover {
  background: #e0e0e0;
}
```

---

## 🎯 COMPONENT 3: Sidebar

**File: `admin/src/components/Sidebar.jsx`**

```javascript
import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <Link
          to="/dashboard"
          className={`${styles.navItem} ${isActive('/dashboard') ? styles.active : ''}`}
        >
          Dashboard
        </Link>

        <Link
          to="/inquiries"
          className={`${styles.navItem} ${isActive('/inquiries') ? styles.active : ''}`}
        >
          Inquiries
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </Link>

        <Link
          to="/products"
          className={`${styles.navItem} ${isActive('/products') ? styles.active : ''}`}
        >
          Products
        </Link>
      </nav>
    </aside>
  );
}
```

**File: `admin/src/components/Sidebar.module.css`**

```css
.sidebar {
  width: 200px;
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0;
  position: fixed;
  left: 0;
  top: 56px;
  bottom: 0;
  overflow-y: auto;
}

.nav {
  display: flex;
  flex-direction: column;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: #000000;
  text-decoration: none;
  font-size: 14px;
  border-left: 3px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.navItem:hover {
  background: #f5f5f5;
}

.navItem.active {
  background: #f5f5f5;
  border-left-color: #003366;
  color: #003366;
  font-weight: 600;
}

.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #DC3545;
  color: #ffffff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
  margin-left: auto;
}

@media (max-width: 768px) {
  .sidebar {
    width: 70px;
    padding: 10px 0;
  }

  .navItem {
    padding: 12px;
    justify-content: center;
    font-size: 0;
  }

  .navItem::before {
    content: attr(data-label);
    display: none;
  }

  .badge {
    position: absolute;
    top: 0;
    right: 0;
    width: 16px;
    height: 16px;
    font-size: 10px;
  }
}
```

---

## 🎯 COMPONENT 4: Dashboard

**File: `admin/src/pages/Dashboard.jsx`**

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalInquiries: 0,
    newInquiries: 0,
    products: 0,
    repliedInquiries: 0
  });

  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch inquiries
      const inquiriesRes = await fetch(`${API_BASE}/inquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const inquiriesData = await inquiriesRes.json();
      const allInquiries = inquiriesData.data || [];

      // Fetch products
      const productsRes = await fetch(`${API_BASE}/products`);
      const productsData = await productsRes.json();
      const allProducts = productsData.data || [];

      // Calculate stats
      const newCount = allInquiries.filter(i => i.status === 'new').length;
      const repliedCount = allInquiries.filter(i => i.status === 'replied').length;

      setStats({
        totalInquiries: allInquiries.length,
        newInquiries: newCount,
        products: allProducts.length,
        repliedInquiries: repliedCount
      });

      // Set recent inquiries (last 5)
      setRecentInquiries(allInquiries.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const map = {
      product: 'Product',
      service: 'Service',
      general: 'General'
    };
    return map[type] || type;
  };

  const getStatusColor = (status) => {
    const map = {
      new: '#DC3545',
      'in-progress': '#FF9800',
      replied: '#28A745',
      closed: '#999999'
    };
    return map[status] || '#000000';
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.content}>
          <h1>Dashboard</h1>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.totalInquiries}</div>
              <div className={styles.statLabel}>Total Inquiries</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.newInquiries}</div>
              <div className={styles.statLabel}>New Inquiries</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.products}</div>
              <div className={styles.statLabel}>Products</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.repliedInquiries}</div>
              <div className={styles.statLabel}>Replied</div>
            </div>
          </div>

          {/* Recent Inquiries */}
          <div className={styles.section}>
            <h2>Recent Inquiries</h2>

            {loading ? (
              <p>Loading...</p>
            ) : recentInquiries.length === 0 ? (
              <p>No inquiries yet</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInquiries.map(inquiry => (
                    <tr key={inquiry._id}>
                      <td>{inquiry.customerName}</td>
                      <td>{getTypeLabel(inquiry.type)}</td>
                      <td>
                        <span
                          className={styles.status}
                          style={{ color: getStatusColor(inquiry.status) }}
                        >
                          {inquiry.status}
                        </span>
                      </td>
                      <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**File: `admin/src/pages/Dashboard.module.css`**

```css
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  margin-left: 200px;
  background: #ffffff;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.statCard {
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  text-align: center;
}

.statNumber {
  font-size: 32px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 10px;
}

.statLabel {
  font-size: 13px;
  color: #666666;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #000000;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table thead {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #000000;
}

.table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  color: #666666;
}

.table tr:hover {
  background: #f5f5f5;
}

.status {
  font-weight: 600;
  text-transform: capitalize;
}

@media (max-width: 768px) {
  .content {
    margin-left: 70px;
    padding: 15px;
  }

  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .statCard {
    padding: 15px;
  }

  .statNumber {
    font-size: 24px;
  }

  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px;
  }
}
```

---

## 📋 BUILD ORDER

1. **Day 1:** LoginPage + Header + Sidebar
2. **Day 2:** Dashboard + Notifications
3. **Day 3:** InquiryList + InquiryDetail
4. **Day 4:** ProductList + ProductForm
5. **Day 5:** Testing + Bug fixes
6. **Day 6:** Deployment

---

## 🚀 NEXT STEPS

I'll create the remaining components:
- ✅ InquiryList (view all inquiries)
- ✅ InquiryDetail (view + respond)
- ✅ ProductList (manage products)
- ✅ ProductForm (add/edit products)

Then the complete build guide! 

Ready for the next components? 🔥