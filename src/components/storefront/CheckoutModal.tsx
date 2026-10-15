import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { CustomerInfo, PaymentMethod } from '../../types';
import { X, ShieldCheck, MessageCircle, Banknote, Truck } from 'lucide-react';

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

const EMPTY_CUSTOMER_INFO: CustomerInfo = {
  name: '',
  phone: '',
  whatsapp: '',
  address: '',
  city: '',
  district: 'Colombo',
  postalCode: '',
  notes: '',
};

export const CheckoutModal: React.FC = () => {
  const {
    checkoutOpen,
    setCheckoutOpen,
    cart,
    cartSubtotal,
    deliveryFee,
    promoDiscount,
    cartTotal,
    settings,
    placeOrder,
    checkoutSourceProductId,
    setCheckoutSourceProductId,
  } = useStore();

  const [formData, setFormData] = useState<CustomerInfo>(EMPTY_CUSTOMER_INFO);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!checkoutOpen) return null;

  const handleClose = () => {
    if (submitting) return;
    setCheckoutOpen(false);
    setCheckoutSourceProductId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Auto-mirror whatsapp to phone if whatsapp is empty
      ...(name === 'phone' && !prev.whatsapp ? { whatsapp: value } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 9) {
      setErrorMessage('Please enter a valid phone number (at least 9-10 digits).');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Please enter your delivery street address.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Please enter your city/town.');
      return;
    }

    setSubmitting(true);

    try {
      // Create the order in the system
      await placeOrder(
        {
          ...formData,
          whatsapp: formData.whatsapp || formData.phone,
        },
        paymentMethod,
        checkoutSourceProductId,
      );
      setFormData(EMPTY_CUSTOMER_INFO);
      setPaymentMethod('cod');
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-card checkout-modal-card"
        style={{ maxWidth: '680px' }}
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
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Complete Your Order</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Enter your delivery details, then confirm your order securely.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="btn-close-drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {errorMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
            }}>
              {errorMessage}
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '12px' }}>
              1. Delivery Information (ලැබිය යුතු ලිපිනය)
            </h4>

            <div className="checkout-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="0771234567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Number (Optional)</label>
                <input
                  type="tel"
                  name="whatsapp"
                  placeholder="0771234567"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Delivery Street Address *</label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="House No, Street name / Landmark"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City / Town *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Maharagama, Kandy"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">District *</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Special Delivery Note (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="e.g. Call before delivery, deliver in the evening"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '12px' }}>
              2. Select Payment Method (ගෙවීමේ ක්‍රමය)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              
              {/* COD Option */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'cod' ? '2px solid #6366f1' : '1px solid var(--border-subtle)',
                  background: paymentMethod === 'cod' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem' }}>
                    <Banknote size={16} style={{ color: '#10b981' }} />
                    <span>Cash on Delivery</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Pay cash when courier delivers the items
                  </div>
                </div>
              </label>

              {/* WhatsApp Option */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'whatsapp' ? '2px solid #22c55e' : '1px solid var(--border-subtle)',
                  background: paymentMethod === 'whatsapp' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="whatsapp"
                  checked={paymentMethod === 'whatsapp'}
                  onChange={() => setPaymentMethod('whatsapp')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem' }}>
                    <MessageCircle size={16} style={{ color: '#22c55e' }} />
                    <span>WhatsApp Order</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Confirm first; send the order and product link from the next screen
                  </div>
                </div>
              </label>

            </div>
          </div>

          {/* Order Summary Recap */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.85rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              <span>{settings.currencySymbol} {cartSubtotal.toLocaleString()}</span>
            </div>

            {promoDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                <span>Promo Discount</span>
                <span>-{settings.currencySymbol} {promoDiscount.toLocaleString()}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery Fee</span>
              <span>
                {deliveryFee === 0 ? (
                  <strong style={{ color: '#34d399' }}>FREE</strong>
                ) : (
                  `${settings.currencySymbol} ${deliveryFee.toLocaleString()}`
                )}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'white',
            }}>
              <span>Total Payable Amount</span>
              <span style={{ color: '#818cf8', fontFamily: 'var(--font-heading)' }}>
                {settings.currencySymbol} {cartTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || cart.length === 0}
              style={{ padding: '14px', fontSize: '1rem', justifyContent: 'center' }}
            >
              <ShieldCheck size={20} />
              <span>
                {submitting ? 'Confirming Order...' : 'Confirm Order'}
              </span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.76rem',
              color: 'var(--text-dim)',
            }}>
              <Truck size={14} />
              <span>We will contact you via WhatsApp / Phone to confirm delivery</span>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
