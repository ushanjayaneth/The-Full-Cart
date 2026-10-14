import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../data/initialData';
import { Sparkles, Smartphone, Shirt, Home, Apple, Heart } from 'lucide-react';

export const CategoryBar: React.FC = () => {
  const { selectedCategory, setSelectedCategory, products } = useStore();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles size={16} />;
      case 'Smartphone':
        return <Smartphone size={16} />;
      case 'Shirt':
        return <Shirt size={16} />;
      case 'Home':
        return <Home size={16} />;
      case 'Apple':
        return <Apple size={16} />;
      case 'Heart':
        return <Heart size={16} />;
      default:
        return <Sparkles size={16} />;
    }
  };

  const getProductCount = (catId: string) => {
    if (catId === 'all') return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <section id="categories-section" className="category-bar-section">
      <div className="category-bar-wrapper">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = getProductCount(cat.id);

          return (
            <button
              key={cat.id}
              className={`category-pill ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {getIcon(cat.icon)}
              <span>{cat.name}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  marginLeft: '2px',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
