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

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (token && id) {
      fetchInquiryDetail();
    }
  }, [token, id]);

  const fetchInquiryDetail = async () => {
    try {
      setLoading(true);
      // Fetch details
      const res = await fetch(`${API_BASE}/inquiries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setInquiry(data.data);
        setStatus(data.data.status);

        // If not read, mark as read
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
        setSuccessMsg('Status updated successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;

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
      service: 'Service Inquiry',
      general: 'General Inquiry'
    };
    return map[type] || type;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.main}>
          <Sidebar />
          <div className={styles.content}>
            <p>Loading inquiry details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.main}>
          <Sidebar />
          <div className={styles.content}>
            <p>Inquiry not found.</p>
            <button onClick={() => navigate('/inquiries')} className={styles.backButton}>
              Back to Inquiries
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.content}>
          <div className={styles.headerRow}>
            <button onClick={() => navigate('/inquiries')} className={styles.backButton}>
              ← Back to Inquiries
            </button>
            <button onClick={handleDelete} className={styles.deleteButton}>
              Delete Inquiry
            </button>
          </div>

          <h1>Inquiry Details</h1>

          {successMsg && <div className={styles.successAlert}>{successMsg}</div>}

          <div className={styles.detailsGrid}>
            {/* Left: Client and message details */}
            <div className={styles.infoCard}>
              <h2>Customer Information</h2>
              <div className={styles.detailField}>
                <span className={styles.fieldLabel}>Inquiry Number:</span>
                <span className={styles.fieldValue} style={{ fontWeight: '600', color: '#000' }}>
                  {inquiry.inquiryNumber || 'N/A'}
                </span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.fieldLabel}>Name:</span>
                <span className={styles.fieldValue}>{inquiry.customerName}</span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.fieldLabel}>Email:</span>
                <span className={styles.fieldValue}>{inquiry.email}</span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.fieldLabel}>Phone:</span>
                <span className={styles.fieldValue}>{inquiry.phone || 'N/A'}</span>
              </div>
              <div className={styles.detailField}>
                <span className={styles.fieldLabel}>Inquiry Type:</span>
                <span className={styles.fieldValue}>{getTypeLabel(inquiry.type)}</span>
              </div>

              {inquiry.productName && (
                <div className={styles.detailField}>
                  <span className={styles.fieldLabel}>Product Name:</span>
                  <span className={styles.fieldValue}>{inquiry.productName}</span>
                </div>
              )}

              {inquiry.serviceType && (
                <div className={styles.detailField}>
                  <span className={styles.fieldLabel}>Service Type:</span>
                  <span className={styles.fieldValue}>{inquiry.serviceType}</span>
                </div>
              )}

              {inquiry.quantityNeeded && (
                <div className={styles.detailField}>
                  <span className={styles.fieldLabel}>Quantity Needed:</span>
                  <span className={styles.fieldValue}>{inquiry.quantityNeeded}</span>
                </div>
              )}

              <div className={styles.detailField}>
                <span className={styles.fieldLabel}>Date Received:</span>
                <span className={styles.fieldValue}>
                  {new Date(inquiry.createdAt).toLocaleString()}
                </span>
              </div>

              <div className={styles.messageBox}>
                <h3>Message</h3>
                <p>{inquiry.message || 'No message content provided.'}</p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className={styles.actionsCard}>
              <h2>Inquiry Management</h2>

              <div className={styles.statusField}>
                <label className={styles.fieldLabel}>Update Status:</label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={styles.statusSelect}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
