import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, MessageCircle, ShoppingBag, ShieldCheck, Truck, Zap, Award, ThumbsUp } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { settings, setTrackOrderOpen } = useStore();

  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent(`Hi ${settings.storeName}! I would like to place an order or check the latest deals.`);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  const scrollToCatalog = () => {
    const element = document.getElementById('product-catalog');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="hero-section">
        {/* Official Brand Banner Graphic */}
        <div style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          marginBottom: '20px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 25px rgba(245, 158, 11, 0.15)',
        }}>
          <img
            src="/banner.png"
            alt="The Full Cart - More for your everyday needs"
            style={{
              width: '100%',
              maxHeight: '340px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(10, 14, 23, 0.95) 0%, rgba(10, 14, 23, 0.6) 60%, transparent 100%)',
            padding: '24px 28px 18px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}>
            <div>
              <span style={{
                background: '#f59e0b',
                color: '#0f172a',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '9999px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                OFFICIAL STORE
              </span>
              <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 800, color: 'white', marginTop: '6px' }}>
                Shop Smarter, Live Better
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#cbd5e1' }}>
                More For Your Everyday Needs • Islandwide Cash on Delivery
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-primary"
                onClick={scrollToCatalog}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#0f172a',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                }}
              >
                <ShoppingBag size={17} />
                <span>Shop Now</span>
              </button>

              <button
                className="btn-whatsapp-hero"
                onClick={handleWhatsAppOrder}
              >
                <MessageCircle size={17} />
                <span>WhatsApp Order</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="hero-banner-card" style={{ padding: '32px 28px' }}>
          <div className="hero-glow-blob" />

          {/* Left Hero Content */}
          <div className="hero-content">
            <div className="hero-tag" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.12)' }}>
              <Sparkles size={14} />
              <span>ISLANDWIDE DELIVERY & CASH ON DELIVERY (COD)</span>
            </div>

            <h1 className="hero-title">
              Instant Shopping for <br />
              <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #ffffff, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Mobile, Tablet & PC
              </span>
            </h1>

            <p className="hero-subtitle">
              Browse top electronics, fashion, home essentials, groceries, and beauty.
              Enjoy <strong>1-Click WhatsApp orders</strong>, fast courier delivery to your doorstep, and <strong>live order tracking</strong>!
            </p>

            <div className="hero-action-buttons">
              <button
                className="btn-primary"
                onClick={scrollToCatalog}
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f172a', fontWeight: 800 }}
              >
                <ShoppingBag size={18} />
                <span>Explore All Deals</span>
              </button>

              <button className="btn-secondary" onClick={() => setTrackOrderOpen(true)}>
                <Truck size={18} />
                <span>Track My Order</span>
              </button>
            </div>
          </div>

          {/* Right Highlights & Metrics from the Official Branding */}
          <div className="hero-stats-box">
            <div className="stat-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
                <Award size={20} />
                <span className="stat-num" style={{ color: '#f59e0b' }}>100%</span>
              </div>
              <span className="stat-label">Quality Products</span>
            </div>

            <div className="stat-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                <ShieldCheck size={20} />
                <span className="stat-num" style={{ color: '#34d399' }}>Verified</span>
              </div>
              <span className="stat-label">Trusted Seller Guarantee</span>
            </div>

            <div className="stat-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                <Truck size={20} />
                <span className="stat-num" style={{ color: '#38bdf8' }}>1-3 Days</span>
              </div>
              <span className="stat-label">Fast Islandwide Courier</span>
            </div>

            <div className="stat-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7' }}>
                <ThumbsUp size={20} />
                <span className="stat-num" style={{ color: '#c084fc' }}>Great Deals</span>
              </div>
              <span className="stat-label">Use Code: FULLCART10</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Perks Strip */}
      <div className="features-strip">
        <div className="perk-card">
          <div className="perk-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Truck size={22} />
          </div>
          <div className="perk-info">
            <h4>Free Islandwide Shipping</h4>
            <p>On all orders above Rs. {settings.freeDeliveryThreshold.toLocaleString()}</p>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <ShieldCheck size={22} />
          </div>
          <div className="perk-info">
            <h4>Cash On Delivery</h4>
            <p>Inspect your items and pay at your doorstep</p>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrap" style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#4ade80' }}>
            <MessageCircle size={22} />
          </div>
          <div className="perk-info">
            <h4>1-Click WhatsApp Order</h4>
            <p>Send order details straight to our WhatsApp team</p>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Zap size={22} />
          </div>
          <div className="perk-info">
            <h4>Live Order Tracking</h4>
            <p>Instant status from order to courier delivery</p>
          </div>
        </div>
      </div>
    </>
  );
};
