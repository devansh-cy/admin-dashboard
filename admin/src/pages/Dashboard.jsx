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
    closedInquiries: 0
  });

  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

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

      setStats({
        totalInquiries: allInquiries.length,
        newInquiries: newCount,
        products: allProducts.length,
        closedInquiries: closedCount
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
      contacted: '#FF9800',
      quoted: '#0056B3',
      converted: '#28A745',
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
              <div className={styles.statNumber}>{stats.closedInquiries}</div>
              <div className={styles.statLabel}>Closed</div>
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
