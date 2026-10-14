import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Home, Grid, Truck, ShoppingBag } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    setCartOpen,
    setTrackOrderOpen,
    cartCount,
    setSelectedCategory,
  } = useStore();

  const handleHome = () => {
    setSelectedCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategories = () => {
    const catSection = document.getElementById('categories-section');
    if (catSection) {
      catSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="mobile-bottom-nav">
      <button
        className="nav-bottom-item active"
        onClick={handleHome}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <button
        className="nav-bottom-item"
        onClick={handleCategories}
      >
        <Grid size={20} />
        <span>Categories</span>
      </button>

      <button
        className="nav-bottom-item"
        onClick={() => setTrackOrderOpen(true)}
      >
        <Truck size={20} />
        <span>Track</span>
      </button>

      <button
        className="nav-bottom-item"
        onClick={() => setCartOpen(true)}
      >
        <ShoppingBag size={20} />
        <span>Cart</span>
        {cartCount > 0 && <span className="bottom-cart-badge">{cartCount}</span>}
      </button>
    </nav>
  );
};
