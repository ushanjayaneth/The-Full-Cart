import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, MessageCircle, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cartOpen,
    setCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    deliveryFee,
    promoDiscount,
    cartTotal,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    settings,
    setCheckoutOpen,
  } = useStore();

  const [couponInput, setCouponInput] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (!cartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyPromoCode(couponInput);
    if (res.success) {
      setCouponFeedback({ msg: res.message, type: 'success' });
      setCouponInput('');
    } else {
      setCouponFeedback({ msg: res.message, type: 'error' });
    }
    setTimeout(() => {
      setCouponFeedback(null);
    }, 3500);
  };

  const handleProceedCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleWhatsAppCartOrder = () => {
    if (cart.length === 0) return;
    const itemsList = cart
      .map(
        (i, idx) =>
          `${idx + 1}. *${i.product.name}* x ${i.quantity} = ${settings.currencySymbol} ${(i.product.price * i.quantity).toLocaleString()}`
      )
      .join('\n');

    const message = encodeURIComponent(
      `Hello ${settings.storeName}! I want to place this order directly via WhatsApp:\n\n*Items in Cart:*\n${itemsList}\n\n*Subtotal:* ${settings.currencySymbol} ${cartSubtotal.toLocaleString()}\n*Delivery Fee:* ${settings.currencySymbol} ${deliveryFee.toLocaleString()}\n${promoDiscount > 0 ? `*Promo Discount:* -${settings.currencySymbol} ${promoDiscount.toLocaleString()}\n` : ''}*Total Amount:* ${settings.currencySymbol} ${cartTotal.toLocaleString()}\n\nPlease confirm availability and let me know the delivery details for Cash on Delivery.`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
  };

  const freeDeliveryProgress = Math.min(100, (cartSubtotal / settings.freeDeliveryThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, settings.freeDeliveryThreshold - cartSubtotal);

  return (
    <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <h3>
            Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h3>
          <button className="btn-close-drawer" onClick={() => setCartOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{ padding: '12px 20px', background: 'rgba(99, 102, 241, 0.08)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '6px' }}>
            <span>
              {remainingForFreeDelivery === 0 ? (
                <strong style={{ color: '#34d399' }}>🎉 You unlocked FREE Delivery!</strong>
              ) : (
                <>Add <strong>{settings.currencySymbol} {remainingForFreeDelivery.toLocaleString()}</strong> more for FREE delivery</>
              )}
            </span>
            <span style={{ fontWeight: 700, color: '#818cf8' }}>{Math.round(freeDeliveryProgress)}%</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${freeDeliveryProgress}%`,
                height: '100%',
                background: remainingForFreeDelivery === 0 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #38bdf8)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Body / Items */}
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', padding: '40px 10px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--text-dim)',
              }}>
                <Tag size={28} />
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Your Cart is Empty</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Looks like you haven't added any products yet.
              </p>
              <button
                className="btn-primary"
                onClick={() => setCartOpen(false)}
                style={{ margin: '0 auto' }}
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="cart-item-card">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="cart-item-thumb"
                />

                <div className="cart-item-info">
                  <h4>{item.product.name}</h4>
                  <div className="cart-item-price">
                    {settings.currencySymbol} {item.product.price.toLocaleString()}
                  </div>

                  <div className="quantity-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qty-num">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    style={{ color: '#f87171', padding: '4px' }}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                    {settings.currencySymbol} {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Voucher and Totals */}
        {cart.length > 0 && (
          <div className="drawer-footer">
            {/* Voucher Code Form */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Promo Code (e.g. FULLCART10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '0.82rem' }}
              />
              <button
                type="submit"
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              >
                Apply
              </button>
            </form>

            {/* Coupon Feedback */}
            {couponFeedback && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                color: couponFeedback.type === 'success' ? '#34d399' : '#f87171',
              }}>
                {couponFeedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{couponFeedback.msg}</span>
              </div>
            )}

            {appliedPromo && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
              }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>
                  Active Coupon: {appliedPromo} (-{settings.promoDiscountPercent}%)
                </span>
                <button
                  onClick={removePromoCode}
                  style={{ color: '#f87171', fontSize: '0.74rem', textDecoration: 'underline' }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Cost Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>{settings.currencySymbol} {cartSubtotal.toLocaleString()}</span>
              </div>

              {promoDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                  <span>Discount</span>
                  <span>-{settings.currencySymbol} {promoDiscount.toLocaleString()}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Islandwide Delivery</span>
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
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'white',
              }}>
                <span>Total Amount</span>
                <span style={{ color: '#818cf8', fontFamily: 'var(--font-heading)' }}>
                  {settings.currencySymbol} {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn-primary" onClick={handleProceedCheckout} style={{ justifyContent: 'center' }}>
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="btn-whatsapp-hero"
                onClick={handleWhatsAppCartOrder}
                style={{ justifyContent: 'center' }}
              >
                <MessageCircle size={18} />
                <span>1-Click Order via WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
