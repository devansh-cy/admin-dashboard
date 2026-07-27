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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;

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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  return (
    <div className={styles.container}>
      <Header toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      <div className={styles.main}>
        <Sidebar mobileOpen={mobileSidebarOpen} closeMobileSidebar={() => setMobileSidebarOpen(false)} />
        <div className={styles.content}>
          {/* Header Row */}
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.pageTitle}>Product Catalog</h1>
              <p className={styles.pageSubtitle}>Manage climate control systems and products</p>
            </div>
            <button
              onClick={() => navigate('/products/new')}
              className={styles.addButton}
            >
              + Add New Product
            </button>
          </div>

          {/* Filters & View Toggle Bar */}
          <div className={styles.filtersBar}>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className={styles.clearSearchBtn}>
                  ✕
                </button>
              )}
            </div>

            <div className={styles.rightFilters}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">All Equipment Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <div className={styles.viewToggleGroup}>
                <button
                  onClick={() => setViewMode('table')}
                  className={`${styles.viewToggleBtn} ${viewMode === 'table' ? styles.viewActive : ''}`}
                  title="Table View"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
                  title="Grid Cards View"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Product Listing */}
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Fetching equipment catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <p>No products found matching your search criteria.</p>
              <button onClick={() => { setSearch(''); setCategoryFilter(''); }} className={styles.resetBtn}>Reset Filters</button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className={styles.productGrid}>
              {filteredProducts.map(product => (
                <div key={product._id} className={styles.productCard}>
                  <div className={styles.cardImageContainer}>
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.name} className={styles.productThumbnail} />
                    ) : (
                      <div className={styles.noImgPlaceholder}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                    {product.threeSixtyImages?.length > 0 && (
                      <span className={styles.threeSixtyBadge}>360° Interactive</span>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.categoryBadge}>{product.category}</span>
                    <h3 className={styles.productTitle}>{product.name}</h3>
                    <div className={styles.priceRow}>
                      <span className={styles.priceValue}>₹{product.price ? product.price.toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className={styles.cardActions}>
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.tableCard}>
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Media Assets</th>
                      <th>360° View</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product._id}>
                        <td>
                          <div className={styles.productTableCell}>
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt={product.name} className={styles.tableThumb} />
                            ) : (
                              <div className={styles.tableThumbPlaceholder}>ITEM</div>
                            )}
                            <span className={styles.productName}>{product.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.categoryBadge}>{product.category}</span>
                        </td>
                        <td className={styles.priceText}>₹{product.price ? product.price.toLocaleString() : '0'}</td>
                        <td>
                          <span className={styles.countBadge}>{product.images?.length || 0} Images</span>
                        </td>
                        <td>
                          {product.threeSixtyImages?.length > 0 ? (
                            <span className={styles.badge360Active}>✓ Available</span>
                          ) : (
                            <span className={styles.badge360None}>None</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actions}>
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

