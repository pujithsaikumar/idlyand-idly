import React, { useState } from 'react';
import { Plus, Minus, Star, Flame, Sparkles, Check, Info } from 'lucide-react';
import { MENU_CATEGORIES } from '../data/menuData';
import { useCart } from '../context/CartContext';

export default function MenuSection() {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0].id);

  const getItemQuantity = (id) => {
    const item = cartItems.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  const getBadgeStyle = (badgeType) => {
    switch (badgeType) {
      case 'bestseller':
        return { backgroundColor: '#FFF3E0', color: '#E64A19', border: '1px solid #FFE0B2' };
      case 'spicy':
        return { backgroundColor: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2' };
      case 'healthy':
        return { backgroundColor: '#E8F5E9', color: '#2E7D32', border: '1px solid #C8E6C9' };
      case 'special':
        return { backgroundColor: '#FFF8E1', color: '#F57F17', border: '1px solid #FFECB3' };
      default:
        return { backgroundColor: '#F3ECE6', color: '#4E342E', border: '1px solid #EDE4DC' };
    }
  };

  return (
    <section id="menu" style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '40px 16px'
    }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={{
          display: 'inline-block',
          fontSize: '0.8rem',
          fontWeight: 800,
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '6px'
        }}>
          Handcrafted Fresh Daily
        </span>
        <h2 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          letterSpacing: '-0.02em'
        }}>
          Explore Our Signature Menu
        </h2>
        <p style={{
          marginTop: '8px',
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          maxWidth: '520px',
          margin: '8px auto 0'
        }}>
          All items are made fresh upon order. Includes signature chutneys &amp; sambar. Packaging: ₹5/tiffin, ₹10/biryani.
        </p>
      </div>

      {/* Sticky Luxury Category Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '36px',
        position: 'sticky',
        top: '76px',
        zIndex: 30,
        padding: '8px 0',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'inline-flex',
          backgroundColor: '#FFFFFF',
          padding: '6px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-soft)',
          gap: '6px'
        }}>
          {MENU_CATEGORIES.map(category => {
            const isActive = activeCategory === category.id;
            return (
              <a
                key={category.id}
                href={`#cat-${category.id}`}
                onClick={(e) => {
                  setActiveCategory(category.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-main)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  boxShadow: isActive ? '0 4px 12px rgba(230, 74, 25, 0.32)' : 'none',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{category.icon}</span>
                <span>{category.title}</span>
                <span style={{
                  fontSize: '0.725rem',
                  opacity: isActive ? 0.85 : 0.6,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--secondary)',
                  padding: '1px 6px',
                  borderRadius: '999px'
                }}>
                  {category.items.length}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Categories Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {MENU_CATEGORIES.map(category => (
          <div key={category.id} id={`cat-${category.id}`}>
            {/* Category Subheader */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '18px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>{category.icon}</span>
                  <span>{category.title}</span>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {category.subtitle}
                </p>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {category.items.length} dishes
              </span>
            </div>

            {/* Dishes Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '16px'
            }}>
              {category.items.map(item => {
                const qty = getItemQuantity(item.id);
                const badgeStyle = getBadgeStyle(item.badgeType);

                return (
                  <div
                    key={item.id}
                    className="card-lift"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 'var(--radius-card)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--card-bg)',
                      padding: '18px',
                      boxShadow: 'var(--shadow-soft)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div>
                      {/* Card Top Row: Badge & Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        {item.badge ? (
                          <span style={{
                            ...badgeStyle,
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px'
                          }}>
                            {item.badge}
                          </span>
                        ) : <span />}

                        {item.rating && (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#E65100',
                            backgroundColor: '#FFF8EE',
                            padding: '2px 7px',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid #FFE0B2'
                          }}>
                            <Star size={12} fill="#E65100" />
                            {item.rating}
                          </span>
                        )}
                      </div>

                      {/* Item Title & Emoji */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '14px',
                          backgroundColor: 'var(--secondary)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '1.5rem',
                          flexShrink: 0
                        }}>
                          {item.emoji}
                        </div>

                        <div>
                          <h4 style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            lineHeight: 1.3
                          }}>
                            {item.name}
                          </h4>
                          <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontWeight: 500
                          }}>
                            {item.portion}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {item.desc && (
                        <p style={{
                          fontSize: '0.825rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.45,
                          marginBottom: '14px'
                        }}>
                          {item.desc}
                        </p>
                      )}
                    </div>

                    {/* Card Footer: Price & Add Controls */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px dashed #EDE4DC',
                      paddingTop: '12px',
                      marginTop: '4px'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Price
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          ₹{item.price}
                        </span>
                      </div>

                      {/* Quantity Action */}
                      <div>
                        {qty === 0 ? (
                          <button
                            type="button"
                            aria-label={`Add ${item.name}`}
                            onClick={() => addToCart(item)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: 'var(--primary)',
                              color: '#FFFFFF',
                              padding: '8px 18px',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              boxShadow: '0 3px 10px rgba(230, 74, 25, 0.28)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Plus size={15} /> ADD
                          </button>
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#FFF3E0',
                            borderRadius: 'var(--radius-pill)',
                            padding: '4px 10px',
                            border: '1px solid #FFE0B2',
                            boxShadow: '0 2px 8px rgba(230, 74, 25, 0.15)'
                          }}>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              style={{
                                color: 'var(--primary)',
                                display: 'grid',
                                placeItems: 'center',
                                padding: '2px'
                              }}
                            >
                              <Minus size={15} />
                            </button>
                            <span style={{
                              fontSize: '0.9rem',
                              fontWeight: 800,
                              color: 'var(--primary)',
                              minWidth: '18px',
                              textAlign: 'center'
                            }}>
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              style={{
                                color: 'var(--primary)',
                                display: 'grid',
                                placeItems: 'center',
                                padding: '2px'
                              }}
                            >
                              <Plus size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
