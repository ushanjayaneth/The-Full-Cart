import React from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { Footer } from './components/common/Footer';
import { HeroBanner } from './components/storefront/HeroBanner';
import { CategoryBar } from './components/storefront/CategoryBar';
import { ProductGrid } from './components/storefront/ProductGrid';
import { ProductModal } from './components/storefront/ProductModal';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CheckoutModal } from './components/storefront/CheckoutModal';
import { OrderSuccessModal } from './components/storefront/OrderSuccessModal';
import { TrackOrderModal } from './components/storefront/TrackOrderModal';

const CustomerStorefrontLayout: React.FC = () => {
  return (
    <div className="app-container">
      {/* Header Navigation */}
      <Header />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <HeroBanner />
        <CategoryBar />
        <ProductGrid />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Modals & Drawers */}
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <TrackOrderModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <CustomerStorefrontLayout />
    </StoreProvider>
  );
}
