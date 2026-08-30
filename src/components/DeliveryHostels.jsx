import React from 'react';
import { MapPin, Bike, Phone } from 'lucide-react';
import { HOSTEL_LIST } from '../data/menuData';

export default function DeliveryHostels() {
  return (
    <section id="delivery" style={{
      maxWidth: '1024px',
      margin: '40px auto 0',
      padding: '0 16px'
    }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
          We deliver here
        </h2>
        <p style={{ marginTop: '2px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Free delivery across these hostels.
        </p>
      </div>

      {/* Hostels Grid */}
      <div style={{
        marginTop: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        {HOSTEL_LIST.map((hostel, index) => (
          <div
            key={index}
            className="card-lift"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--card-bg)',
              padding: '14px 16px',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            <span style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#E8F5E9',
              color: '#2E7D32',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0
            }}>
              <MapPin size={18} />
            </span>
            <span style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-main)' }}>
              {hostel}
            </span>
          </div>
        ))}
      </div>

      {/* Delivery Info Banner */}
      <div style={{
        marginTop: '24px',
        borderRadius: '24px',
        background: 'var(--warm-gradient)',
        padding: '20px 24px',
        color: '#FFFFFF',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 6px 20px rgba(230, 81, 0, 0.25)'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0
        }}>
          <Bike size={22} />
        </div>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600 }}>
            FREE Delivery on orders ₹100+ · Parcel ₹5/item (Biryani ₹10)
          </p>
          <p style={{ fontSize: '0.825rem', opacity: 0.9, marginTop: '2px' }}>
            Orders under ₹100: Delivery fee ₹20 for VVH &amp; IGH hostels, ₹10 for all other hostels.
          </p>
        </div>
        <a
          href="tel:8885452603"
          style={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '1rem',
            textDecoration: 'underline',
            textUnderlineOffset: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Phone size={16} /> Call 8885452603
        </a>
      </div>
    </section>
  );
}
