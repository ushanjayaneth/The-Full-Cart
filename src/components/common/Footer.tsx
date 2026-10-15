import React from 'react';
import { useStore } from '../../context/StoreContext';
import { MessageCircle, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setTrackOrderOpen, setSelectedCategory } = useStore();

  return (
    <footer style={{
      background: 'rgba(10, 14, 23, 0.95)',
      borderTop: '1px solid var(--border-subtle)',
      marginTop: 'auto',
      padding: '50px 20px 30px',
    }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Top Trust Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          paddingBottom: '30px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Islandwide Delivery</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fast 1-3 business days islandwide</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Cash on Delivery (COD)</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pay safely when product arrives</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(37, 211, 102, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4ade80',
            }}>
              <MessageCircle size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Order Confirmation</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Send your confirmed order and product link via WhatsApp</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
            }}>
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Quality Guarantee</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>100% verified authentic goods</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '30px',
        }}>
          {/* Col 1: Store Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <img
                src="/logo.png"
                alt="The Full Cart"
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #f59e0b' }}
              />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{settings.storeName}</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              Shop Smarter, Live Better — More For Your Everyday Needs. Easy shopping on Mobile, Tablet & Laptop with islandwide Cash on Delivery.
            </p>
            <a
              href={`tel:${settings.supportPhone.replace(/\s+/g, '')}`}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Phone size={16} />
              <span>Call Support</span>
            </a>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: '#ffffff' }}>Shop Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('electronics')}>📱 Electronics & Gadgets</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('fashion')}>👗 Fashion & Apparel</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('home')}>🏠 Home & Kitchen Appliances</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('groceries')}>🌿 Pure Ceylon Groceries</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('beauty')}>💄 Beauty & Personal Care</span>
            </div>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: '#ffffff' }}>Customer Care</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => setTrackOrderOpen(true)}>🚚 Live Order Tracking</span>
              <span>💵 Cash on Delivery Information</span>
              <span>💬 Post-order WhatsApp confirmation</span>
              <span>🛡️ Warranty & Return Policy</span>
              <span>📦 Courier Delivery Partner Updates</span>
            </div>
          </div>

          {/* Col 4: Contact Info */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: '#ffffff' }}>Contact & Location</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MapPin size={17} style={{ color: '#818cf8', flexShrink: 0, marginTop: '3px' }} />
                <span>{settings.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={17} style={{ color: '#34d399', flexShrink: 0 }} />
                <span>{settings.supportPhone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={17} style={{ color: '#38bdf8', flexShrink: 0 }} />
                <span>{settings.supportEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: 'var(--text-dim)',
        }}>
          <div>
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved. Designed for Mobile, Tablet & Desktop.
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
            <a
              href="/admin"
              style={{
                color: 'var(--text-dim)',
                opacity: 0.7,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.74rem',
              }}
              title="Staff & Management Portal"
            >
              🔒 Staff Portal
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
