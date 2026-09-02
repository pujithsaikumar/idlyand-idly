import React from 'react';
import { MapPin, Bike, Phone, Clock, ShieldCheck, Zap } from 'lucide-react';
import { HOSTEL_LIST } from '../data/menuData';
import { useStore } from '../context/StoreContext';

export default function DeliveryHostels() {
  const { deliveryTimeEstimate } = useStore();

  return (
    <section id="hostels" style={{
      maxWidth: '1080px',
      margin: '20px auto 0',
      padding: '0 16px'
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
          marginBottom: '6px'
        }}>
          Campus Coverage
        </span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Dedicated Hostel Delivery Network
        </h2>
        <p style={{ marginTop: '2px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Direct to main gate &amp; entrance across all 8 hostels.
        </p>
      </div>

      {/* Hostels Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '12px'
      }}>
        {HOSTEL_LIST.map((hostel, index) => {
          const isTier2 = hostel === 'VVH Hostel' || hostel === 'IGH Hostel';
          return (
            <div
              key={index}
              className="card-lift"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                padding: '14px 18px',
                boxShadow: 'var(--shadow-soft)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#FFF3E0',
                  color: 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}>
                  <MapPin size={18} />
                </span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>
                    {hostel}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isTier2 ? 'Delivery ₹20 (FREE ₹100+)' : 'Delivery ₹10 (FREE ₹100+)'}
                  </span>
                </div>
              </div>

              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#2E7D32',
                backgroundColor: '#E8F5E9',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Zap size={11} /> {deliveryTimeEstimate.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Delivery Info Banner */}
      <div style={{
        marginTop: '24px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #1C1311 0%, #2A1C18 100%)',
        border: '1px solid #3E2D28',
        padding: '24px 28px',
        color: '#FFFFFF',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: '0 8px 30px rgba(28, 19, 17, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px', flex: 1 }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(230, 74, 25, 0.4)'
          }}>
            <Bike size={24} />
          </div>
          <div>
            <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFE0B2' }}>
              ⚡ 100% FREE Hostel Delivery on orders ₹100+ ({deliveryTimeEstimate})
            </p>
            <p style={{ fontSize: '0.85rem', color: '#D2C3B7', marginTop: '2px' }}>
              Orders below ₹100: ₹20 for VVH &amp; IGH, ₹10 for Leaders, B3, Kings, Prince, Titans &amp; Queens.
            </p>
          </div>
        </div>

        <a
          href="tel:8885452603"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '10px 20px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.2s ease'
          }}
        >
          <Phone size={15} color="#FFB74D" /> Call Kitchen: 8885452603
        </a>
      </div>
    </section>
  );
}
