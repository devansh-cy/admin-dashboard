import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';

export default function Header({ toggleMobileSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getUserInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'A';
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {toggleMobileSidebar && (
          <button className={styles.mobileMenuBtn} onClick={toggleMobileSidebar} aria-label="Toggle Navigation">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
        <Link to="/dashboard" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
            </svg>
          </div>
          <div className={styles.brandText}>
            <span className={styles.logoTitle}>ClimateControl <span className={styles.country}>India</span></span>
            <span className={styles.logoSubtitle}>HVAC & Environmental Admin</span>
          </div>
        </Link>
      </div>

      <div className={styles.center}>
        <div className={styles.telemetryBadge}>
          <span className={styles.pulseDot}></span>
          <span className={styles.telemetryText}>Telemetry System Online</span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>{getUserInitial()}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || user?.email || 'Administrator'}</span>
            <span className={styles.userRole}>System Admin</span>
          </div>
        </div>

        <button className={styles.logoutButton} onClick={handleLogout} title="Sign Out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

