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
      transition: 'all 0.2s ease',
      width: '100%'
    }}>
      {/* Top micro-announcement banner */}
      <div style={{
        background: 'linear-gradient(90deg, #1C1311 0%, #2A1C18 50%, #1C1311 100%)',
        color: '#FAF6F0',
        padding: '5px 12px',
        fontSize: '0.725rem',
        fontWeight: 600,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        <span style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          boxShadow: '0 0 6px #4CAF50',
          flexShrink: 0
        }} />
        <span>KITCHEN LIVE</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span style={{ color: '#D4AF37' }}>Free Hostel Delivery ≥ ₹100</span>
      </div>

      <div style={{
        maxWidth: '1080px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        gap: '8px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--warm-gradient)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.15rem',
            boxShadow: '0 3px 10px rgba(230, 74, 25, 0.28)',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            🥞
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.03em',
                whiteSpace: 'nowrap'
              }}>
                Idly <span style={{ color: 'var(--primary)' }}>&amp;</span> Idly
              </span>
            </div>
          </div>
        </div>

        {/* Nav actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {!isStaffViewActive && (
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <a
                href="#menu"
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                Menu
              </a>
              <a
                href="#hostels"
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-pill)',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                Hostels
              </a>
            </div>
          )}

          {/* Restaurant Staff Link */}
          <button
            type="button"
            onClick={handleRestaurantClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: isStaffViewActive ? 'var(--primary)' : '#FFFFFF',
              color: isStaffViewActive ? '#FFFFFF' : 'var(--text-main)',
              border: `1px solid ${isStaffViewActive ? 'var(--primary)' : 'var(--border-color)'}`,
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: 700,
              boxShadow: isStaffViewActive ? '0 2px 8px rgba(230,74,25,0.3)' : 'var(--shadow-soft)',
              whiteSpace: 'nowrap'
            }}
          >
            <Store size={13} />
            <span>{isStaffViewActive ? 'Exit' : isAuthenticated ? 'Kitchen' : 'Staff'}</span>
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
                gap: '4px',
                backgroundColor: '#FFF3E0',
                color: 'var(--primary)',
                border: '1px solid #FFE0B2',
                padding: '6px 10px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.78rem',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}
            >
              <Clock size={13} className="animate-spin" />
              <span>Track</span>
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
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: totalItemCount > 0 ? 'var(--primary)' : '#FFFFFF',
                color: totalItemCount > 0 ? '#FFFFFF' : 'var(--text-main)',
                border: `1px solid ${totalItemCount > 0 ? 'var(--primary)' : 'var(--border-color)'}`,
                boxShadow: totalItemCount > 0 ? '0 3px 10px rgba(230, 74, 25, 0.3)' : 'var(--shadow-soft)',
                fontWeight: 700,
                fontSize: '0.825rem',
                whiteSpace: 'nowrap'
              }}
            >
              <ShoppingBag size={15} />
              <span>₹{total}</span>
              {totalItemCount > 0 && (
                <span style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-pill)',
                  padding: '1px 6px',
                  fontSize: '0.7rem',
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
