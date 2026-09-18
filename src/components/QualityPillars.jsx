import React from 'react';
import { Sparkles, Heart, ShieldCheck, Flame, Award, Clock } from 'lucide-react';

export default function QualityPillars() {
  const pillars = [
    {
      icon: '🥥',
      title: 'Fresh Chutneys Every 3 Hours',
      desc: 'Ground fresh using fresh grated coconut, roasted Guntur chillies, and ginger. Never refrigerated or preserved.'
    },
    {
      icon: '✨',
      title: 'Pure Desi Ghee & Cold Pressed Oils',
      desc: 'Authentic cow ghee and traditional wood-pressed groundnut oil for signature aroma, crispiness, and digestability.'
    },
    {
      icon: '📦',
      title: 'Thermal Foil Insulated Packaging',
      desc: 'Every dosa and tiffin plate is packed in food-grade steam-retaining insulated containers so it arrives scalding hot.'
    }
  ];

  return (
    <section style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '20px 16px 48px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-soft)',
        padding: '36px 28px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            backgroundColor: '#FFF3E0',
            padding: '4px 12px',
            borderRadius: 'var(--radius-pill)',
            display: 'inline-block',
            marginBottom: '8px'
          }}>
            The Idly &amp; Idly Standard
          </span>
          <h3 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em'
          }}>
            Why Our Tiffins Taste Extraordinary
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Uncompromising quality crafted specifically for hungry students and late-night foodies.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {pillars.map((p, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#FAF7F2',
                borderRadius: '20px',
                padding: '24px 20px',
                border: '1px solid #EDE4DC',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{
                fontSize: '2.2rem',
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #EDE4DC'
              }}>
                {p.icon}
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {p.title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
