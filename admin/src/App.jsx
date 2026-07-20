import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationPopup from './components/NotificationPopup';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import InquiryList from './pages/InquiryList';
import InquiryDetail from './pages/InquiryDetail';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Loading sessions...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <NotificationPopup />
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inquiries"
              element={
                <ProtectedRoute>
                  <InquiryList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inquiries/:id"
              element={
                <ProtectedRoute>
                  <InquiryDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/new"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/edit/:id"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
