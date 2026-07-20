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
