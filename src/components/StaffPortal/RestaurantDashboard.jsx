import React, { useState, useEffect } from 'react';
import { LogOut, RefreshCw, Filter, CheckCircle2, Clock, Bike, Phone, MapPin, AlertCircle, Flame, XCircle, ShieldCheck, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function RestaurantDashboard() {
  const { token, staffUser, logoutStaff } = useAuth();

  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'preparing' | 'en_route' | 'delivered'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const handleRefreshClick = async () => {
    setRefreshing(true);
    await fetchOrders();
    setTimeout(() => setRefreshing(false), 600);
  };

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const url = activeFilter === 'all'
        ? `${API_BASE_URL}/orders`
        : `${API_BASE_URL}/orders?status=${activeFilter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load restaurant orders.');
      }

      setOrders(data.orders || []);
      setError('');
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000);
    return () => clearInterval(interval);
  }, [token, activeFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order_status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status.');
      }

      await fetchOrders();
    } catch (err) {
      alert('Status Update Error: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyPayment = async (orderId) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/verify-payment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify payment.');
      }

      await fetchOrders();
    } catch (err) {
      alert('Payment Verification Error: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // KPI Metrics
  const pendingCount = orders.filter(o => o.order_status === 'pending').length;
  const preparingCount = orders.filter(o => o.order_status === 'preparing').length;
  const enRouteCount = orders.filter(o => o.order_status === 'en_route').length;
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '32px 16px'
    }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: '20px 24px',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-soft)',
        marginBottom: '24px',
        gap: '16px'
      }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Idly &amp; Idly Staff Kitchen Portal
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Hostel Live Orders Stream
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Logged in as <strong>{staffUser?.email || 'Staff User'}</strong> ({staffUser?.role || 'admin'})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: refreshing ? '#FFE0B2' : 'var(--secondary)',
              color: refreshing ? 'var(--primary)' : 'var(--secondary-foreground)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={refreshing || loading ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Stream'}
          </button>

          <button
            type="button"
            onClick={logoutStaff}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ backgroundColor: '#FFF3E0', padding: '16px', borderRadius: '16px', border: '1px solid #FFE0B2' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>New Pending Orders</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{pendingCount}</p>
        </div>
        <div style={{ backgroundColor: '#E3F2FD', padding: '16px', borderRadius: '16px', border: '1px solid #BBDEFB' }}>
          <p style={{ fontSize: '0.8rem', color: '#1976D2', fontWeight: 600 }}>Cooking in Kitchen</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1976D2' }}>{preparingCount}</p>
        </div>
        <div style={{ backgroundColor: '#F3E5F5', padding: '16px', borderRadius: '16px', border: '1px solid #E1BEE7' }}>
          <p style={{ fontSize: '0.8rem', color: '#7B1FA2', fontWeight: 600 }}>Out for Hostel Delivery</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#7B1FA2' }}>{enRouteCount}</p>
        </div>
        <div style={{ backgroundColor: '#E8F5E9', padding: '16px', borderRadius: '16px', border: '1px solid #C8E6C9' }}>
          <p style={{ fontSize: '0.8rem', color: '#388E3C', fontWeight: 600 }}>Total Revenue Recorded</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#388E3C' }}>₹{totalRevenue}</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: '#FFF8F0',
        padding: '6px',
        borderRadius: '9999px',
        border: '1px solid #F5E6D8',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'pending', label: 'New' },
          { id: 'preparing', label: 'Preparing' },
          { id: 'en_route', label: 'On the way' },
          { id: 'delivered', label: 'Delivered' }
        ].map(tab => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '8px 22px',
                borderRadius: '9999px',
                backgroundColor: isActive ? '#E54B2A' : 'transparent',
                color: isActive ? '#FFFFFF' : '#3E2723',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                border: 'none',
                boxShadow: isActive ? '0 3px 10px rgba(229, 75, 42, 0.35)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FFEBEE',
          color: '#C62828',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Stream List */}
      {orders.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '48px 24px',
          borderRadius: '20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No orders found for this filter tab.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>New customer orders placed from hostel rooms will appear here automatically.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => {
            const isPaid = order.payment_status === 'paid';
            const isUpi = order.payment_method === 'upi';

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-soft)'
                }}
              >
                {/* Order Header Row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingBottom: '14px',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <div>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      backgroundColor: '#FFF3E0',
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-pill)'
                    }}>
                      {order.id}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>
                      {order.created_at ? new Date(order.created_at).toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: isPaid ? '#E8F5E9' : '#FFF3E0',
                      color: isPaid ? '#2E7D32' : '#E65100',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {isUpi ? <QrCode size={13} /> : null}
                      {order.payment_method?.toUpperCase()} · {isPaid ? 'VERIFIED (PAID)' : 'PENDING'}
                    </span>

                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor:
                        order.order_status === 'delivered' ? '#E8F5E9' :
                        order.order_status === 'en_route' ? '#F3E5F5' :
                        order.order_status === 'preparing' ? '#E3F2FD' : '#FFF3E0',
                      color:
                        order.order_status === 'delivered' ? '#2E7D32' :
                        order.order_status === 'en_route' ? '#7B1FA2' :
                        order.order_status === 'preparing' ? '#1976D2' : '#E65100',
                      textTransform: 'capitalize'
                    }}>
                      Status: {order.order_status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Customer & Location Info */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                  margin: '14px 0'
                }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer</p>
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {order.customer_name}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={14} /> {order.phone}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivery Destination</p>
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={16} color="var(--primary)" /> {order.hostel}
                    </p>
                    {isUpi && (
                      <p style={{ fontSize: '0.8rem', color: '#E65100', fontWeight: 600, marginTop: '2px' }}>
                        UPI UTR No: <strong>{order.upi_utr || 'Not provided'}</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bill Breakdown</p>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>
                      Subtotal: ₹{order.subtotal} | Parcel: ₹{order.parcel_fee} | Delivery: <strong style={{ color: parseFloat(order.delivery_fee) > 0 ? 'var(--primary)' : '#2E7D32' }}>{parseFloat(order.delivery_fee) > 0 ? `₹${order.delivery_fee}` : 'FREE'}</strong>
                    </p>
                    <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                      Total Bill: ₹{order.total}
                    </p>
                  </div>
                </div>

                {/* Cooking Notes */}
                {order.notes && (
                  <div style={{
                    backgroundColor: '#FFFDE7',
                    border: '1px solid #FFF59D',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    color: '#F57F17',
                    marginBottom: '14px'
                  }}>
                    📝 <strong>Note:</strong> {order.notes}
                  </div>
                )}

                {/* Items Breakdown */}
                {order.items && order.items.length > 0 && (
                  <div style={{
                    backgroundColor: 'var(--secondary)',
                    padding: '12px',
                    borderRadius: '12px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Items to Prepare ({order.items.length}):
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {order.items.map((item, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: '#FFFFFF',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--text-main)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          {item.quantity}x {item.item_name} (₹{item.unit_price * item.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status & Payment Action Buttons */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '10px',
                  paddingTop: '12px',
                  borderTop: '1px dashed var(--border-color)'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Advance Order State:
                  </span>

                  {order.order_status === 'pending' && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      style={{
                        backgroundColor: '#E65100',
                        color: '#FFFFFF',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(230, 81, 0, 0.3)'
                      }}
                    >
                      <Flame size={16} /> Accept &amp; Start Preparing
                    </button>
                  )}

                  {order.order_status === 'preparing' && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleUpdateStatus(order.id, 'en_route')}
                      style={{
                        backgroundColor: '#7B1FA2',
                        color: '#FFFFFF',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(123, 31, 162, 0.3)'
                      }}
                    >
                      <Bike size={16} /> Dispatch Rider (Out for Delivery)
                    </button>
                  )}

                  {order.order_status === 'en_route' && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      style={{
                        backgroundColor: '#2E7D32',
                        color: '#FFFFFF',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)'
                      }}
                    >
                      <CheckCircle2 size={16} /> Mark Delivered &amp; Verify Payment
                    </button>
                  )}

                  {/* Manual Verify Payment Button if unpaid */}
                  {!isPaid && (
                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() => handleVerifyPayment(order.id)}
                      style={{
                        backgroundColor: '#FFF3E0',
                        color: '#E65100',
                        border: '1px solid #FFE0B2',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ShieldCheck size={15} /> Verify Payment Received
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
