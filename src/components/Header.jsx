import React from 'react';
import { ShoppingCart, Store, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { totalItemCount, setIsCartOpen, activeTrackingOrderId } = useCart();
  const { isAuthenticated, isStaffViewActive, setIsStaffViewActive, setIsStaffModalOpen } = useAuth();

  const handleRestaurantClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      setIsStaffViewActive(!isStaffViewActive);
    } else {
      setIsStaffModalOpen(true);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(255, 253, 249, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)'
    }}>
      <div style={{
        maxWidth: '1024px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--warm-gradient)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.2rem',
            boxShadow: '0 2px 8px rgba(230, 81, 0, 0.25)'
          }}>
            🍽️
          </span>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--primary)'
          }}>
            Idly &amp; Idly
          </span>
        </div>

        {/* Nav actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isStaffViewActive && (
            <>
              <a
                href="#menu"
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                Menu
              </a>
              <a
                href="#delivery"
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
              >
                Delivery
              </a>
            </>
          )}

          {/* Restaurant Staff Link */}
          <button
            type="button"
            onClick={handleRestaurantClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isStaffViewActive ? 'var(--primary)' : 'var(--secondary)',
              color: isStaffViewActive ? '#FFFFFF' : 'var(--secondary-foreground)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.825rem',
              fontWeight: 600,
              transition: 'all 0.2s ease'
            }}
          >
            <Store size={15} />
            {isStaffViewActive ? 'Exit Staff Dashboard' : isAuthenticated ? 'Staff Dashboard' : 'Restaurant Login'}
          </button>

          {/* Live Order Tracker Trigger (if user has active order) */}
          {activeTrackingOrderId && !isStaffViewActive && (
            <button
              type="button"
              onClick={() => {
                // Will open live tracker modal
                window.dispatchEvent(new CustomEvent('open-order-tracker', { detail: activeTrackingOrderId }));
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FFF3E0',
                color: 'var(--primary)',
                border: '1px solid #FFE0B2',
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.825rem',
                fontWeight: 600
              }}
            >
              <Clock size={15} />
              Track #{activeTrackingOrderId}
            </button>
          )}

          {/* Cart Button */}
          {!isStaffViewActive && (
            <button
              type="button"
              aria-label={`Open cart, ${totalItemCount} items`}
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--secondary)',
                color: 'var(--text-main)',
                display: 'grid',
                placeItems: 'center',
                transition: 'transform 0.2s ease'
              }}
            >
              <ShoppingCart size={20} />
              {totalItemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  {totalItemCount}
                </span>
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
