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
  const whatsappNumber = settings.whatsappNumber.replace(/\D/g, '');
  const linkedItems = order.checkoutProductId
    ? order.items.filter((item) => item.product.id === order.checkoutProductId)
    : order.items;
  const itemsToLink = linkedItems.length > 0 ? linkedItems : order.items;

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

  const handleWhatsAppSendOrder = () => {
    if (!whatsappNumber) return;

    const itemsList = order.items
      .map((item, idx) => {
        const sinhalaText = item.product.sinhalaName ? ` (${item.product.sinhalaName})` : '';
        return (
          `${idx + 1}. *${item.product.name}*${sinhalaText}\n` +
          `   - Qty: ${item.quantity}\n` +
          `   - Price: ${settings.currencySymbol} ${(item.product.price * item.quantity).toLocaleString()}`
        );
      })
      .join('\n\n');
    const productLinks = itemsToLink
      .map((item) => {
        const productUrl = new URL('/', window.location.origin);
        productUrl.searchParams.set('product', item.product.id);
        return `- ${item.product.name}: ${productUrl.toString()}`;
      })
      .join('\n');
    const productLinkTitle = order.checkoutProductId ? 'Selected Product Link' : 'Product Links';

    const message = encodeURIComponent(
      `*ORDER CONFIRMATION - #${order.orderNumber}*\n\n` +
      `Hello ${settings.storeName}! I just placed and confirmed this order:\n\n` +
      `*Ordered Items:*\n${itemsList}\n\n` +
      `*${productLinkTitle}:*\n${productLinks}\n\n` +
      `*Total Amount to Pay (COD):* ${settings.currencySymbol} ${order.total.toLocaleString()}\n` +
      `*Tracking Number:* ${order.trackingNumber}\n\n` +
      `*Customer Delivery Details:*\n` +
      `- *Name:* ${order.customer.name}\n` +
      `- *Phone:* ${order.customer.phone}\n` +
      `- *Address:* ${order.customer.address}, ${order.customer.city}, ${order.customer.district}\n` +
      `${order.customer.notes ? `- *Order Note:* ${order.customer.notes}\n` : ''}\n` +
      `Please confirm receipt and dispatch my delivery. Thank you!`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-card printable-invoice order-success-modal"
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
            <div style={{ marginTop: '10px', color: '#86efac', fontSize: '0.8rem', fontWeight: 700 }}>
              Your cart has been cleared and is ready for your next order.
            </div>
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

          {/* Ordered Products Recap */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Items in this Order ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.items.map((it, idx) => (
                <div className="order-success-product-row" key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '0.84rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 180px' }}>
                    <img
                      src={it.product.image}
                      alt={it.product.name}
                      style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'white', overflowWrap: 'anywhere' }}>{it.product.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        Qty: {it.quantity} × {settings.currencySymbol} {it.product.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#a5b4fc', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                    {settings.currencySymbol} {(it.product.price * it.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated WhatsApp Order Confirmation Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
            border: '1.5px solid rgba(34, 197, 94, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.86rem', color: '#86efac', fontWeight: 600 }}>
              Order placed! Send the details and {order.checkoutProductId ? 'selected product link' : 'product links'} to WhatsApp to speed up dispatch:
            </div>

            <button
              className="btn-whatsapp-hero"
              onClick={handleWhatsAppSendOrder}
              disabled={!whatsappNumber}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.98rem',
                fontWeight: 800,
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(34, 197, 94, 0.35)',
              }}
            >
              <MessageCircle size={20} />
              <span>Send Order & Product Link via WhatsApp</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="no-print order-success-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button className="btn-secondary" onClick={handleTrack}>
                <Truck size={16} />
                <span>Track Order</span>
              </button>

              <button className="btn-secondary" onClick={handlePrint}>
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
            </div>

            <button className="btn-primary" onClick={handleClose} style={{ justifyContent: 'center' }}>
              <span>Continue Shopping</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
