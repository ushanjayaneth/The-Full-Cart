import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, ArrowUpDown, XCircle } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { products, selectedCategory, searchQuery, setSearchQuery, setSelectedCategory } = useStore();
  const [sortBy, setSortBy] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Filter products by category, search query, and stock
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSinhala = p.sinhalaName ? p.sinhalaName.toLowerCase().includes(q) : false;
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        if (!matchesName && !matchesSinhala && !matchesCategory && !matchesSku) {
          return false;
        }
      }
      // In-stock filter
      if (inStockOnly && p.stock <= 0) {
        return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery, inStockOnly]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'bestseller':
        return list.sort((a, b) => b.reviewsCount - a.reviewsCount);
      case 'featured':
      default:
        return list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
  }, [filteredProducts, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <section id="product-catalog" className="catalog-section">
      <div className="catalog-header">
        <div className="catalog-title-group">
          <h2>
            {selectedCategory === 'all'
              ? 'Featured Products & Deals'
              : `${selectedCategory.toUpperCase()} Items`}
          </h2>
          <p>
            Showing {sortedProducts.length} items available for Cash on Delivery & WhatsApp order
          </p>
        </div>

        {/* Controls */}
        <div className="catalog-controls">
          {/* In-Stock Toggle */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className="header-btn"
            style={
              inStockOnly
                ? {
                    background: 'rgba(16, 185, 129, 0.15)',
                    borderColor: '#10b981',
                    color: '#34d399',
                  }
                : {}
            }
          >
            <SlidersHorizontal size={15} />
            <span>In-Stock Only</span>
          </button>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={15} style={{ color: 'var(--text-dim)' }} />
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated (Stars)</option>
              <option value="bestseller">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {sortedProducts.length > 0 ? (
        <div className="product-grid">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <XCircle size={48} style={{ color: '#f43f5e', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No products found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '450px', margin: '0 auto 20px' }}>
            We couldn't find any items matching your search "{searchQuery}" or selected category filter.
          </p>
          <button className="btn-primary" onClick={clearAllFilters}>
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
};
