import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './ProductList.module.css';

export default function ProductList() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.content}>
          <div className={styles.headerRow}>
            <h1>Products</h1>
            <button
              onClick={() => navigate('/products/new')}
              className={styles.addButton}
            >
              + Add Product
            </button>
          </div>

          <div className={styles.filtersBar}>
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {loading ? (
            <p>Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Images</th>
                    <th>360° Images</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product._id}>
                      <td className={styles.productName}>{product.name}</td>
                      <td>{product.category}</td>
                      <td>₹{product.price ? product.price.toLocaleString() : '0'}</td>
                      <td>{product.images?.length || 0}</td>
                      <td>{product.threeSixtyImages?.length || 0}</td>
                      <td className={styles.actions}>
                        <button
                          onClick={() => navigate(`/products/edit/${product._id}`)}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
