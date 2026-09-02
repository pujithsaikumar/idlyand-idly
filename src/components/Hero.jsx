import React, { useState, useEffect } from 'react';
import { ShoppingBag, Phone, Sparkles, Star, Flame, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

const RECENT_ORDERS = [
  { name: 'Karthik', hostel: 'Leaders Hostel', item: 'Ghee Karam Dosa + Mysore Bonda', time: '2m ago' },
  { name: 'Sanjay', hostel: 'B3 Hostel', item: 'Chicken Fry Piece Biryani', time: '4m ago' },
  { name: 'Deepak', hostel: 'Kings Hostel', item: 'Punugulu (2 plates) + Mirchi Bajji', time: '7m ago' },
  { name: 'Ananya', hostel: 'Queens Hostel', item: 'Medu Vada + Masala Dosa', time: '9m ago' },
  { name: 'Vamsi', hostel: 'VVH Hostel', item: 'Hyderabadi Chicken Dum Biryani', time: '11m ago' }
];

export default function Hero() {
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
      padding: '36px 16px 48px',
      display: 'grid',
      gap: '40px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      alignItems: 'center'
    }}>
      {/* Left Column: Brand Story & CTA */}
      <div className="animate-fade-in">
        {/* Live Social Proof Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: '#FFFFFF',
          border: '1px solid #EDE4DC',
          padding: '6px 14px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          boxShadow: 'var(--shadow-soft)',
          marginBottom: '20px'
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            color: '#FF9800',
            fontWeight: 800
          }}>
            <Star size={14} fill="#FF9800" /> 4.9
          </span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span>1,400+ Steaming Hostel Orders Delivered</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5.5vw, 3.6rem)',
          lineHeight: 1.1,
          fontWeight: 800,
          color: 'var(--text-main)',
          letterSpacing: '-0.03em'
        }}>
          Hot, Crispy Tiffins <br />
          <span style={{
            background: 'linear-gradient(135deg, #E64A19 0%, #FF8F00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Delivered in 20 Mins.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          marginTop: '18px',
          fontSize: '1.05rem',
          color: 'var(--text-muted)',
          maxWidth: '480px',
          lineHeight: 1.6
        }}>
          Handcrafted Mysore bondas, feather-soft idlys, and pure ghee-roasted karam dosas. Cooked fresh to order &amp; delivered hot straight to your hostel.
        </p>

        {/* Action Buttons */}
        <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
          <a
            href="#menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              padding: '14px 32px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(230, 74, 25, 0.38)',
              transition: 'all 0.2s ease'
            }}
          >
            <ShoppingBag size={18} /> Explore Menu &amp; Order
            <ArrowRight size={16} />
          </a>

          <a
            href="tel:8885452603"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '14px 24px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            <Phone size={17} color="var(--primary)" /> Call Kitchen
          </a>
        </div>

        {/* Feature Pills */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <Zap size={16} color="#E64A19" />
            <span>20–25 Min Express Delivery</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <Sparkles size={16} color="#D4AF37" />
            <span>100% Pure Desi Ghee</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <ShieldCheck size={16} color="#2E7D32" />
            <span>Thermal Foil Packaging</span>
          </div>
        </div>
      </div>

      {/* Right Column: Gourmet Bento Card Showcase */}
      <div className="animate-fade-in card-lift" style={{
        position: 'relative',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 20px 48px -10px rgba(28, 19, 17, 0.18)',
        background: 'linear-gradient(145deg, #261915 0%, #170E0C 100%)',
        border: '1px solid #3E2D28',
        padding: '24px',
        color: '#FFFFFF'
      }}>
        {/* Floating Live Order Notification Pill */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '16px',
          padding: '10px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#4CAF50',
            boxShadow: '0 0 8px #4CAF50',
            flexShrink: 0
          }} />
          <div style={{ fontSize: '0.8rem', minWidth: 0 }}>
            <p style={{ fontWeight: 700, color: '#FFE0B2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ⚡ {currentOrder.name} ({currentOrder.hostel}) ordered:
            </p>
            <p style={{ color: '#E0D5C7', fontSize: '0.75rem' }}>
              {currentOrder.item} · <span style={{ color: '#D4AF37' }}>{currentOrder.time}</span>
            </p>
          </div>
        </div>

        {/* Center Visual Bento Showcase */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '28px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3.8rem',
            marginBottom: '12px',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
            letterSpacing: '8px'
          }}>
            🥞 🍩 ⚪ 🍛
          </div>

          <div style={{
            display: 'inline-block',
            backgroundColor: '#FF5722',
            color: '#FFFFFF',
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '10px'
          }}>
            Chef's Signature Tiffins
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF8F0', marginBottom: '8px' }}>
            Steaming Hot on Your Table
          </h3>

          <p style={{ fontSize: '0.85rem', color: '#D2C3B7', maxWidth: '320px', margin: '0 auto', lineHeight: 1.5 }}>
            Every order includes our signature spicy Guntur ginger chutney, rich coconut chutney, and roasted tomato chutney.
          </p>

          {/* Quick Metrics Grid */}
          <div style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '16px'
          }}>
            <div>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFB74D' }}>8</p>
              <p style={{ fontSize: '0.7rem', color: '#A8978A' }}>Hostels Covered</p>
            </div>
            <div>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#81C784' }}>FREE</p>
              <p style={{ fontSize: '0.7rem', color: '#A8978A' }}>Over ₹100</p>
            </div>
            <div>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D4AF37' }}>4.9 ★</p>
              <p style={{ fontSize: '0.7rem', color: '#A8978A' }}>Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
