import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './InquiryList.module.css';

export default function InquiryList() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      fetchInquiries();
    }
  }, [token, status, type]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_BASE}/inquiries`);
      if (status) url.searchParams.append('status', status);
      if (type) url.searchParams.append('type', type);
      if (search) url.searchParams.append('search', search);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInquiries(data.data || []);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInquiries();
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
          <div className={styles.headerRow}>
            <h1>Inquiries</h1>
          </div>

          {/* Filters Form */}
          <div className={styles.filtersBar}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <input
                type="text"
                placeholder="Search name, email, message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>Search</button>
            </form>

            <div className={styles.selectGroup}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.select}
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="converted">Converted</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={styles.select}
              >
                <option value="">All Types</option>
                <option value="product">Product</option>
                <option value="service">Service</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          {/* Inquiry Table */}
          {loading ? (
            <p>Loading inquiries...</p>
          ) : inquiries.length === 0 ? (
            <p>No inquiries found</p>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry._id} className={!inquiry.isRead ? styles.unreadRow : ''}>
                      <td>
                        {inquiry.customerName} {!inquiry.isRead && <span className={styles.unreadMarker}>NEW</span>}
                      </td>
                      <td>{inquiry.email}</td>
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
                      <td>
                        <button
                          onClick={() => navigate(`/inquiries/${inquiry._id}`)}
                          className={styles.viewButton}
                        >
                          View Details
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
  );
}
