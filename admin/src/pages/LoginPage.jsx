import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const result = await register(email, password, name);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error);
        }
      } else {
        const result = await login(email, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>ClimateControl <span>India</span></span>
        </div>
        <p className={styles.subtitle}>{isRegister ? 'Create Admin Account' : 'Admin Login'}</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className={styles.toggle}>
          {isRegister ? 'Already have account? ' : 'No account? '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}
