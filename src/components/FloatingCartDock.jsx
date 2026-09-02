import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function FloatingCartDock() {
  const { totalItemCount, total, subtotal, setIsCartOpen } = useCart();
  const { isStaffViewActive } = useAuth();

  if (totalItemCount === 0 || isStaffViewActive) return null;

  const freeDeliveryThreshold = 100;
  const amountRemainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
      left: '0',
      right: '0',
      zIndex: 35,
      display: 'flex',
      justifyContent: 'center',
      padding: '0 12px',
      pointerEvents: 'none'
    }}>
      <div
        className="animate-slide-up"
        style={{
          pointerEvents: 'auto',
          maxWidth: '500px',
          width: '100%',
          backgroundColor: '#1C1311',
          color: '#FFFFFF',
          borderRadius: '20px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          boxShadow: '0 12px 32px -4px rgba(28, 19, 17, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Side: Count & Free Delivery status */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-pill)',
              padding: '2px 8px',
              fontSize: '0.75rem',
              fontWeight: 800,
              whiteSpace: 'nowrap'
            }}>
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFE0B2', whiteSpace: 'nowrap' }}>
              ₹{total}
            </span>
          </div>

          <p style={{
            fontSize: '0.72rem',
            color: amountRemainingForFree > 0 ? '#FFCC80' : '#81C784',
            fontWeight: 600,
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {amountRemainingForFree > 0
              ? `Add ₹${amountRemainingForFree} for FREE delivery`
              : `🎉 FREE Delivery unlocked!`}
          </p>
        </div>

        {/* Right Side: View Cart Action */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 800,
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 3px 12px rgba(230, 74, 25, 0.4)',
            flexShrink: 0
          }}
        >
          <span>View Cart</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
