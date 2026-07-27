import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import styles from './Sidebar.module.css';

export default function Sidebar({ mobileOpen, closeMobileSidebar }) {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {mobileOpen && (
        <div className={styles.backdrop} onClick={closeMobileSidebar} />
      )}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sectionHeader}>MAIN NAVIGATION</div>
        <nav className={styles.nav}>
          <Link
            to="/dashboard"
            onClick={closeMobileSidebar}
            className={`${styles.navItem} ${isActive('/dashboard') ? styles.active : ''}`}
          >
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1"></rect>
              <rect x="14" y="3" width="7" height="5" rx="1"></rect>
              <rect x="14" y="12" width="7" height="9" rx="1"></rect>
              <rect x="3" y="16" width="7" height="5" rx="1"></rect>
            </svg>
            <span className={styles.navText}>Dashboard</span>
          </Link>

          <Link
            to="/inquiries"
            onClick={closeMobileSidebar}
            className={`${styles.navItem} ${isActive('/inquiries') ? styles.active : ''}`}
          >
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className={styles.navText}>Inquiries</span>
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </Link>

          <Link
            to="/products"
            onClick={closeMobileSidebar}
            className={`${styles.navItem} ${isActive('/products') ? styles.active : ''}`}
          >
            <svg className={styles.navIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span className={styles.navText}>Products Catalog</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.hvacStatusCard}>
            <div className={styles.hvacStatusHeader}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <span>Climate Monitor</span>
            </div>
            <p className={styles.hvacStatusDesc}>Real-time inquiries & stock telemetry synchronized.</p>
          </div>
        </div>
      </aside>
    </>
  );
}

