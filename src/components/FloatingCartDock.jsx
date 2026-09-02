import React from 'react';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
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
      bottom: '18px',
      left: '0',
      right: '0',
      zIndex: 35,
      display: 'flex',
      justifyContent: 'center',
      padding: '0 16px',
      pointerEvents: 'none'
    }}>
      <div
        className="animate-slide-up"
        style={{
          pointerEvents: 'auto',
          maxWidth: '540px',
          width: '100%',
          backgroundColor: '#1C1311',
          color: '#FFFFFF',
          borderRadius: '24px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 16px 36px -4px rgba(28, 19, 17, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      >
        {/* Left Side: Count & Free Delivery status */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-pill)',
              padding: '2px 9px',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFE0B2' }}>
              ₹{total}
            </span>
          </div>

          <p style={{
            fontSize: '0.75rem',
            color: amountRemainingForFree > 0 ? '#FFCC80' : '#81C784',
            fontWeight: 600,
            marginTop: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {amountRemainingForFree > 0
              ? `Add ₹${amountRemainingForFree} more for FREE delivery`
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
            padding: '10px 20px',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 800,
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(230, 74, 25, 0.4)',
            flexShrink: 0
          }}
        >
          <span>View Cart</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
