/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useAppContext } from './store';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';
import { Wishlist } from './pages/Wishlist';
import { Profile } from './pages/Profile';
import { SellerDashboard } from './pages/SellerDashboard';
import { BecomeSeller } from './pages/BecomeSeller';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Search } from './pages/Search';
import { About, Support, Terms, Privacy } from './pages/StaticPages';

// Mock Protected Route components
const BuyerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppContext();
  if (!user || user.role === 'guest') return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const SellerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppContext();
  if (!user) return <Navigate to="/login?redirect=/become-seller" replace />;
  if (user.role !== 'seller') return <Navigate to="/become-seller" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <Toaster position="bottom-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<BuyerRoute><Checkout /></BuyerRoute>} />
            <Route path="orders" element={<BuyerRoute><Orders /></BuyerRoute>} />
            <Route path="wishlist" element={<BuyerRoute><Wishlist /></BuyerRoute>} />
            <Route path="profile" element={<BuyerRoute><Profile /></BuyerRoute>} />
            <Route path="become-seller" element={<BecomeSeller />} />
            <Route path="seller/dashboard" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="about" element={<About />} />
            <Route path="support" element={<Support />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            
            {/* Fallback routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

