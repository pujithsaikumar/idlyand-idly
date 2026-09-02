import React, { useState, useEffect } from 'react';
import { ShoppingBag, Phone, Sparkles, Star, Flame, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const RECENT_ORDERS = [
  { hostel: 'Leaders Hostel', item: 'Mysore Bonda (2 pcs) + Vada (2 pcs)', time: '2m ago' },
  { hostel: 'B3 Hostel', item: 'Ghee Karam Dosa', time: '4m ago' },
  { hostel: 'Kings Hostel', item: 'Hyderabadi Chicken Dum Biryani', time: '6m ago' },
  { hostel: 'Queens Hostel', item: 'Mysore Bonda (4 pcs)', time: '8m ago' },
  { hostel: 'Prince Hostel', item: 'Onion Dosa + Medu Vada (2 pcs)', time: '10m ago' },
  { hostel: 'Titans Hostel', item: 'Egg Biryani (Special)', time: '12m ago' },
  { hostel: 'VVH Hostel', item: 'Ghee Sambar Idly (2 pcs)', time: '14m ago' },
  { hostel: 'IGH Hostel', item: 'Masala Dosa + Medu Vada (2 pcs)', time: '16m ago' }
];

export default function Hero() {
  const { deliveryTimeEstimate, isStoreOpen } = useStore();
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % RECENT_ORDERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const currentOrder = RECENT_ORDERS[tickerIndex];

  return (
    <section style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '24px 14px 36px',
      display: 'grid',
      gap: '28px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Left Column: Brand Story & CTA */}
      <div className="animate-fade-in" style={{ width: '100%' }}>
        {/* Live Social Proof Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: '#FFFFFF',
          border: '1px solid #EDE4DC',
          padding: '5px 12px',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          boxShadow: 'var(--shadow-soft)',
          marginBottom: '16px',
          maxWidth: '100%'
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            color: '#FF9800',
            fontWeight: 800
          }}>
            <Star size={13} fill="#FF9800" /> 4.9
          </span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            1,400+ Hostel Orders
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5.5vw, 3.4rem)',
          lineHeight: 1.15,
          fontWeight: 800,
          color: 'var(--text-main)',
          letterSpacing: '-0.03em',
          wordBreak: 'break-word'
        }}>
          Hot, Crispy Tiffins <br />
          <span style={{
            background: 'linear-gradient(135deg, #E64A19 0%, #FF8F00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Delivered in {deliveryTimeEstimate}.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          marginTop: '14px',
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          maxWidth: '480px',
          lineHeight: 1.55
        }}>
          Handcrafted Mysore bondas, feather-soft idlys, and pure ghee-roasted karam dosas. Cooked fresh to order &amp; delivered hot straight to your hostel.
        </p>

        {/* Action Buttons */}
        <div style={{
          marginTop: '22px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px',
          width: '100%'
        }}>
          <a
            href="#menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: isStoreOpen ? 'var(--primary)' : '#757575',
              color: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '0.925rem',
              textDecoration: 'none',
              boxShadow: isStoreOpen ? '0 6px 20px rgba(230, 74, 25, 0.35)' : 'none',
              flex: '1 1 auto',
              minWidth: '180px'
            }}
          >
            <ShoppingBag size={17} /> {isStoreOpen ? 'Explore Menu & Order' : 'View Menu (Closed)'}
            <ArrowRight size={15} />
          </a>

          <a
            href="tel:8885452603"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '12px 20px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-soft)',
              flex: '1 1 auto',
              minWidth: '140px'
            }}
          >
            <Phone size={15} color="var(--primary)" /> Call Kitchen
          </a>
        </div>

        {/* Feature Pills */}
        <div style={{
          marginTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <Zap size={14} color="#E64A19" />
            <span>{deliveryTimeEstimate} Delivery</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <Sparkles size={14} color="#D4AF37" />
            <span>100% Pure Desi Ghee</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <ShieldCheck size={14} color="#2E7D32" />
            <span>Thermal Packaging</span>
          </div>
        </div>
      </div>

      {/* Right Column: Gourmet Bento Card Showcase */}
      <div className="animate-fade-in card-lift" style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 16px 40px -10px rgba(28, 19, 17, 0.18)',
        background: 'linear-gradient(145deg, #261915 0%, #170E0C 100%)',
        border: '1px solid #3E2D28',
        padding: '18px',
        color: '#FFFFFF',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Floating Live Order Notification Pill */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '14px',
          padding: '8px 12px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            boxShadow: '0 0 6px #4CAF50',
            flexShrink: 0
          }} />
          <div style={{ fontSize: '0.75rem', minWidth: 0, overflow: 'hidden' }}>
            <p style={{ fontWeight: 700, color: '#FFE0B2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ⚡ Live Order · {currentOrder.hostel}:
            </p>
            <p style={{ color: '#E0D5C7', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentOrder.item} · <span style={{ color: '#D4AF37' }}>{currentOrder.time}</span>
            </p>
          </div>
        </div>

        {/* Center Visual Bento Showcase */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px 14px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '8px',
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
            letterSpacing: '4px'
          }}>
            🥞 🍩 ⚪ 🍛
          </div>

          <div style={{
            display: 'inline-block',
            backgroundColor: '#FF5722',
            color: '#FFFFFF',
            fontSize: '0.65rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '3px 10px',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '8px'
          }}>
            Chef's Signature Tiffins
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF8F0', marginBottom: '6px' }}>
            Steaming Hot on Your Table
          </h3>

          <p style={{ fontSize: '0.8rem', color: '#D2C3B7', maxWidth: '300px', margin: '0 auto', lineHeight: 1.45 }}>
            Includes spicy Guntur ginger chutney, rich coconut chutney, and roasted tomato chutney.
          </p>

          {/* Quick Metrics Grid */}
          <div style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '12px'
          }}>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFB74D' }}>8</p>
              <p style={{ fontSize: '0.65rem', color: '#A8978A' }}>Hostels</p>
            </div>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#81C784' }}>FREE</p>
              <p style={{ fontSize: '0.65rem', color: '#A8978A' }}>Over ₹100</p>
            </div>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D4AF37' }}>4.9 ★</p>
              <p style={{ fontSize: '0.65rem', color: '#A8978A' }}>Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
