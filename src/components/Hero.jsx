import React from 'react';
import { Clock, ShoppingBag, Phone } from 'lucide-react';

export default function Hero() {
  return (
    <section style={{
      maxWidth: '1024px',
      margin: '0 auto',
      padding: '40px 16px 48px',
      display: 'grid',
      gap: '32px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      alignItems: 'center'
    }}>
      <div className="animate-fade-in">
        {/* Badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: '#FFF3E0',
          color: 'var(--primary)',
          padding: '6px 14px',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          <Clock size={14} /> Fresh &amp; hot, made to order
        </span>

        {/* Heading */}
        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
          lineHeight: 1.15,
          fontWeight: 700,
          color: 'var(--text-main)'
        }}>
          Tiffins that taste like <span style={{ color: 'var(--primary)' }}>home</span>.
        </h1>

        {/* Subtitle */}
        <p style={{
          marginTop: '16px',
          fontSize: '1.05rem',
          color: 'var(--text-muted)',
          maxWidth: '460px'
        }}>
          Bonda, vada, punugulu, idly and crispy dosas — freshly prepared and delivered straight to your hostel.
        </p>

        {/* CTA buttons */}
        <div style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <a
            href="#menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              padding: '12px 28px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(230, 81, 0, 0.35)',
              transition: 'transform 0.2s ease, backgroundColor 0.2s ease'
            }}
          >
            <ShoppingBag size={18} /> Order now
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
              padding: '12px 24px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            <Phone size={18} /> 8885452603
          </a>
        </div>
      </div>

      {/* Hero Visual Card */}
      <div className="animate-fade-in card-lift" style={{
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-hover)',
        background: 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
        padding: '12px',
        border: '1px solid #FFE0B2'
      }}>
        <div style={{
          borderRadius: '18px',
          overflow: 'hidden',
          aspectRatio: '4/3',
          background: '#2A1B16',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          textAlign: 'center',
          padding: '24px'
        }}>
          {/* Stylized South Indian Spread Graphic */}
          <div style={{ fontSize: '4rem', marginBottom: '8px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
            🥞 ⚪ 🍩 🌶️
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#FFE0B2', marginBottom: '6px' }}>
            Authentic South Indian Tiffins
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#E0D5C7', maxWidth: '280px' }}>
            Steaming hot &amp; packaged with fresh coconut &amp; spicy tomato chutneys.
          </p>
          <div style={{
            marginTop: '16px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-pill)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#FFF8EE'
          }}>
            ⚡ Free Hostel Delivery
          </div>
        </div>
      </div>
    </section>
  );
}
