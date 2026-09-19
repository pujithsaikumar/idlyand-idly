import React, { useState, useEffect, useMemo } from 'react';
import { X, CheckCircle2, Clock, Bike, Home, RefreshCw, AlertCircle, Edit3, Plus, Minus, Trash2, Save, User, Phone, MapPin, XCircle, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { HOSTEL_LIST, MENU_CATEGORIES } from '../data/menuData';
import { useStore } from '../context/StoreContext';
import { API_BASE_URL } from '../config/api';

const STATUS_STEPS = [
  { id: 'pending', title: 'Order Received', desc: 'Sent to Idly & Idly kitchen', icon: Clock },
  { id: 'preparing', title: 'Preparing Food', desc: 'Hot dosas & tiffins on the stove', icon: RefreshCw },
  { id: 'en_route', title: 'Out for Delivery', desc: 'Rider en route to your hostel', icon: Bike },
  { id: 'delivered', title: 'Delivered', desc: 'Enjoy your hot meal!', icon: Home }
];

export default function OrderTrackerModal({ orderId, isOpen, onClose }) {
  const { getItemPrice, isItemOutOfStock } = useStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 3-Minute Edit Window state
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Use a ref to ensure polling NEVER overwrites active user typing/editing
  const isEditModeRef = React.useRef(isEditMode);
  useEffect(() => {
    isEditModeRef.current = isEditMode;
  }, [isEditMode]);

  // Editable fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editHostel, setEditHostel] = useState('');
  const [editItems, setEditItems] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedAddCategory, setSelectedAddCategory] = useState(MENU_CATEGORIES[0].id);

  const fetchOrderStatus = async () => {
    if (!orderId || isEditModeRef.current) return;

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch order tracking status.');
      }

      setOrder(data.order);
      if (!isEditModeRef.current) {
        setEditName(data.order.customer_name || '');
        setEditPhone(data.order.phone || '');
        setEditHostel(data.order.hostel || HOSTEL_LIST[0]);
        setEditItems(data.order.items ? data.order.items.map(i => ({
          ...i,
          name: i.item_name || i.name,
          item_name: i.item_name || i.name,
          price: parseFloat(i.unit_price || i.price) || 0,
          unit_price: parseFloat(i.unit_price || i.price) || 0,
          quantity: parseInt(i.quantity) || 1
        })) : []);
      }
      setError('');
    } catch (err) {
      console.error('Polling tracker error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId && !isEditMode) {
      fetchOrderStatus();
      const interval = setInterval(fetchOrderStatus, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, orderId, isEditMode]);

  // Timer countdown for 3-minute edit window
  useEffect(() => {
    if (!order || !order.created_at || order.order_status !== 'pending') {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const createdAt = new Date(order.created_at).getTime();
      const elapsed = Math.floor((Date.now() - createdAt) / 1000);
      const remaining = Math.max(0, 180 - elapsed);
      setRemainingSeconds(remaining);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [order]);

  const editCalculations = useMemo(() => {
    let subtotal = 0;
    let biryaniParcel = 0;
    let halfPortionCount = 0;
    let fullPortionCount = 0;

    editItems.forEach(item => {
      const qty = parseInt(item.quantity) || 1;
      const price = parseFloat(item.price || item.unit_price) || 0;
      subtotal += price * qty;

      const itemName = (item.name || item.item_name || '').toLowerCase();
      const isBiryani = (item.category || '').toLowerCase() === 'biryani' || itemName.includes('biryani') || itemName.includes('biriyani');

      if (isBiryani) {
        biryaniParcel += 10 * qty;
      } else if (itemName.includes('2 pcs') || itemName.includes('2pcs')) {
        halfPortionCount += qty;
      } else {
        fullPortionCount += qty;
      }
    });

    const halfPortionParcel = Math.ceil(halfPortionCount / 2) * 5;
    const fullPortionParcel = fullPortionCount * 5;
    const parcelFee = biryaniParcel + halfPortionParcel + fullPortionParcel;

    let deliveryFee = 0;
    if (subtotal < 100) {
      deliveryFee = (editHostel === 'VVH Hostel' || editHostel === 'IGH Hostel') ? 20 : 10;
    }

    const total = subtotal + parcelFee + deliveryFee;
    return { subtotal, parcelFee, deliveryFee, total };
  }, [editItems, editHostel]);

  if (!isOpen || !orderId) return null;

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCancelOrder = async () => {
    if (!window.confirm(`Are you sure you want to cancel Order #${orderId}? This cannot be undone.`)) {
      return;
    }

    setCancelLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel order.');
      }

      await fetchOrderStatus();
      alert('Your order has been cancelled successfully.');
    } catch (err) {
      alert('Cancel Error: ' + err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUpdateItemQty = (itemName, delta) => {
    setEditItems(prev => {
      return prev
        .map(i => {
          if ((i.name || i.item_name) === itemName) {
            const newQty = (i.quantity || 1) + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const handleAddNewItem = (menuItem) => {
    const price = getItemPrice(menuItem);
    setEditItems(prev => {
      const existingIdx = prev.findIndex(i => (i.name || i.item_name) === menuItem.name);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], quantity: (next[existingIdx].quantity || 1) + 1 };
        return next;
      }
      return [
        ...prev,
        {
          name: menuItem.name,
          item_name: menuItem.name,
          price: price,
          unit_price: price,
          quantity: 1,
          category: menuItem.category
        }
      ];
    });
  };

  const handleSaveOrderChanges = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return alert('Name is required');
    if (editPhone.replace(/\D/g, '').length !== 10) return alert('Phone must be 10 digits');
    if (editItems.length === 0) return alert('Order must contain at least one item');

    setSaveLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/modify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: editName,
          phone: editPhone.replace(/\D/g, ''),
          hostel: editHostel,
          items: editItems
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to modify order.');
      }

      setOrder(data.order);
      setEditName(data.order.customer_name || '');
      setEditPhone(data.order.phone || '');
      setEditHostel(data.order.hostel || HOSTEL_LIST[0]);
      setEditItems(data.order.items ? data.order.items.map(i => ({
        ...i,
        name: i.item_name || i.name,
        item_name: i.item_name || i.name,
        price: parseFloat(i.unit_price || i.price) || 0,
        unit_price: parseFloat(i.unit_price || i.price) || 0,
        quantity: parseInt(i.quantity) || 1
      })) : []);
      setIsEditMode(false);
      alert('✅ Order & items updated successfully!');
    } catch (err) {
      alert('Edit Error: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const status = order.order_status;
    if (status === 'delivered') return 3;
    if (status === 'en_route') return 2;
    if (status === 'preparing') return 1;
    return 0;
  };

  const currentStep = getCurrentStepIndex();
  const isCancelled = order?.order_status === 'cancelled';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 120,
      display: 'grid',
      placeItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      padding: '14px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-modal)',
        padding: '20px',
        position: 'relative',
        animation: 'fadeIn 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Live Order Tracker
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Order #{orderId}
            </h3>
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

        {/* Cancelled Banner */}
        {isCancelled && (
          <div style={{
            backgroundColor: '#FFEBEE',
            border: '1px solid #FFCDD2',
            color: '#C62828',
            padding: '16px',
            borderRadius: '16px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>❌ Order Cancelled</p>
            <p style={{ fontSize: '0.825rem', marginTop: '4px' }}>This order has been cancelled and will not be prepared or delivered.</p>
          </div>
        )}

        {loading && !order ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.9rem' }}>Fetching live order updates...</p>
          </div>
        ) : order && !isCancelled ? (
          <div>
            {/* 3-Minute Edit & Cancel Banner (if pending & remaining > 0) */}
            {order.order_status === 'pending' && remainingSeconds > 0 && !isEditMode && (
              <div style={{
                backgroundColor: '#FFF3E0',
                border: '1px solid #FFE0B2',
                borderRadius: '16px',
                padding: '12px 14px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#E65100', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} /> 3-Min Window: {formatTimer(remainingSeconds)} left
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#B26A00', fontWeight: 600 }}>Active</span>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  You can add ANY dishes or cancel this order before kitchen preparation begins.
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(order.customer_name || '');
                      setEditPhone(order.phone || '');
                      setEditHostel(order.hostel || HOSTEL_LIST[0]);
                      setEditItems(order.items ? order.items.map(i => ({
                        ...i,
                        name: i.item_name || i.name,
                        item_name: i.item_name || i.name,
                        price: parseFloat(i.unit_price || i.price) || 0,
                        unit_price: parseFloat(i.unit_price || i.price) || 0,
                        quantity: parseInt(i.quantity) || 1
                      })) : []);
                      setIsEditMode(true);
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 8px rgba(230, 74, 25, 0.3)'
                    }}
                  >
                    <Edit3 size={14} /> Add Items / Edit
                  </button>

                  <button
                    type="button"
                    disabled={cancelLoading}
                    onClick={handleCancelOrder}
                    style={{
                      flex: 1,
                      backgroundColor: '#FFEBEE',
                      color: '#C62828',
                      border: '1px solid #FFCDD2',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <XCircle size={14} /> {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                </div>
              </div>
            )}

            {/* Edit Mode View */}
            {isEditMode ? (
              <form onSubmit={handleSaveOrderChanges} style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#FFFDF9', padding: '16px', borderRadius: '18px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                    Add Items &amp; Update Order
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
                  >
                    Cancel Edit
                  </button>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>Customer Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>Phone</label>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px' }}>Hostel</label>
                    <select
                      value={editHostel}
                      onChange={e => setEditHostel(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem', backgroundColor: '#FFF' }}
                    >
                      {HOSTEL_LIST.map((h, i) => <option key={i} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>

                {/* Items in Current Order */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>Current Order Items ({editItems.length})</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                    {editItems.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#C62828', textAlign: 'center', padding: '10px' }}>Your order is empty. Please add dishes below.</p>
                    ) : (
                      editItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', color: 'var(--text-main)' }}>{item.item_name || item.name}</span>
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>₹{item.price || item.unit_price} each</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button type="button" onClick={() => handleUpdateItemQty(item.item_name || item.name, -1)} style={{ color: 'var(--primary)', padding: '2px' }}><Minus size={14} /></button>
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                            <button type="button" onClick={() => handleUpdateItemQty(item.item_name || item.name, 1)} style={{ color: 'var(--primary)', padding: '2px' }}><Plus size={14} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* ALL Menu Items Selector */}
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>
                    + Add Any Dish from Menu:
                  </label>

                  {/* Category Pills */}
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }} className="no-scrollbar">
                    {MENU_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedAddCategory(cat.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.75rem',
                          fontWeight: selectedAddCategory === cat.id ? 700 : 500,
                          backgroundColor: selectedAddCategory === cat.id ? '#FFF3E0' : '#FFFFFF',
                          color: selectedAddCategory === cat.id ? 'var(--primary)' : 'var(--text-main)',
                          border: `1px solid ${selectedAddCategory === cat.id ? '#FFE0B2' : 'var(--border-color)'}`,
                          whiteSpace: 'nowrap',
                          flexShrink: 0
                        }}
                      >
                        {cat.icon} {cat.title}
                      </button>
                    ))}
                  </div>

                  {/* Dish List for selected category */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                    {MENU_CATEGORIES.find(c => c.id === selectedAddCategory)?.items.map(m => {
                      const effectivePrice = getItemPrice(m);
                      const isSoldOut = isItemOutOfStock(m.id);
                      const inOrderQty = editItems.find(i => (i.name || i.item_name) === m.name)?.quantity || 0;

                      return (
                        <div
                          key={m.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#FFFFFF',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #EDE4DC'
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{m.emoji} {m.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>₹{effectivePrice}</span>
                            {inOrderQty > 0 && (
                              <span style={{ fontSize: '0.68rem', backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '1px 6px', borderRadius: '6px', marginLeft: '6px', fontWeight: 700 }}>
                                {inOrderQty} in order
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={isSoldOut}
                            onClick={() => handleAddNewItem(m)}
                            style={{
                              backgroundColor: isSoldOut ? '#CCC' : 'var(--primary)',
                              color: '#FFFFFF',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: '0.725rem',
                              fontWeight: 700
                            }}
                          >
                            {isSoldOut ? 'Sold Out' : '+ ADD'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live Bill Summary */}
                <div style={{ backgroundColor: '#FAF7F2', borderRadius: '12px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>New Subtotal:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{editCalculations.subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Parcel Packaging:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{editCalculations.parcelFee}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Delivery Charge ({editHostel}):</span>
                    <span style={{ fontWeight: 700, color: editCalculations.deliveryFee === 0 ? '#2E7D32' : 'var(--primary)' }}>
                      {editCalculations.deliveryFee === 0 ? 'FREE (≥ ₹100)' : `₹${editCalculations.deliveryFee}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #DDD', paddingTop: '6px', fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>
                    <span>Updated Total Payable:</span>
                    <span>₹{editCalculations.total}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saveLoading || editItems.length === 0}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#FFF',
                    padding: '12px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    fontSize: '0.925rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(230, 74, 25, 0.35)'
                  }}
                >
                  <Save size={16} /> {saveLoading ? 'Updating Order...' : `Save Changes (Pay ₹${editCalculations.total})`}
                </button>
              </form>
            ) : (
              /* Delivery Destination Badge (Without Room Number) */
              <div style={{
                backgroundColor: '#FFF3E0',
                border: '1px solid #FFE0B2',
                borderRadius: '16px',
                padding: '12px 14px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivering to</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={15} color="var(--primary)" /> {order.hostel}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recipient</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{order.customer_name}</p>
                </div>
              </div>
            )}

            {/* Step Progression Timeline */}
            {!isEditMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', margin: '24px 0 20px 8px' }}>
                {STATUS_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isDone = idx < currentStep || (idx === currentStep && currentStep === 3);
                  const isCurrent = idx === currentStep && currentStep !== 3;

                  return (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div style={{
                          position: 'absolute',
                          left: '17px',
                          top: '36px',
                          bottom: '-18px',
                          width: '2px',
                          backgroundColor: idx < currentStep ? '#2E7D32' : 'var(--border-color)'
                        }} />
                      )}

                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        backgroundColor: isDone ? '#E8F5E9' : isCurrent ? '#FFF3E0' : 'var(--secondary)',
                        color: isDone ? '#2E7D32' : isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                        border: `2px solid ${isDone ? '#2E7D32' : isCurrent ? 'var(--primary)' : 'var(--border-color)'}`,
                        zIndex: 1,
                        boxShadow: isCurrent ? '0 0 0 4px rgba(230, 74, 25, 0.15)' : 'none'
                      }}>
                        {isDone ? <CheckCircle2 size={18} /> : <StepIcon size={18} className={isCurrent ? 'animate-pulse' : ''} />}
                      </div>

                      <div style={{ flex: 1, paddingTop: '4px' }}>
                        <p style={{
                          fontSize: '0.95rem',
                          fontWeight: isCurrent || isDone ? 700 : 500,
                          color: isCurrent ? 'var(--primary)' : isDone ? '#2E7D32' : 'var(--text-muted)'
                        }}>
                          {step.title}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bill Summary Drawer */}
            {!isEditMode && (
              <div style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: '16px',
                padding: '14px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Items in Order</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Payment: <strong style={{ textTransform: 'uppercase', color: order.payment_status === 'paid' ? '#2E7D32' : 'var(--primary)' }}>{order.payment_method} · {order.payment_status}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                      <span>{item.quantity}x {item.item_name || item.name}</span>
                      <span style={{ fontWeight: 600 }}>₹{(parseFloat(item.unit_price || item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Items Subtotal:</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Parcel Packaging:</span>
                    <span>₹{order.parcel_fee}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery ({order.hostel}):</span>
                    <span style={{ color: parseFloat(order.delivery_fee) === 0 ? '#2E7D32' : 'inherit', fontWeight: 600 }}>
                      {parseFloat(order.delivery_fee) === 0 ? 'FREE' : `₹${order.delivery_fee}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                    <span>Grand Total:</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
