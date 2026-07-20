const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
