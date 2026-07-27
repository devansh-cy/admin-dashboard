import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './InquiryDetail.module.css';

export default function InquiryDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (token && id) {
      fetchInquiryDetail();
    }
  }, [token, id]);

  const fetchInquiryDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/inquiries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setInquiry(data.data);
        setStatus(data.data.status);

        if (!data.data.isRead) {
          await fetch(`${API_BASE}/inquiries/${id}/read`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } else {
        console.error('Inquiry not found');
      }
    } catch (err) {
      console.error('Error fetching inquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatus(newStatus);
      const res = await fetch(`${API_BASE}/inquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setInquiry(data.data);
        setSuccessMsg('Inquiry status updated successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this inquiry record?')) return;

    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        navigate('/inquiries');
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err);
    }
  };

  const getTypeLabel = (type) => {
    const map = {
      product: 'Product Inquiry',
      service: 'Service & Maintenance',
      general: 'General Information'
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

  if (loading) {
    return (
      <div className={styles.container}>
        <Header toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <div className={styles.main}>
          <Sidebar mobileOpen={mobileSidebarOpen} closeMobileSidebar={() => setMobileSidebarOpen(false)} />
          <div className={styles.content}>
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading inquiry record details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className={styles.container}>
        <Header toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <div className={styles.main}>
          <Sidebar mobileOpen={mobileSidebarOpen} closeMobileSidebar={() => setMobileSidebarOpen(false)} />
          <div className={styles.content}>
            <div className={styles.emptyState}>
              <p>Inquiry record not found.</p>
              <button onClick={() => navigate('/inquiries')} className={styles.backButton}>
                ← Back to Inquiries List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      <div className={styles.main}>
        <Sidebar mobileOpen={mobileSidebarOpen} closeMobileSidebar={() => setMobileSidebarOpen(false)} />
        <div className={styles.content}>
          {/* Top Bar Actions */}
          <div className={styles.topActions}>
            <button onClick={() => navigate('/inquiries')} className={styles.backButton}>
              ← Back to Inquiries
            </button>
            <button onClick={handleDelete} className={styles.deleteButton}>
              Delete Record
            </button>
          </div>

          {/* Title Header */}
          <div className={styles.detailTitleBar}>
            <div>
              <div className={styles.inquiryMetaRow}>
                <span className={styles.inquiryId}>Inquiry #{inquiry.inquiryNumber || inquiry._id.slice(-6)}</span>
                {getStatusBadge(inquiry.status)}
              </div>
              <h1 className={styles.customerHeaderName}>{inquiry.customerName}</h1>
            </div>
          </div>

          {successMsg && <div className={styles.successAlert}>✓ {successMsg}</div>}

          <div className={styles.detailsGrid}>
            {/* Left: Customer Info & Content */}
            <div className={styles.infoCard}>
              <h2 className={styles.cardSectionTitle}>Customer & Equipment Info</h2>
              
              <div className={styles.fieldsGrid}>
                <div className={styles.detailField}>
                  <span className={styles.fieldLabel}>Customer Name</span>
                  <span className={styles.fieldValue}>{inquiry.customerName}</span>
                </div>

                <div className={styles.detailField}>
                  <span className={styles.fieldLabel}>Email Address</span>
                  <a href={`mailto:${inquiry.email}`} className={styles.linkValue}>
                    {inquiry.email} ↗
                  </a>
                </div>

                <div className={styles.detailField}>
                  <span className={styles.fieldLabel}>Contact Phone</span>
                  {inquiry.phone ? (
                    <a href={`tel:${inquiry.phone}`} className={styles.linkValue}>
                      {inquiry.phone} ↗
                    </a>
                  ) : (
                    <span className={styles.fieldValueMuted}>Not provided</span>
                  )}
                </div>

                <div className={styles.detailField}>
                  <span className={styles.fieldLabel}>Inquiry Category</span>
                  <span className={styles.fieldValue}>{getTypeLabel(inquiry.type)}</span>
                </div>

                {inquiry.productName && (
                  <div className={styles.detailField}>
                    <span className={styles.fieldLabel}>HVAC Product Unit</span>
                    <span className={styles.fieldValueHighlight}>{inquiry.productName}</span>
                  </div>
                )}

                {inquiry.serviceType && (
                  <div className={styles.detailField}>
                    <span className={styles.fieldLabel}>Requested Service</span>
                    <span className={styles.fieldValueHighlight}>{inquiry.serviceType}</span>
                  </div>
                )}

                {inquiry.quantityNeeded && (
                  <div className={styles.detailField}>
                    <span className={styles.fieldLabel}>Requested Quantity</span>
                    <span className={styles.fieldValue}>{inquiry.quantityNeeded} Units</span>
                  </div>
                )}

                <div className={styles.detailField}>
                  <span className={styles.fieldLabel}>Submission Timestamp</span>
                  <span className={styles.fieldValue}>
                    {new Date(inquiry.createdAt).toLocaleString(undefined, {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              </div>

              <div className={styles.messageBox}>
                <h3 className={styles.messageTitle}>Inquiry Description / Notes</h3>
                <p className={styles.messageText}>{inquiry.message || 'No description was provided.'}</p>
              </div>
            </div>

            {/* Right: Actions & Status */}
            <div className={styles.actionsCard}>
              <h2 className={styles.cardSectionTitle}>Status Management</h2>

              <div className={styles.statusControlGroup}>
                <label className={styles.fieldLabel}>Current Status Stage</label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="new">🔴 New (Unprocessed)</option>
                  <option value="contacted">🔵 Contacted Customer</option>
                  <option value="quoted">🟡 Quoted & Estimating</option>
                  <option value="converted">🟢 Converted / Order Placed</option>
                  <option value="closed">⚪ Closed / Archived</option>
                </select>
              </div>

              <div className={styles.quickContactBox}>
                <h4 className={styles.quickContactTitle}>Quick Contact Shortcuts</h4>
                <a href={`mailto:${inquiry.email}?subject=Re: Inquiry %23${inquiry.inquiryNumber || inquiry._id.slice(-6)} - Climate Control India`} className={styles.contactEmailBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  Send Response Email
                </a>
                {inquiry.phone && (
                  <a href={`tel:${inquiry.phone}`} className={styles.contactPhoneBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Call Customer Phone
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

