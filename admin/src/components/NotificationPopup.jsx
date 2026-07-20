import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import styles from './NotificationPopup.module.css';

export default function NotificationPopup() {
  const { notifications, showPopup, closePopup, markAsRead } = useNotifications();
  const navigate = useNavigate();

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
    closePopup();
    navigate(`/inquiries/${inquiry._id}`);
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
