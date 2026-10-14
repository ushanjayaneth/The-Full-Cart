import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Order, OrderStatus } from '../../types';
import { X, Search, CheckCircle2, Clock, Truck, Package, MessageCircle, AlertCircle } from 'lucide-react';

export const TrackOrderModal: React.FC = () => {
  const {
    trackOrderOpen,
    setTrackOrderOpen,
    findOrder,
    settings,
  } = useStore();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  if (!trackOrderOpen) return null;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;
    const found = findOrder(inputQuery.trim());
    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  const handleQuickDemo = (code: string) => {
    setInputQuery(code);
    const found = findOrder(code);
    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'dispatched': return 3;
      case 'delivered': return 4;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const currentStep = searchedOrder ? getStepIndex(searchedOrder.status) : 1;

  const handleContactWhatsApp = (order: Order) => {
    const text = encodeURIComponent(
      `Hello ${settings.storeName}! I am inquiring about Order *${order.orderNumber}* (Tracking: ${order.trackingNumber}). Please provide an update.`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={() => setTrackOrderOpen(false)}>
      <div
        className="modal-card"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}>
              <Truck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Track Your Order</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Check real-time delivery and courier status
              </p>
            </div>
          </div>
          <button
            onClick={() => setTrackOrderOpen(false)}
            className="btn-close-drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. TFC-8821) or Phone Number"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>
              Track
            </button>
          </form>

          {/* Quick Demo Samples */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <span>Quick Test:</span>
            <button
              onClick={() => handleQuickDemo('TFC-8821')}
              style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#c7d2fe' }}
            >
              TFC-8821 (Dispatched)
            </button>
            <button
              onClick={() => handleQuickDemo('TFC-8822')}
              style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#93c5fd' }}
            >
              TFC-8822 (Processing)
            </button>
            <button
              onClick={() => handleQuickDemo('TFC-8823')}
              style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#86efac' }}
            >
              TFC-8823 (Delivered)
            </button>
          </div>

          {/* Result or Not Found */}
          {hasSearched && !searchedOrder && (
            <div style={{
              textAlign: 'center',
              padding: '30px 20px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
            }}>
              <AlertCircle size={36} style={{ color: '#f87171', margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>No Order Found</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                We couldn't find any order matching "{inputQuery}". Please check your order ID or mobile number.
              </p>
            </div>
          )}

          {searchedOrder && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Status Header Card */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Order {searchedOrder.orderNumber}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>
                    {searchedOrder.customer.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                    Courier Waybill: {searchedOrder.trackingNumber}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`status-badge status-${searchedOrder.status}`}>
                    {searchedOrder.status.toUpperCase()}
                  </span>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(searchedOrder.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Step Progress Tracker */}
              {searchedOrder.status === 'cancelled' ? (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  ⚠️ This order has been cancelled.
                </div>
              ) : (
                <div style={{ padding: '10px 0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
                    
                    {/* Step 1 */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: currentStep >= 1 ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}>
                        {currentStep >= 1 ? <CheckCircle2 size={18} /> : '1'}
                      </div>
                      <span style={{ fontSize: '0.74rem', fontWeight: currentStep >= 1 ? 700 : 500, color: currentStep >= 1 ? '#34d399' : 'var(--text-dim)' }}>
                        Received
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: currentStep >= 2 ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}>
                        {currentStep >= 2 ? <Package size={18} /> : '2'}
                      </div>
                      <span style={{ fontSize: '0.74rem', fontWeight: currentStep >= 2 ? 700 : 500, color: currentStep >= 2 ? '#60a5fa' : 'var(--text-dim)' }}>
                        Processing
                      </span>
                    </div>

                    {/* Step 3 */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: currentStep >= 3 ? '#a855f7' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}>
                        {currentStep >= 3 ? <Truck size={18} /> : '3'}
                      </div>
                      <span style={{ fontSize: '0.74rem', fontWeight: currentStep >= 3 ? 700 : 500, color: currentStep >= 3 ? '#c084fc' : 'var(--text-dim)' }}>
                        Dispatched
                      </span>
                    </div>

                    {/* Step 4 */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: currentStep >= 4 ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}>
                        {currentStep >= 4 ? <CheckCircle2 size={18} /> : '4'}
                      </div>
                      <span style={{ fontSize: '0.74rem', fontWeight: currentStep >= 4 ? 700 : 500, color: currentStep >= 4 ? '#34d399' : 'var(--text-dim)' }}>
                        Delivered
                      </span>
                    </div>

                  </div>
                </div>
              )}

              {/* Order Notes / Courier remarks */}
              {searchedOrder.notes && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Clock size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <span><strong>Status Update:</strong> {searchedOrder.notes}</span>
                </div>
              )}

              {/* Ordered Items summary */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: '#cbd5e1' }}>
                  Ordered Items ({searchedOrder.items.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {searchedOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                      }}
                    >
                      <span>{it.product.name} × {it.quantity}</span>
                      <span style={{ fontWeight: 700 }}>
                        {settings.currencySymbol} {(it.product.price * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                className="btn-whatsapp-hero"
                onClick={() => handleContactWhatsApp(searchedOrder)}
                style={{ justifyContent: 'center' }}
              >
                <MessageCircle size={18} />
                <span>Contact Store on WhatsApp About This Order</span>
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
