import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Star,
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  Share2,
  Copy,
} from 'lucide-react';

export const ProductModal: React.FC = () => {
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    settings,
    addToCart,
    setCartOpen,
  } = useStore();

  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!selectedProductForModal) return null;
  const product = selectedProductForModal;

  const handleClose = () => {
    setSelectedProductForModal(null);
    setQuantity(1);
    setJustAdded(false);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    handleClose();
    setCartOpen(true);
  };

  const directProductUrl = `${window.location.origin}/?product=${product.id}`;

  const handleWhatsAppOrder = () => {
    const totalItemPrice = product.price * quantity;
    const msg = encodeURIComponent(
      `Hello ${settings.storeName}!\nI want to order / inquire about this item:\n\n` +
      `*Product:* ${product.name} ${product.sinhalaName ? `(${product.sinhalaName})` : ''}\n` +
      `*Quantity:* ${quantity} ${product.unit || 'unit'}\n` +
      `*Price:* ${settings.currencySymbol} ${totalItemPrice.toLocaleString()}\n` +
      `*SKU:* ${product.sku}\n` +
      `*Product Link:* ${directProductUrl}\n\n` +
      `Please confirm availability and arrange Cash on Delivery delivery.`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${msg}`, '_blank');
  };

  const handleShareToWhatsApp = () => {
    const shareText = encodeURIComponent(
      `🛍️ Check out *${product.name}* on ${settings.storeName}!\n\n` +
      `💰 Price: ${settings.currencySymbol} ${product.price.toLocaleString()}\n` +
      `⭐ Rating: ${product.rating} / 5.0\n\n` +
      `👉 Click here to view & order:\n${directProductUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directProductUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid var(--border-glass)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '24px',
            padding: '24px',
          }}
        >
          {/* Product Image */}
          <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '380px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-lg)',
              }}
            />
            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {product.freeDelivery && (
                <span
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    letterSpacing: '0.04em',
                  }}
                >
                  🚚 FREE DELIVERY
                </span>
              )}
              {product.badge && (
                <span
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'white',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {product.badge}
                </span>
              )}
            </div>

          </div>

          {/* Product Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#818cf8', textTransform: 'uppercase', fontWeight: 700 }}>
                {product.category} • SKU: {product.sku}
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', lineHeight: '1.3' }}>
                {product.name}
              </h2>
              {product.sinhalaName && (
                <div style={{ fontSize: '0.88rem', color: '#fbbf24', marginTop: '2px' }}>
                  {product.sinhalaName}
                </div>
              )}
            </div>

            {/* Rating & Stock */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontWeight: 700 }}>{product.rating}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                  ({product.reviewsCount} customer ratings)
                </span>
              </div>

              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: product.stock > 5 ? '#34d399' : '#f87171',
                background: product.stock > 5 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-pill)',
              }}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </div>
            </div>

            {/* Pricing */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                {settings.currencySymbol} {product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span style={{ fontSize: '1rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                    {settings.currencySymbol} {product.originalPrice.toLocaleString()}
                  </span>
                  <span className="discount-tag">-{discountPercent}% OFF</span>
                </>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Quantity:</span>
              <div className="quantity-controls" style={{ margin: 0 }}>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="qty-num" style={{ minWidth: '32px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={14} />
                </button>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Subtotal: {settings.currencySymbol} {(product.price * quantity).toLocaleString()}
              </span>
            </div>

            {/* Actions: Add to Cart & WhatsApp Order */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              <button
                className="btn-primary"
                onClick={handleAddToCart}
                style={justAdded ? { background: '#10b981' } : {}}
              >
                {justAdded ? (
                  <>
                    <Check size={18} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                className="btn-whatsapp-hero"
                onClick={handleWhatsAppOrder}
              >
                <MessageCircle size={18} />
                <span>WhatsApp Order</span>
              </button>
            </div>

            {/* Instant Checkout & Share Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
              <button
                className="btn-secondary"
                onClick={handleBuyNow}
                style={{ justifyContent: 'center' }}
              >
                <span>Instant Checkout</span>
              </button>

              <button
                className="btn-secondary"
                onClick={handleShareToWhatsApp}
                title="Share this product on WhatsApp"
                style={{
                  justifyContent: 'center',
                  background: 'rgba(37, 211, 102, 0.12)',
                  borderColor: 'rgba(37, 211, 102, 0.3)',
                  color: '#4ade80',
                }}
              >
                <Share2 size={15} />
                <span>Share</span>
              </button>

              <button
                className="btn-secondary"
                onClick={handleCopyLink}
                title="Copy Direct Product Link"
                style={{ justifyContent: 'center' }}
              >
                {copiedLink ? <Check size={15} style={{ color: '#34d399' }} /> : <Copy size={15} />}
                <span>{copiedLink ? 'Copied' : 'Link'}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={16} style={{ color: '#38bdf8' }} />
                <span>Islandwide Courier (1-3 Days)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} style={{ color: '#34d399' }} />
                <span>Cash on Delivery Accepted</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
