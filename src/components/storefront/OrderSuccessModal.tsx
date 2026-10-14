import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, MessageCircle, Printer, Truck, ArrowRight } from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const {
    lastPlacedOrder,
    setLastPlacedOrder,
    settings,
    setTrackOrderOpen,
  } = useStore();

  if (!lastPlacedOrder) return null;
  const order = lastPlacedOrder;

  const handleClose = () => {
    setLastPlacedOrder(null);
  };

  const handleTrack = () => {
    setLastPlacedOrder(null);
    setTrackOrderOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppChat = () => {
    const text = encodeURIComponent(
      `Hello ${settings.storeName}! I just placed order *${order.orderNumber}*. Could you please update me on delivery status?`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-card printable-invoice"
        style={{ maxWidth: '640px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Success Checkmark */}
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid #10b981',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
          }}>
            <CheckCircle2 size={40} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
              Order Placed Successfully!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Thank you for shopping with {settings.storeName}. Your order has been registered.
            </p>
          </div>

          {/* Order Details Highlight */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            textAlign: 'left',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Order Number
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a5b4fc', fontFamily: 'var(--font-heading)' }}>
                {order.orderNumber}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Payment Method
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: '#34d399' }}>
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'WhatsApp Order'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Payable
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-heading)' }}>
                {settings.currencySymbol} {order.total.toLocaleString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Tracking Code
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#38bdf8' }}>
                {order.trackingNumber}
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'left',
            fontSize: '0.84rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <div style={{ fontWeight: 700, color: '#cbd5e1' }}>
              Deliver To: {order.customer.name} ({order.customer.phone})
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              {order.customer.address}, {order.customer.city}, {order.customer.district}
            </div>
            {order.customer.notes && (
              <div style={{ color: 'var(--accent-amber)', fontSize: '0.78rem' }}>
                Note: {order.customer.notes}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button className="btn-secondary" onClick={handleTrack}>
                <Truck size={16} />
                <span>Track Order</span>
              </button>

              <button className="btn-whatsapp-hero" onClick={handleWhatsAppChat}>
                <MessageCircle size={16} />
                <span>Chat on WhatsApp</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button className="btn-secondary" onClick={handlePrint}>
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>

              <button className="btn-primary" onClick={handleClose}>
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
