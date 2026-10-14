import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Search, X, Truck } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    cartCount,
    searchQuery,
    setSearchQuery,
    setCartOpen,
    setTrackOrderOpen,
    setSelectedCategory,
  } = useStore();

  const handleLogoClick = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Banner Notice */}
      {settings.bannerNotice && (
        <div className="top-notice-bar">
          <span>{settings.bannerNotice}</span>
        </div>
      )}

      {/* Main Sticky Header */}
      <header className="site-header">
        <div className="header-inner">
          {/* Logo & Brand */}
          <div className="brand-logo" onClick={handleLogoClick}>
            <img
              src="/app-icon.png"
              alt="The Full Cart Icon"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '11px',
                objectFit: 'cover',
                border: '1.5px solid rgba(245, 158, 11, 0.6)',
                boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
              }}
            />

            <div className="brand-text">
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                The <span style={{ color: '#f59e0b', WebkitTextFillColor: '#f59e0b' }}>Full Cart</span>
              </h1>
              <span>More For Your Everyday Needs</span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon-left" />
              <input
                type="text"
                placeholder="Search products, phones, clothes, groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="header-actions">
            {/* Track Order Button */}
            <button
              className="header-btn"
              onClick={() => setTrackOrderOpen(true)}
              title="Track your order status"
            >
              <Truck size={17} style={{ color: '#38bdf8' }} />
              <span className="hidden-sm" style={{ display: 'none' }}>Track</span>
              <span>Track Order</span>
            </button>

            {/* Cart Trigger */}
            <button
              className="cart-header-btn"
              onClick={() => setCartOpen(true)}
              title="Open Shopping Cart"
            >
              <ShoppingBag size={18} />
              <span style={{ fontWeight: 700, marginLeft: 4 }}>Cart</span>
              {cartCount > 0 && <span className="cart-badge-pill">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className="mobile-search-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon-left" />
            <input
              type="text"
              placeholder="Search products or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
