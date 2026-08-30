import React, { useState } from 'react';
import { X, CreditCard, Banknote, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { HOSTEL_LIST } from '../data/menuData';
import { useCart } from '../context/CartContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function OrderCheckoutModal({ isOpen, onClose, onOrderPlaced }) {
  const { cartItems, subtotal, parcelFee, deliveryFee, total, clearCart, setActiveTrackingOrderId, setSelectedHostel } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [hostel, setHostel] = useState(HOSTEL_LIST[0]);
  const [roomNumber, setRoomNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const validateForm = () => {
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
      if (paymentMethod === 'cod') {
        // Submit COD Order directly
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: customerName,
            phone: phone.replace(/\D/g, ''),
            hostel,
            room_number: roomNumber,
            notes,
            items: cartItems,
            payment_method: 'cod',
            payment_status: 'pending'
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to place order.');
        }

        clearCart();
        setActiveTrackingOrderId(data.orderId);
        onOrderPlaced(data.orderId);
      } else {
        // Pay Online via Razorpay
        // 1. Create Razorpay order on backend
        const razorpayOrderRes = await fetch(`${API_BASE_URL}/payments/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total })
        });

        const rzpData = await razorpayOrderRes.json();
        if (!razorpayOrderRes.ok) {
          throw new Error(rzpData.error || 'Failed to initialize online payment.');
        }

        // 2. Open Razorpay Checkout Widget (or fallback mock if window.Razorpay unavailable)
        if (window.Razorpay && !rzpData.isMock) {
          const options = {
            key: rzpData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
            amount: rzpData.amount,
            currency: rzpData.currency || 'INR',
            name: 'Idly & Idly Tiffins',
            description: `Hostel Delivery for ${customerName}`,
            order_id: rzpData.id,
            prefill: {
              name: customerName,
              contact: phone.replace(/\D/g, '')
            },
            theme: {
              color: '#E65100'
            },
            handler: async function (response) {
              // Verify payment on backend
              try {
                // First create order
                const createOrderRes = await fetch(`${API_BASE_URL}/orders`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customer_name: customerName,
                    phone: phone.replace(/\D/g, ''),
                    hostel,
                    room_number: roomNumber,
                    notes,
                    items: cartItems,
                    payment_method: 'online',
                    payment_status: 'paid',
                    razorpay_payment_id: response.razorpay_payment_id
                  })
                });
                const createOrderData = await createOrderRes.json();

                // Verify signature
                await fetch(`${API_BASE_URL}/payments/verify`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    order_id: createOrderData.orderId
                  })
                });

                clearCart();
                setActiveTrackingOrderId(createOrderData.orderId);
                onOrderPlaced(createOrderData.orderId);
              } catch (verifyErr) {
                setErrorMessage('Payment verification error: ' + verifyErr.message);
              } finally {
                setLoading(false);
              }
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Development/Mock Razorpay flow fallback
          const createOrderRes = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_name: customerName,
              phone: phone.replace(/\D/g, ''),
              hostel,
              room_number: roomNumber,
              notes,
              items: cartItems,
              payment_method: 'online',
              payment_status: 'paid',
              razorpay_payment_id: `pay_mock_${Date.now()}`
            })
          });
          const createOrderData = await createOrderRes.json();

          clearCart();
          setActiveTrackingOrderId(createOrderData.orderId);
          onOrderPlaced(createOrderData.orderId);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Something went wrong during checkout.');
    } finally {
      if (paymentMethod === 'cod') {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      display: 'grid',
      placeItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
              placeholder="e.g. Rahul Sharma"
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
                onClick={() => setPaymentMethod('online')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '14px',
                  border: `2px solid ${paymentMethod === 'online' ? 'var(--primary)' : 'var(--border-color)'}`,
                  backgroundColor: paymentMethod === 'online' ? '#FFF3E0' : '#FFFFFF',
                  color: paymentMethod === 'online' ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                <CreditCard size={18} />
                <span>Pay Online (Razorpay)</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '12px',
              width: '100%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              padding: '14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(230, 81, 0, 0.35)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing Order...
              </>
            ) : (
              <>
                <ShieldCheck size={20} />
                {paymentMethod === 'cod' ? `Place Order (Pay ₹${total} COD)` : `Pay ₹${total} Online Now`}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
