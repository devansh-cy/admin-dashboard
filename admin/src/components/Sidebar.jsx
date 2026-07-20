import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <Link
          to="/dashboard"
          className={`${styles.navItem} ${isActive('/dashboard') ? styles.active : ''}`}
        >
          Dashboard
        </Link>

        <Link
          to="/inquiries"
          className={`${styles.navItem} ${isActive('/inquiries') ? styles.active : ''}`}
        >
          Inquiries
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </Link>

        <Link
          to="/products"
          className={`${styles.navItem} ${isActive('/products') ? styles.active : ''}`}
        >
          Products
        </Link>
      </nav>
    </aside>
  );
}
