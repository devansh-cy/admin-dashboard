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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
      product: 'Product Inquiry',
      service: 'Service & Maint.',
      general: 'General Info'
    };
    return map[type] || type;
  };

  const getStatusBadge = (statusStr) => {
    const statusMap = {
      new: { label: 'New', className: styles.statusNew },
      contacted: { label: 'Contacted', className: styles.statusContacted },
      quoted: { label: 'Quoted', className: styles.statusQuoted },
      converted: { label: 'Converted', className: styles.statusConverted },
      closed: { label: 'Closed', className: styles.statusClosed }
    };
    const item = statusMap[statusStr] || { label: statusStr, className: styles.statusDefault };
    return <span className={`${styles.statusBadge} ${item.className}`}>{item.label}</span>;
  };

  const statusOptions = [
    { id: '', label: 'All Inquiries' },
    { id: 'new', label: 'New' },
    { id: 'contacted', label: 'Contacted' },
    { id: 'quoted', label: 'Quoted' },
    { id: 'converted', label: 'Converted' },
    { id: 'closed', label: 'Closed' }
  ];

  return (
    <div className={styles.container}>
      <Header toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      <div className={styles.main}>
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          closeMobileSidebar={() => setMobileSidebarOpen(false)}
        />
        <div className={styles.content}>
          {/* Header Row */}
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.pageTitle}>Customer Inquiries</h1>
              <p className={styles.pageSubtitle}>Manage inbound quotes, service requests, and customer questions</p>
            </div>
          </div>

          {/* Quick Filter Status Tabs */}
          <div className={styles.statusTabs}>
            {statusOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setStatus(opt.id)}
                className={`${styles.tabBtn} ${status === opt.id ? styles.tabActive : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Filters Bar */}
          <div className={styles.filtersBar}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <div className={styles.searchWrapper}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search customer name, email, or message..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
                {search && (
                  <button type="button" onClick={() => { setSearch(''); fetchInquiries(); }} className={styles.clearSearchBtn}>
                    ✕
                  </button>
                )}
              </div>
              <button type="submit" className={styles.searchButton}>Search</button>
            </form>

            <div className={styles.selectGroup}>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={styles.select}
              >
                <option value="">All Categories</option>
                <option value="product">Product Inquiries</option>
                <option value="service">Service & Maintenance</option>
                <option value="general">General Inquiries</option>
              </select>
            </div>
          </div>

          {/* Inquiry Table */}
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Fetching inquiry database...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <p>No matching customer inquiries found.</p>
            </div>
          ) : (
            <div className={styles.tableCard}>
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date Received</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inquiry) => (
                      <tr
                        key={inquiry._id}
                        onClick={() => navigate(`/inquiries/${inquiry._id}`)}
                        className={`${styles.tableRow} ${!inquiry.isRead ? styles.unreadRow : ''}`}
                      >
                        <td>
                          <div className={styles.customerCell}>
                            <div className={styles.customerHeader}>
                              <span className={styles.customerName}>{inquiry.customerName}</span>
                              {!inquiry.isRead && <span className={styles.unreadTag}>NEW</span>}
                            </div>
                            <span className={styles.customerEmail}>{inquiry.email} {inquiry.phone ? `• ${inquiry.phone}` : ''}</span>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

