import React, { useEffect, useRef } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
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
import { PwaInstallBanner } from './components/common/PwaInstallBanner';

const CustomerStorefrontLayout: React.FC = () => {
  const { products, setSelectedProductForModal } = useStore();
  const handledProductLinkRef = useRef<string | null>(null);

  // Listen to ?product=<id> query parameter and auto-open matching product modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetProductId = params.get('product') || params.get('item') || params.get('id');
    if (targetProductId && products.length > 0 && handledProductLinkRef.current !== targetProductId) {
      const matched = products.find(
        (p) =>
          p.id === targetProductId ||
          p.sku.toLowerCase() === targetProductId.toLowerCase()
      );
      if (matched) {
        // Stock updates after checkout must not reopen a product modal from a shared link.
        handledProductLinkRef.current = targetProductId;
        setSelectedProductForModal(matched);
      }
    }
  }, [products, setSelectedProductForModal]);

  return (
    <div className="app-container">
      {/* PWA Floating Install Prompt */}
      <PwaInstallBanner />

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
