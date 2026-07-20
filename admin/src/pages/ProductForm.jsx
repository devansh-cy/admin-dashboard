import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './ProductForm.module.css';

export default function ProductForm() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [threeSixtyInput, setThreeSixtyInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isEditMode && token) {
      fetchProductDetails();
    }
  }, [id, token]);

  const fetchProductDetails = async () => {
    try {
      setFetching(true);
      const res = await fetch(`${API_BASE}/products/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const product = data.data;
        setName(product.name);
        setCategory(product.category);
        setPrice(product.price);
        setDescription(product.description || '');
        setImagesInput(product.images ? product.images.join(', ') : '');
        setThreeSixtyInput(product.threeSixtyImages ? product.threeSixtyImages.join(', ') : '');
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Error fetching product details');
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a valid positive number');
      setLoading(false);
      return;
    }

    const images = imagesInput
      .split(',')
      .map(img => img.trim())
      .filter(img => img.length > 0);

    const threeSixtyImages = threeSixtyInput
      .split(',')
      .map(img => img.trim())
      .filter(img => img.length > 0);

    const payload = {
      name,
      category,
      price: priceNum,
      description,
      images,
      threeSixtyImages
    };

    try {
      const url = isEditMode ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/products');
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (err) {
      setError('An error occurred. Please check network connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.main}>
          <Sidebar />
          <div className={styles.content}>
            <p>Loading product details...</p>
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
            <button onClick={() => navigate('/products')} className={styles.backButton}>
              ← Back to Products
            </button>
          </div>

          <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.formCard}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Category *</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={styles.input}
                    placeholder="e.g. Panel AC, Water Chiller"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Price (₹) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                  rows={5}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Images (URLs, comma-separated)</label>
                <input
                  type="text"
                  value={imagesInput}
                  onChange={(e) => setImagesInput(e.target.value)}
                  className={styles.input}
                  placeholder="https://example.com/img1.png, https://example.com/img2.png"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>360° Images (URLs, comma-separated)</label>
                <input
                  type="text"
                  value={threeSixtyInput}
                  onChange={(e) => setThreeSixtyInput(e.target.value)}
                  className={styles.input}
                  placeholder="https://example.com/frame1.png, https://example.com/frame2.png"
                />
                <p className={styles.helpText}>Provide ordered list of image frames for 360-degree rotation view.</p>
              </div>

              <div className={styles.actions}>
                <button type="submit" disabled={loading} className={styles.submitButton}>
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/products')}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
