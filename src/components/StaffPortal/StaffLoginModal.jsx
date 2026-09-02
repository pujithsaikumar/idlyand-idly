import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StaffLoginModal() {
  const { isStaffModalOpen, setIsStaffModalOpen, loginStaff } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isStaffModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginStaff(email.trim(), password.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid staff credentials');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 130,
      display: 'grid',
      placeItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: '400px',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-modal)',
        padding: '24px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Authorized Staff Only
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Restaurant Portal Login
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsStaffModalOpen(false)}
            style={{
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--secondary)',
              color: 'var(--text-main)',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFEBEE',
            color: '#C62828',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '4px' }}>
              Staff Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="staff@idlyandidly.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '4px' }}>
              Staff Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              width: '100%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              padding: '12px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.925rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(230, 74, 25, 0.35)'
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Log In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
