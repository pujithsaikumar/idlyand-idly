import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import QualityPillars from './components/QualityPillars';
import DeliveryHostels from './components/DeliveryHostels';
import FloatingCartDock from './components/FloatingCartDock';
import CartDrawer from './components/CartDrawer';
import OrderCheckoutModal from './components/OrderCheckoutModal';
import OrderTrackerModal from './components/OrderTrackerModal';
import StaffLoginModal from './components/StaffPortal/StaffLoginModal';
import RestaurantDashboard from './components/StaffPortal/RestaurantDashboard';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

function AppContent() {
  const { isStaffViewActive } = useAuth();
  const { activeTrackingOrderId, setActiveTrackingOrderId } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  useEffect(() => {
    const handleOpenTracker = (e) => {
      if (e.detail) {
        setActiveTrackingOrderId(e.detail);
        setIsTrackerOpen(true);
      }
    };

    window.addEventListener('open-order-tracker', handleOpenTracker);
    return () => window.removeEventListener('open-order-tracker', handleOpenTracker);
  }, []);

  const handleOrderPlaced = (orderId) => {
    setIsCheckoutOpen(false);
    setIsTrackerOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1 }}>
        {isStaffViewActive ? (
          <RestaurantDashboard />
        ) : (
          <>
            <Hero />
            <MenuSection />
            <QualityPillars />
            <DeliveryHostels />
          </>
        )}
      </main>

      {/* Floating Bottom Cart Dock (Luxury Mobile & Desktop UX) */}
      <FloatingCartDock />

      {/* Slide-out Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      <OrderCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Live Order Tracker Modal */}
      <OrderTrackerModal
        orderId={activeTrackingOrderId}
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />

      {/* Staff Authentication Login Modal */}
      <StaffLoginModal />

      {/* Luxury Footer */}
      <footer style={{
        marginTop: '80px',
        padding: '48px 16px 36px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: '#1C1311',
        color: '#D2C3B7'
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          marginBottom: '36px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>🥞</span>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#FFF8F0'
              }}>
                Idly <span style={{ color: 'var(--primary)' }}>&amp;</span> Idly
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#A8978A', lineHeight: 1.6 }}>
              Handcrafted gourmet South Indian tiffins, crispy artisan dosas, and royal pot biryanis. Delivered hot to your hostel room.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFE0B2', marginBottom: '12px' }}>
              Hostel Coverage
            </h4>
            <p style={{ fontSize: '0.825rem', color: '#A8978A', lineHeight: 1.8 }}>
              Leaders · B3 · Prince · Kings · Titans · Queens · VVH · IGH Hostels
            </p>
            <p style={{ fontSize: '0.8rem', color: '#81C784', marginTop: '6px', fontWeight: 600 }}>
              ⚡ Free Delivery on orders ₹100+
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFE0B2', marginBottom: '12px' }}>
              Direct Kitchen Helpline
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#A8978A' }}>
              For custom orders &amp; party catering:
            </p>
            <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFB74D', marginTop: '6px' }}>
              📞 8885452603
            </p>
            <p style={{ fontSize: '0.75rem', color: '#A8978A', marginTop: '4px' }}>
              UPI ID: <strong style={{ color: '#FFF8F0' }}>idlyandidly@ybl</strong>
            </p>
          </div>
        </div>

        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '20px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#8A7A6E'
        }}>
          <p>© 2026 Idly &amp; Idly Gourmet Kitchens. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
