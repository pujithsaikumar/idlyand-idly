import React, { useState } from 'react';
import { X, CreditCard, Banknote, ShieldCheck, AlertCircle, Loader2, QrCode, Copy, Check, Power } from 'lucide-react';
import { HOSTEL_LIST } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { API_BASE_URL } from '../config/api';

const HOTEL_UPI_ID = 'idlyandidly@ybl'; // Hotel UPI VPA ID

export default function OrderCheckoutModal({ isOpen, onClose, onOrderPlaced }) {
  const { cartItems, subtotal, parcelFee, deliveryFee, total, clearCart, setActiveTrackingOrderId, setSelectedHostel } = useCart();
  const { isStoreOpen } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [hostel, setHostel] = useState(HOSTEL_LIST[0]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'upi'
  const [upiUtr, setUpiUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(HOTEL_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const validateForm = () => {
    if (!isStoreOpen) {
      setErrorMessage('Kitchen is currently closed and not accepting new orders right now.');
      return false;
    }

    if (!customerName.trim()) {
      setErrorMessage('Customer name is required.');
      return false;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Phone number must be exactly 10 digits.');
      return false;
    }

    if (!hostel || !HOSTEL_LIST.includes(hostel)) {
      setErrorMessage('Please select a valid delivery hostel.');
      return false;
    }

    if (paymentMethod === 'upi') {
      const cleanUtr = upiUtr.trim();
      if (!cleanUtr) {
        setErrorMessage('UPI Reference / UTR Number is REQUIRED. Please complete payment on GPay/PhonePe and paste the 12-digit UTR number.');
        return false;
      }
      if (cleanUtr.length < 6) {
        setErrorMessage('Please enter a valid UPI Reference / UTR Number (6 to 12 digits).');
        return false;
      }
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          phone: phone.replace(/\D/g, ''),
          hostel,
          notes,
          items: cartItems,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'upi' ? 'pending_verification' : 'pending',
          upi_utr: paymentMethod === 'upi' ? upiUtr.trim() : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      clearCart();
      setActiveTrackingOrderId(data.orderId);
      onOrderPlaced(data.orderId);
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Something went wrong during checkout.');
    } finally {
      setLoading(false);
    }
  };

  const upiDeepLink = `upi://pay?pa=${HOTEL_UPI_ID}&pn=Idly%26Idly%20Tiffins&am=${total}&cu=INR`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      display: 'grid',
      placeItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-modal)',
        padding: '24px',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Hostel Delivery Details
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Total Amount to Pay: <strong style={{ color: 'var(--primary)' }}>₹{total}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        {/* Closed Store Warning */}
        {!isStoreOpen && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FFEBEE',
            color: '#C62828',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '16px',
            border: '1px solid #FFCDD2'
          }}>
            <Power size={18} />
            <span>Kitchen is currently CLOSED for food prep. Orders cannot be submitted right now.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFEBEE',
            color: '#C62828',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.875rem',
            marginBottom: '16px',
            border: '1px solid #FFCDD2'
          }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              10-Digit Mobile Number *
            </label>
            <input
              type="tel"
              maxLength={10}
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              Delivery Hostel *
            </label>
            <select
              value={hostel}
              onChange={e => {
                setHostel(e.target.value);
                setSelectedHostel(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              {HOSTEL_LIST.map((h, i) => (
                <option key={i} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
              Special Notes / Chutney Preference (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Extra spicy karam chutney please"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Explicit Bill Breakdown */}
          <div style={{
            backgroundColor: '#FFF8F0',
            border: '1px solid #F5E6D8',
            borderRadius: '14px',
            padding: '12px 14px',
            fontSize: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items Subtotal:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Parcel Charges (Packaging):</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{parcelFee}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery Charge ({hostel}):</span>
              <span style={{ fontWeight: 700, color: deliveryFee === 0 ? '#2E7D32' : 'var(--primary)' }}>
                {deliveryFee === 0 ? 'FREE (Order ≥ ₹100)' : `₹${deliveryFee}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #E0D5C7', paddingTop: '6px', fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
              <span>Total Payable:</span>
              <span>₹{total}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              Select Payment Method *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '14px',
                  border: `2px solid ${paymentMethod === 'cod' ? 'var(--primary)' : 'var(--border-color)'}`,
                  backgroundColor: paymentMethod === 'cod' ? '#FFF3E0' : '#FFFFFF',
                  color: paymentMethod === 'cod' ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                <Banknote size={18} />
                <span>Cash on Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '14px',
                  border: `2px solid ${paymentMethod === 'upi' ? 'var(--primary)' : 'var(--border-color)'}`,
                  backgroundColor: paymentMethod === 'upi' ? '#FFF3E0' : '#FFFFFF',
                  color: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                <QrCode size={18} />
                <span>Pay via UPI / GPay</span>
              </button>
            </div>
          </div>

          {/* UPI Direct Payment Details Box */}
          {paymentMethod === 'upi' && (
            <div style={{
              backgroundColor: '#FFF8F0',
              border: '2px solid #FFE0B2',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Seamless In-App UPI Payment Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E65100' }}>
                  Pay ₹{total} to UPI ID:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: '10px', border: '1px solid #FFE0B2' }}>
                  <code style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>{HOTEL_UPI_ID}</code>
                  <button type="button" onClick={handleCopyUpi} style={{ color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                    {copiedUpi ? <Check size={16} color="#2E7D32" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Direct UPI App Intent Trigger on Mobile */}
              <a
                href={upiDeepLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: '#E65100',
                  color: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(230, 81, 0, 0.25)'
                }}
              >
                <QrCode size={16} /> Tap to Open GPay / PhonePe / Paytm (₹{total})
              </a>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 800, color: '#C62828', marginBottom: '4px' }}>
                  12-Digit UPI Reference / UTR No. * (Required)
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  placeholder="Paste 12-digit UTR from GPay / PhonePe (e.g. 423910582910)"
                  value={upiUtr}
                  onChange={e => setUpiUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `2px solid ${!upiUtr.trim() ? '#FF8A65' : '#4CAF50'}`,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    outline: 'none',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  💡 <strong>Step 1:</strong> Pay ₹{total} on GPay/PhonePe ➔ <strong>Step 2:</strong> Copy the 12-digit UTR / Transaction ID from the receipt ➔ <strong>Step 3:</strong> Paste it above to place your order.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isStoreOpen}
            style={{
              marginTop: '8px',
              width: '100%',
              backgroundColor: isStoreOpen ? 'var(--primary)' : '#9E9E9E',
              color: '#FFFFFF',
              padding: '14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isStoreOpen ? '0 4px 14px rgba(230, 74, 25, 0.35)' : 'none',
              opacity: loading ? 0.7 : 1,
              cursor: isStoreOpen ? 'pointer' : 'not-allowed'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing Order...
              </>
            ) : !isStoreOpen ? (
              'Kitchen Closed (Cannot Place Order)'
            ) : (
              <>
                <ShieldCheck size={20} />
                {paymentMethod === 'cod' ? `Place Order (Pay ₹${total} COD)` : `Verify UTR & Place Order (₹${total})`}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
