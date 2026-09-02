import React, { useState } from 'react';
import { Plus, Minus, Star } from 'lucide-react';
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
      padding: '24px 14px 40px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{
          display: 'inline-block',
          fontSize: '0.75rem',
          fontWeight: 800,
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '4px'
        }}>
          Handcrafted Fresh Daily
        </span>
        <h2 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 800,
          color: 'var(--text-main)',
          letterSpacing: '-0.02em'
        }}>
          Explore Our Signature Menu
        </h2>
        <p style={{
          marginTop: '6px',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          maxWidth: '500px',
          margin: '6px auto 0'
        }}>
          Made fresh upon order. Includes signature chutneys &amp; sambar. Packaging: ₹5/tiffin, ₹10/biryani.
        </p>
      </div>

      {/* Sticky Luxury Category Tabs */}
      <div style={{
        position: 'sticky',
        top: '64px',
        zIndex: 30,
        padding: '6px 0',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '28px'
      }} className="no-scrollbar">
        <div style={{
          display: 'inline-flex',
          backgroundColor: '#FFFFFF',
          padding: '4px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-soft)',
          gap: '4px',
          margin: '0 auto'
        }}>
          {MENU_CATEGORIES.map(category => {
            const isActive = activeCategory === category.id;
            return (
              <a
                key={category.id}
                href={`#cat-${category.id}`}
                onClick={() => setActiveCategory(category.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-main)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.825rem',
                  textDecoration: 'none',
                  boxShadow: isActive ? '0 3px 10px rgba(230, 74, 25, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span>{category.icon}</span>
                <span>{category.title}</span>
                <span style={{
                  fontSize: '0.7rem',
                  opacity: isActive ? 0.85 : 0.6,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'var(--secondary)',
                  padding: '1px 5px',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {MENU_CATEGORIES.map(category => (
          <div key={category.id} id={`cat-${category.id}`}>
            {/* Category Subheader */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: '14px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '8px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{category.icon}</span>
                  <span>{category.title}</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {category.subtitle}
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
                {category.items.length} dishes
              </span>
            </div>

            {/* Dishes Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '14px'
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
                      padding: '14px 16px',
                      boxShadow: 'var(--shadow-soft)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div>
                      {/* Card Top Row: Badge & Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        {item.badge ? (
                          <span style={{
                            ...badgeStyle,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '6px'
                          }}>
                            {item.badge}
                          </span>
                        ) : <span />}

                        {item.rating && (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            color: '#E65100',
                            backgroundColor: '#FFF8EE',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid #FFE0B2'
                          }}>
                            <Star size={11} fill="#E65100" />
                            {item.rating}
                          </span>
                        )}
                      </div>

                      {/* Item Title & Emoji */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          backgroundColor: 'var(--secondary)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '1.35rem',
                          flexShrink: 0
                        }}>
                          {item.emoji}
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h4 style={{
                            fontSize: '0.98rem',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            lineHeight: 1.25
                          }}>
                            {item.name}
                          </h4>
                          <span style={{
                            fontSize: '0.725rem',
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
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.4,
                          marginBottom: '12px'
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
                      paddingTop: '10px',
                      marginTop: '2px'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Price
                        </span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
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
                              gap: '4px',
                              backgroundColor: 'var(--primary)',
                              color: '#FFFFFF',
                              padding: '7px 16px',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: '0.825rem',
                              fontWeight: 700,
                              boxShadow: '0 2px 8px rgba(230, 74, 25, 0.28)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Plus size={14} /> ADD
                          </button>
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#FFF3E0',
                            borderRadius: 'var(--radius-pill)',
                            padding: '3px 8px',
                            border: '1px solid #FFE0B2',
                            boxShadow: '0 2px 6px rgba(230, 74, 25, 0.12)'
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
                              <Minus size={14} />
                            </button>
                            <span style={{
                              fontSize: '0.85rem',
                              fontWeight: 800,
                              color: 'var(--primary)',
                              minWidth: '16px',
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
                              <Plus size={14} />
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
