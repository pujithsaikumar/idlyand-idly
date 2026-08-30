import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import DeliveryHostels from './components/DeliveryHostels';
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
            <DeliveryHostels />
          </>
        )}
      </main>

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

      {/* Footer */}
      <footer style={{
        marginTop: '60px',
        padding: '32px 16px',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        backgroundColor: '#FFFDF9'
      }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          <p>© 2026 Idly &amp; Idly · Fresh Tiffins &amp; Dosas · Free Hostel Delivery</p>
          <p style={{ marginTop: '4px' }}>Customer Orders: <strong>8885452603</strong> · Leaders, B3, Prince, Kings, Titans, Queens, VVH, IGH</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
