import React from 'react';
import { ShoppingBag, Store, Clock, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { totalItemCount, total, setIsCartOpen, activeTrackingOrderId } = useCart();
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
    <header className="glass-header" style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      transition: 'all 0.2s ease'
    }}>
      {/* Top micro-announcement banner */}
      <div style={{
        background: 'linear-gradient(90deg, #1C1311 0%, #2A1C18 50%, #1C1311 100%)',
        color: '#FAF6F0',
        padding: '5px 16px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        letterSpacing: '0.02em'
      }}>
        <span style={{
          display: 'inline-block',
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          boxShadow: '0 0 8px #4CAF50'
        }} />
        <span>KITCHEN LIVE &amp; PREPARING FRESH ORDERS</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span style={{ color: '#D4AF37' }}>⚡ 100% Free Hostel Delivery on orders ≥ ₹100</span>
      </div>

      <div style={{
        maxWidth: '1080px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--warm-gradient)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(230, 74, 25, 0.28)',
            color: '#FFFFFF'
          }}>
            🥞
          </div>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.03em'
              }}>
                Idly <span style={{ color: 'var(--primary)' }}>&amp;</span> Idly
              </span>
              <span style={{
                backgroundColor: '#FFF3E0',
                color: 'var(--primary)',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '6px',
                border: '1px solid #FFE0B2',
                letterSpacing: '0.05em'
              }}>
                GOURMET
              </span>
            </div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '-2px' }}>
              Authentic South Indian Cloud Kitchen
            </p>
          </div>
        </div>

        {/* Nav actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isStaffViewActive && (
            <>
              <a
                href="#menu"
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'color 0.2s ease'
                }}
              >
                Menu
              </a>
              <a
                href="#hostels"
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'color 0.2s ease'
                }}
              >
                Hostels
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
              backgroundColor: isStaffViewActive ? 'var(--primary)' : '#FFFFFF',
              color: isStaffViewActive ? '#FFFFFF' : 'var(--text-main)',
              border: `1px solid ${isStaffViewActive ? 'var(--primary)' : 'var(--border-color)'}`,
              padding: '7px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: isStaffViewActive ? '0 3px 10px rgba(230,74,25,0.3)' : 'var(--shadow-soft)'
            }}
          >
            <Store size={14} />
            {isStaffViewActive ? 'Exit Kitchen' : isAuthenticated ? 'Kitchen Dashboard' : 'Staff Login'}
          </button>

          {/* Live Order Tracker Trigger (if user has active order) */}
          {activeTrackingOrderId && !isStaffViewActive && (
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-order-tracker', { detail: activeTrackingOrderId }));
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FFF3E0',
                color: 'var(--primary)',
                border: '1px solid #FFE0B2',
                padding: '7px 14px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8rem',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(230, 74, 25, 0.15)'
              }}
            >
              <Clock size={14} className="animate-spin" />
              Live Order #{activeTrackingOrderId}
            </button>
          )}

          {/* Cart Header Button */}
          {!isStaffViewActive && (
            <button
              type="button"
              aria-label={`Open cart, ${totalItemCount} items`}
              onClick={() => setIsCartOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: totalItemCount > 0 ? 'var(--primary)' : '#FFFFFF',
                color: totalItemCount > 0 ? '#FFFFFF' : 'var(--text-main)',
                border: `1px solid ${totalItemCount > 0 ? 'var(--primary)' : 'var(--border-color)'}`,
                boxShadow: totalItemCount > 0 ? '0 4px 14px rgba(230, 74, 25, 0.32)' : 'var(--shadow-soft)',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}
            >
              <ShoppingBag size={17} />
              <span>₹{total}</span>
              {totalItemCount > 0 && (
                <span style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.28)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-pill)',
                  padding: '1px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
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
