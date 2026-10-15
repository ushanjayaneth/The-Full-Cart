import React from 'react';
import type { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import { X, Printer } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { settings } = useStore();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card printable-invoice admin-invoice-modal"
        style={{ maxWidth: '780px', background: '#ffffff', color: '#0f172a' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls Bar */}
        <div
          className="no-print admin-invoice-controls"
          style={{
            padding: '14px 24px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>
            Official Delivery Invoice & Receipt
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: '#4f46e5',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.84rem',
              }}
            >
              <Printer size={16} />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '8px',
                background: '#e2e8f0',
                color: '#475569',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="admin-invoice-sheet" style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header row */}
          <div className="admin-invoice-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <img
                  src="/logo.png"
                  alt="The Full Cart"
                  style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #f59e0b' }}
                />
                <div>
                  <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>{settings.storeName}</h1>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>More For Your Everyday Needs</span>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '340px', lineHeight: '1.4' }}>
                {settings.address}<br />
                Phone: {settings.supportPhone} | WhatsApp: +{settings.whatsappNumber}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4f46e5' }}>
                INVOICE / COD SLIP
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                #{order.orderNumber}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Waybill: <strong>{order.trackingNumber}</strong>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Box */}
          <div className="admin-invoice-delivery-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                Deliver To (Recipient)
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                {order.customer.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px' }}>
                {order.customer.address},<br />
                {order.customer.city}, {order.customer.district}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                Phone: {order.customer.phone} {order.customer.whatsapp ? `(WA: ${order.customer.whatsapp})` : ''}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                Payment & Dispatch Details
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                Method: <span style={{ color: '#059669', textTransform: 'uppercase' }}>{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'WhatsApp Direct'}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px' }}>
                Status: <strong style={{ textTransform: 'capitalize' }}>{order.status}</strong>
              </div>
              {order.customer.notes && (
                <div style={{ fontSize: '0.82rem', color: '#d97706', marginTop: '6px', background: '#fef3c7', padding: '4px 8px', borderRadius: '4px' }}>
                  Note: {order.customer.notes}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="admin-invoice-items-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '8px', color: '#475569' }}>#</th>
                <th style={{ padding: '8px', color: '#475569' }}>Item Description</th>
                <th style={{ padding: '8px', color: '#475569', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px', color: '#475569', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '8px', color: '#475569', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 8px', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>
                    {it.product.name}
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>SKU: {it.product.sku}</div>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{it.quantity}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                    {settings.currencySymbol} {it.product.price.toLocaleString()}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700 }}>
                    {settings.currencySymbol} {(it.product.price * it.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="admin-invoice-totals" style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal:</span>
                <span>{settings.currencySymbol} {order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Discount:</span>
                  <span>-{settings.currencySymbol} {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Delivery:</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `${settings.currencySymbol} ${order.deliveryFee.toLocaleString()}`}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '2px solid #0f172a',
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#0f172a',
              }}>
                <span>Total Amount Due:</span>
                <span>{settings.currencySymbol} {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer & Barcode Simulation */}
          <div className="admin-invoice-footer" style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Thank you for your order! For queries, contact {settings.supportPhone}.<br />
                Courier Delivery instructions: Collect Cash on Delivery upon handover.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1rem',
                fontFamily: 'monospace',
                letterSpacing: '4px',
                background: '#f1f5f9',
                padding: '4px 10px',
                borderRadius: '4px',
                fontWeight: 700,
              }}>
                * {order.orderNumber} *
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b' }}>COURIER SCAN CODE</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
