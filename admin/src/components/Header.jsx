import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/dashboard" className={styles.logoLink}>
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>ClimateControl <span>India</span></span>
        </Link>
        <span className={styles.adminBadge}>Admin Panel</span>
      </div>

      <div className={styles.right}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name || user?.email}</span>
        </div>
        <button
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
