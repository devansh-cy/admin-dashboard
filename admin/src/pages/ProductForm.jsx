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

  // Basic Details State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [threeSixtyInput, setThreeSixtyInput] = useState('');

  // Specs State
  const [showSpecs, setShowSpecs] = useState(false);
  const [coolingCapacity, setCoolingCapacity] = useState('');
  const [power, setPower] = useState('');
  const [refrigerant, setRefrigerant] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');
  const [maxAmbientTemp, setMaxAmbientTemp] = useState('');
  const [workingTempRange, setWorkingTempRange] = useState('');
  const [starRating, setStarRating] = useState('');
  const [capacity, setCapacity] = useState('');
  const [voltage, setVoltage] = useState('');
  const [coolingType, setCoolingType] = useState('');

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
        setPrice(product.price || '');
        setDescription(product.description || '');
        setImagesInput(product.images ? product.images.join(', ') : '');
        setThreeSixtyInput(product.threeSixtyImages ? product.threeSixtyImages.join(', ') : '');

        // Load nested specs
        const specs = product.specifications || {};
        setCoolingCapacity(specs.coolingCapacity !== undefined ? specs.coolingCapacity : '');
        setPower(specs.power !== undefined ? specs.power : '');
        setRefrigerant(specs.refrigerant || '');
        setDimensions(specs.dimensions || '');
        setWeight(specs.weight !== undefined ? specs.weight : '');
        setMaxAmbientTemp(specs.maxAmbientTemp !== undefined ? specs.maxAmbientTemp : '');
        setWorkingTempRange(specs.workingTempRange || '');
        setStarRating(specs.starRating || '');
        setCapacity(specs.capacity || '');
        setVoltage(specs.voltage || '');
        setCoolingType(specs.coolingType || '');
        
        // Auto-expand specs section if any spec exists
        if (Object.keys(specs).length > 0) {
          setShowSpecs(true);
        }
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

    // Build Specifications payload
    const specifications = {
      coolingCapacity: coolingCapacity !== '' ? parseFloat(coolingCapacity) : undefined,
      power: power !== '' ? parseFloat(power) : undefined,
      refrigerant: refrigerant || undefined,
      dimensions: dimensions || undefined,
      weight: weight !== '' ? parseFloat(weight) : undefined,
      maxAmbientTemp: maxAmbientTemp !== '' ? parseFloat(maxAmbientTemp) : undefined,
      workingTempRange: workingTempRange || undefined,
      starRating: starRating || undefined,
      capacity: capacity || undefined,
      voltage: voltage || undefined,
      coolingType: coolingType || undefined
    };

    // Clean up undefined keys
    Object.keys(specifications).forEach(key => {
      if (specifications[key] === undefined) {
        delete specifications[key];
      }
    });

    const payload = {
      name,
      category,
      price: priceNum,
      description,
      images,
      threeSixtyImages,
      specifications
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
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={styles.select}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Panel AC">Panel AC</option>
                    <option value="Chiller">Chiller</option>
                    <option value="Air Dryer">Air Dryer</option>
                    <option value="Dehumidifier">Dehumidifier</option>
                    <option value="Fan Tray">Fan Tray</option>
                  </select>
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
                  rows={4}
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
                <p className={styles.helpText}>Provide ordered list of image URLs for 360-degree rotation view.</p>
              </div>

              {/* Technical Specifications Section */}
              <div className={styles.specsWrapper}>
                <div 
                  className={styles.specsToggleHeader} 
                  onClick={() => setShowSpecs(!showSpecs)}
                >
                  <span>Technical Specifications (Optional)</span>
                  <span className={styles.toggleIcon}>{showSpecs ? '▲' : '▼'}</span>
                </div>

                {showSpecs && (
                  <div className={styles.specsGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Cooling Capacity (kW/W)</label>
                      <input
                        type="number"
                        step="any"
                        value={coolingCapacity}
                        onChange={(e) => setCoolingCapacity(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. 1.2"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Power Consumption (W)</label>
                      <input
                        type="number"
                        step="any"
                        value={power}
                        onChange={(e) => setPower(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. 800"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Refrigerant</label>
                      <input
                        type="text"
                        value={refrigerant}
                        onChange={(e) => setRefrigerant(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. R134a"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Dimensions (W x D x H mm)</label>
                      <input
                        type="text"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. 400x300x800"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Weight (kg)</label>
                      <input
                        type="number"
                        step="any"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. 35"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Max Ambient Temp (°C)</label>
                      <input
                        type="number"
                        step="any"
                        value={maxAmbientTemp}
                        onChange={(e) => setMaxAmbientTemp(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. 50"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Working Temp Range</label>
                      <input
                        type="text"
                        value={workingTempRange}
                        onChange={(e) => setWorkingTempRange(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. 20°C - 45°C"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Star Rating</label>
                      <input
                        type="text"
                        value={starRating}
                        onChange={(e) => setStarRating(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. 5 Star"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Capacity</label>
                      <input
                        type="text"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. 1.5 Ton"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Voltage / Phase</label>
                      <input
                        type="text"
                        value={voltage}
                        onChange={(e) => setVoltage(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. 230V AC, 1 Phase"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Cooling Type</label>
                      <input
                        type="text"
                        value={coolingType}
                        onChange={(e) => setCoolingType(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. Air Cooled"
                      />
                    </div>
                  </div>
                )}
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
