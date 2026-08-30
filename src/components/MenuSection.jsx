import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { MENU_CATEGORIES } from '../data/menuData';
import { useCart } from '../context/CartContext';

export default function MenuSection() {
  const { cartItems, addToCart, updateQuantity } = useCart();

  const getItemQuantity = (id) => {
    const item = cartItems.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <section id="menu" style={{
      maxWidth: '1024px',
      margin: '0 auto',
      padding: '32px 16px'
    }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Our Menu
        </h2>
        <p style={{ marginTop: '4px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Tap <strong style={{ color: 'var(--primary)' }}>+</strong> to add items. Parcel is <strong>₹5</strong> per tiffin/dosa and <strong>₹10</strong> per biryani.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px' }}>
        {MENU_CATEGORIES.map(category => (
          <div key={category.id}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {category.title}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({category.items.length} items)
              </span>
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px'
            }}>
              {category.items.map(item => {
                const qty = getItemQuantity(item.id);

                return (
                  <div
                    key={item.id}
                    className="card-lift"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderRadius: 'var(--radius-card)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--card-bg)',
                      padding: '14px 16px',
                      boxShadow: 'var(--shadow-soft)'
                    }}
                  >
                    {/* Emoji Avatar */}
                    <span style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--secondary)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '1.4rem',
                      flexShrink: 0
                    }}>
                      {item.emoji}
                    </span>

                    {/* Details */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ₹{item.price} · {item.portion}
                      </p>
                    </div>

                    {/* Quantity / Add Actions */}
                    <div>
                      {qty === 0 ? (
                        <button
                          type="button"
                          aria-label={`Add ${item.name}`}
                          onClick={() => addToCart(item)}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            color: '#FFFFFF',
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '0 2px 8px rgba(230, 81, 0, 0.3)',
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <Plus size={18} />
                        </button>
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#FFF3E0',
                          borderRadius: 'var(--radius-pill)',
                          padding: '3px 8px',
                          border: '1px solid #FFE0B2'
                        }}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            style={{
                              color: 'var(--primary)',
                              display: 'grid',
                              placeItems: 'center'
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
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
                              placeItems: 'center'
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
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
