import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useSettings } from './context/SettingsContext';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Contact from './pages/Contact';
import MIA from './pages/MIA';

import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import ProtectedRoute from './admin/ProtectedRoute';
import Dashboard from './admin/Dashboard';
import Products from './admin/Products';
import ProductForm from './admin/ProductForm';
import Orders from './admin/Orders';
import FeedbackLog from './admin/FeedbackLog';
import Visitors from './admin/Visitors';
import AdminSettings from './admin/AdminSettings';
import AdminSlides from './admin/AdminSlides';
import ChangePassword from './admin/ChangePassword';

const PublicLayout = ({ settings, children }) => (
  <>
    <Header settings={settings} />
    {children}
    <Footer settings={settings} />
  </>
);

export default function App() {
  const { settings, refresh } = useSettings();
  const location = useLocation();

  React.useEffect(() => {
    refresh();
  }, [location.pathname, location.search, refresh]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout settings={settings}>
            <Home settings={settings} />
          </PublicLayout>
        }
      />
      <Route
        path="/shop"
        element={
          <PublicLayout settings={settings}>
            <Shop />
          </PublicLayout>
        }
      />
      <Route
        path="/product/:id"
        element={
          <PublicLayout settings={settings}>
            <ProductDetail />
          </PublicLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <PublicLayout settings={settings}>
            <Cart settings={settings} />
          </PublicLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <PublicLayout settings={settings}>
            <Checkout settings={settings} />
          </PublicLayout>
        }
      />
      <Route
        path="/order/:id"
        element={
          <PublicLayout settings={settings}>
            <OrderConfirmation settings={settings} />
          </PublicLayout>
        }
      />
<Route
        path="/contact"
          element={
            <PublicLayout settings={settings}>
              <Contact settings={settings} />
            </PublicLayout>
          }
        />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="orders" element={<Orders />} />
        <Route path="feedback" element={<FeedbackLog />} />
        <Route path="visitors" element={<Visitors />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="slides" element={<AdminSlides />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
      <Route
        path="*"
        element={
          <PublicLayout settings={settings}>
            <MIA />
          </PublicLayout>
        }
      />
    </Routes>
  );
}