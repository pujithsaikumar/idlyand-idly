import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onProceedToCheckout }) {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    parcelFee,
    deliveryFee,
    total
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)'
    }}>
      {/* Overlay backdrop click */}
      <div
        style={{ position: 'absolute', inset: 0 }}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div style={{
        position: 'relative',
        zIndex: 101,
        width: '100%',
        maxWidth: '420px',
        height: '100%',
        backgroundColor: '#FFFFFF',
        boxShadow: 'var(--shadow-modal)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideLeft 0.25s ease-out'
      }}>
        <style>{`
          @keyframes slideLeft {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFDF9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Tiffin Basket</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--secondary)',
              color: 'var(--text-main)',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cartItems.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🍽️</div>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px', maxWidth: '240px' }}>
                Add hot Mysore bonda, dosa, or biryani to get started!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cartItems.map(item => {
                const isBiryani = item.category === 'Biryani' || item.name.toLowerCase().includes('biriyani');
                const feePerItem = isBiryani ? 10 : 5;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--secondary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{item.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ₹{item.price} x {item.quantity} · Parcel ₹{feePerItem * item.quantity}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          color: 'var(--primary)',
                          display: 'grid',
                          placeItems: 'center',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 4px' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: '#FFFFFF',
                          color: 'var(--primary)',
                          display: 'grid',
                          placeItems: 'center',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          marginLeft: '6px',
                          color: '#D32F2F',
                          display: 'grid',
                          placeItems: 'center'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: '#FFFDF9'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span>Parcel Charges</span>
                <span>₹{parcelFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span>Delivery Fee {subtotal >= 100 && <strong style={{ color: '#2E7D32' }}>(FREE ₹100+)</strong>}</span>
                <span style={{ color: deliveryFee === 0 ? '#2E7D32' : 'inherit', fontWeight: deliveryFee === 0 ? 600 : 400 }}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justify: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                paddingTop: '8px',
                borderTop: '1px dashed var(--border-color)'
              }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary)' }}>₹{total}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              style={{
                width: '100%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                padding: '14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(230, 81, 0, 0.35)'
              }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
