import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalInquiries: 0,
    newInquiries: 0,
    products: 0,
    closedInquiries: 0,
    quotedInquiries: 0
  });

  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

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
      const closedCount = allInquiries.filter(i => i.status === 'closed').length;
      const quotedCount = allInquiries.filter(i => i.status === 'quoted' || i.status === 'converted').length;

      setStats({
        totalInquiries: allInquiries.length,
        newInquiries: newCount,
        products: allProducts.length,
        closedInquiries: closedCount,
        quotedInquiries: quotedCount
      });

      // Set recent inquiries (last 6)
      setRecentInquiries(allInquiries.slice(0, 6));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const map = {
      product: 'Product Inquiry',
      service: 'Service & Maintenance',
      general: 'General Info'
    };
    return map[type] || type;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      new: { label: 'New', className: styles.statusNew },
      contacted: { label: 'Contacted', className: styles.statusContacted },
      quoted: { label: 'Quoted', className: styles.statusQuoted },
      converted: { label: 'Converted', className: styles.statusConverted },
      closed: { label: 'Closed', className: styles.statusClosed }
    };
    const item = statusMap[status] || { label: status, className: styles.statusDefault };
    return <span className={`${styles.statusBadge} ${item.className}`}>{item.label}</span>;
  };

  return (
    <div className={styles.container}>
      <Header toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      <div className={styles.main}>
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          closeMobileSidebar={() => setMobileSidebarOpen(false)}
        />
        <div className={styles.content}>
          {/* Welcome Banner */}
          <div className={styles.welcomeBanner}>
            <div className={styles.bannerContent}>
              <h1 className={styles.greeting}>Welcome back, {user?.name || 'Admin'} 👋</h1>
              <p className={styles.subheading}>Here is your inquiry and catalog overview for today.</p>
            </div>
            <div className={styles.bannerActions}>
              <button onClick={() => navigate('/products/new')} className={styles.primaryBtn}>
                + Add Product
              </button>
              <button onClick={() => navigate('/inquiries')} className={styles.secondaryBtn}>
                View All Inquiries
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>Total Inquiries</span>
                <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
              </div>
              <div className={styles.statNumber}>{stats.totalInquiries}</div>
              <div className={styles.statFooter}>
                <span className={styles.trendUp}>↑ Active Inbound</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>New / Pending</span>
                <div className={`${styles.statIcon} ${styles.iconRed}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
              </div>
              <div className={styles.statNumber}>{stats.newInquiries}</div>
              <div className={styles.statFooter}>
                <span className={styles.urgentBadge}>Requires Response</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>Products</span>
                <div className={`${styles.statIcon} ${styles.iconTeal}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                </div>
              </div>
              <div className={styles.statNumber}>{stats.products}</div>
              <div className={styles.statFooter}>
                <span className={styles.trendNeutral}>In Catalog</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <span className={styles.statLabel}>Quoted / Converted</span>
                <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <div className={styles.statNumber}>{stats.quotedInquiries}</div>
              <div className={styles.statFooter}>
                <span className={styles.trendUp}>Success Rate</span>
              </div>
            </div>
          </div>

          {/* Recent Inquiries Table */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Recent Customer Inquiries</h2>
                <p className={styles.sectionSub}>Latest customer communications and inquiry logs</p>
              </div>
              <button onClick={() => navigate('/inquiries')} className={styles.linkBtn}>
                View All →
              </button>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Syncing recent inquiry logs...</p>
              </div>
            ) : recentInquiries.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>No inquiries recorded yet.</p>
              </div>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Received Date</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInquiries.map(inquiry => (
                      <tr
                        key={inquiry._id}
                        onClick={() => navigate(`/inquiries/${inquiry._id}`)}
                        className={styles.tableRow}
                      >
                        <td>
                          <div className={styles.customerCell}>
                            <span className={styles.customerName}>{inquiry.customerName}</span>
                            <span className={styles.customerEmail}>{inquiry.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.typeTag}>{getTypeLabel(inquiry.type)}</span>
                        </td>
                        <td>{getStatusBadge(inquiry.status)}</td>
                        <td className={styles.dateCell}>
                          {new Date(inquiry.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/inquiries/${inquiry._id}`);
                            }}
                            className={styles.actionBtn}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

