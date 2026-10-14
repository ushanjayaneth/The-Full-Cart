import React from 'react';
import type { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Star, ShoppingBag, Eye, MessageCircle, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    settings,
    cart,
    addToCart,
    setSelectedProductForModal,
  } = useStore();

  const cartItem = cart.find((i) => i.product.id === product.id);
  const isInCart = Boolean(cartItem);

  const getBadgeClass = (badge?: string) => {
    if (!badge) return '';
    const b = badge.toLowerCase();
    if (b.includes('sale') || b.includes('deal')) return 'badge-sale';
    if (b.includes('new')) return 'badge-new';
    if (b.includes('low') || product.stock <= 5) return 'badge-low-stock';
    if (b.includes('luxury')) return 'badge-luxury';
    return 'badge-deal';
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleDirectWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const productUrl = `${window.location.origin}/?product=${product.id}`;
    const message = encodeURIComponent(
      `Hello ${settings.storeName}! I want to order this product:\n\n*Product:* ${product.name} ${product.sinhalaName ? `(${product.sinhalaName})` : ''}\n*Price:* ${settings.currencySymbol} ${product.price.toLocaleString()}\n*SKU:* ${product.sku}\n*Link:* ${productUrl}\n\nPlease let me know how to proceed with Cash on Delivery.`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="product-card" onClick={() => setSelectedProductForModal(product)}>
      {/* Product Image Area */}
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 2 }}>
          {product.freeDelivery && (
            <span style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              🚚 FREE DELIVERY
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 ? (
            <span className="product-badge badge-low-stock">
              ONLY {product.stock} LEFT!
            </span>
          ) : product.badge ? (
            <span className={`product-badge ${getBadgeClass(product.badge)}`}>
              {product.badge}
            </span>
          ) : null}
        </div>


        {/* Quick View Button */}
        <button
          className="quick-view-overlay-btn"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProductForModal(product);
          }}
          title="Quick preview"
        >
          <Eye size={17} />
        </button>
      </div>

      {/* Product Details Area */}
      <div className="product-details">
        <span className="product-category-text">{product.category}</span>

        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        {product.sinhalaName && (
          <div className="product-sinhala-name">
            {product.sinhalaName}
          </div>
        )}

        {/* Rating and Reviews */}
        <div className="product-rating-row">
          <div className="star-badge">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
          <span className="reviews-count">({product.reviewsCount} reviews)</span>
        </div>

        {/* Pricing Row */}
        <div className="product-price-row">
          <div className="price-tag-wrap">
            <span className="current-price">
              {settings.currencySymbol} {product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price">
                {settings.currencySymbol} {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {discountPercent > 0 && (
            <span className="discount-pill">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Actions Row */}
        <div className="card-actions-row">
          <button
            className="btn-add-cart"
            onClick={handleAddToCart}
            style={
              isInCart
                ? {
                    background: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10b981',
                    color: '#34d399',
                  }
                : {}
            }
          >
            {isInCart ? (
              <>
                <Check size={16} />
                <span>Added ({cartItem?.quantity})</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <button
            className="btn-whatsapp-direct"
            onClick={handleDirectWhatsAppOrder}
            title="Order / Inquire via WhatsApp"
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
