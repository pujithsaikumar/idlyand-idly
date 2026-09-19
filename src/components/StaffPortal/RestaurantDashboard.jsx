import React, { useState, useEffect } from 'react';
import {
  LogOut, RefreshCw, CheckCircle2, Clock, Bike, Phone, MapPin, AlertCircle,
  Flame, ShieldCheck, QrCode, TrendingUp, DollarSign, ShoppingBag, BarChart2,
  Settings, Power, ToggleLeft, ToggleRight, Edit2, Check, Download, Printer,
  Store, AlertTriangle, ChevronRight, PieChart, Plus, Trash2, X, PlusCircle, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { MENU_CATEGORIES, HOSTEL_LIST } from '../../data/menuData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function RestaurantDashboard() {
  const { token, staffUser, logoutStaff } = useAuth();
  const {
    isStoreOpen, setIsStoreOpen,
    deliveryTimeEstimate, setDeliveryTimeEstimate,
    announcementText, setAnnouncementText,
    getItemPrice, updateItemPrice,
    isItemOutOfStock, toggleItemStock,
    customMenuItems, addMenuItem, deleteMenuItem, menuCategories
  } = useStore();

  const [activeMainTab, setActiveMainTab] = useState('orders'); // 'orders' | 'analytics' | 'settings'
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'preparing' | 'en_route' | 'delivered'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Settings tab editing state
  const [editingPriceItemId, setEditingPriceItemId] = useState(null);
  const [tempPriceInput, setTempPriceInput] = useState('');
  const [customAnnouncementInput, setCustomAnnouncementInput] = useState(announcementText);

  // Add Item Modal state (Admin)
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('tiffins');
  const [newItemPortion, setNewItemPortion] = useState('1 plate');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemEmoji, setNewItemEmoji] = useState('🥞');
  const [newItemBadge, setNewItemBadge] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) {
      alert('Please enter both item name and price.');
      return;
    }
    setIsAddingItem(true);
    try {
      await addMenuItem({
        name: newItemName.trim(),
        price: parseFloat(newItemPrice) || 0,
        category: newItemCategory,
        portion: newItemPortion.trim() || '1 portion',
        desc: newItemDesc.trim(),
        emoji: newItemEmoji || '🥞',
        badge: newItemBadge.trim()
      });
      setNewItemName('');
      setNewItemPrice('');
      setNewItemDesc('');
      setNewItemBadge('');
      setShowAddItemModal(false);
      alert(`Item "${newItemName}" added successfully and is now live for all students!`);
    } catch (err) {
      alert('Failed to add item: ' + err.message);
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}" from the live menu?`)) {
      await deleteMenuItem(itemId);
    }
  };

  const handleRefreshClick = async () => {
    setRefreshing(true);
    await fetchOrders(false);
    setTimeout(() => setRefreshing(false), 600);
  };

  const fetchOrders = async (isSilent = false) => {
    if (!token) return;
    if (!isSilent) setLoading(true);

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
      if (!isSilent) setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);
    const interval = setInterval(() => fetchOrders(true), 3500);
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

  // -------------------------------------------------------------
  // ANALYTICS COMPUTATIONS
  // -------------------------------------------------------------
  const totalOrdersCount = orders.length;
  const deliveredOrders = orders.filter(o => o.order_status === 'delivered');
  const pendingOrders = orders.filter(o => o.order_status === 'pending');
  const preparingOrders = orders.filter(o => o.order_status === 'preparing');
  const enRouteOrders = orders.filter(o => o.order_status === 'en_route');
  const cancelledOrders = orders.filter(o => o.order_status === 'cancelled');

  const totalRevenue = orders
    .filter(o => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  const deliveredRevenue = deliveredOrders
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  const averageOrderValue = deliveredOrders.length > 0
    ? Math.round(deliveredRevenue / deliveredOrders.length)
    : Math.round(totalRevenue / Math.max(1, totalOrdersCount - cancelledOrders.length));

  // Compute item sales ranking
  const itemSalesMap = {};
  orders.filter(o => o.order_status !== 'cancelled').forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const name = item.item_name || item.name;
        const qty = parseInt(item.quantity) || 1;
        const revenue = (parseFloat(item.unit_price) || 0) * qty;
        if (!itemSalesMap[name]) {
          itemSalesMap[name] = { name, quantity: 0, revenue: 0 };
        }
        itemSalesMap[name].quantity += qty;
        itemSalesMap[name].revenue += revenue;
      });
    }
  });

  const topSellingItems = Object.values(itemSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Compute hostel distribution
  const hostelOrdersMap = {};
  HOSTEL_LIST.forEach(h => { hostelOrdersMap[h] = { count: 0, revenue: 0 }; });
  orders.filter(o => o.order_status !== 'cancelled').forEach(order => {
    const h = order.hostel || 'Other';
    if (!hostelOrdersMap[h]) hostelOrdersMap[h] = { count: 0, revenue: 0 };
    hostelOrdersMap[h].count += 1;
    hostelOrdersMap[h].revenue += parseFloat(order.total || 0);
  });

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return alert('No orders to export.');
    const headers = ['Order ID', 'Date/Time', 'Customer', 'Phone', 'Hostel', 'Status', 'Payment Method', 'Payment Status', 'Total (INR)'];
    const rows = orders.map(o => [
      o.id,
      o.created_at ? new Date(o.created_at).toLocaleString() : '',
      `"${o.customer_name}"`,
      o.phone,
      `"${o.hostel}"`,
      o.order_status,
      o.payment_method,
      o.payment_status,
      o.total
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `idly_orders_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAdmin = staffUser?.role === 'admin';

  if (!token || !staffUser) {
    return (
      <div style={{
        maxWidth: '500px',
        margin: '60px auto',
        padding: '32px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-modal)'
      }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FFEBEE', color: '#C62828', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <AlertCircle size={24} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          🔒 Restricted Access
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          You must be an authorized staff member with a valid security token to view this page.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '24px 14px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: '18px 20px',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-soft)',
        marginBottom: '20px',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isAdmin ? '👑 Executive Admin Portal' : '🍳 Kitchen Staff Portal'}
            </span>
            <span style={{
              backgroundColor: isStoreOpen ? '#E8F5E9' : '#FFEBEE',
              color: isStoreOpen ? '#2E7D32' : '#C62828',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isStoreOpen ? '#2E7D32' : '#C62828' }} />
              {isStoreOpen ? 'KITCHEN OPEN' : 'KITCHEN CLOSED'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {isAdmin ? 'Admin Management & Operations Dashboard' : 'Hostel Live Orders & Kitchen Dispatch'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Logged in as <strong>{staffUser?.email}</strong> ({isAdmin ? 'Full Administrator' : 'Kitchen Staff'})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={refreshing || loading ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
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
              padding: '8px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.825rem',
              fontWeight: 700
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Tabs - ADMIN ONLY */}
      {isAdmin && (
        <div style={{
          display: 'flex',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          padding: '6px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-soft)',
          marginBottom: '24px',
          overflowX: 'auto'
        }} className="no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveMainTab('orders')}
            style={{
              flex: 1,
              minWidth: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: activeMainTab === 'orders' ? 'var(--primary)' : 'transparent',
              color: activeMainTab === 'orders' ? '#FFFFFF' : 'var(--text-main)',
              fontWeight: activeMainTab === 'orders' ? 800 : 600,
              fontSize: '0.875rem',
              boxShadow: activeMainTab === 'orders' ? '0 3px 10px rgba(230, 74, 25, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Flame size={16} />
            <span>Live Orders Stream</span>
            <span style={{
              fontSize: '0.725rem',
              backgroundColor: activeMainTab === 'orders' ? 'rgba(255,255,255,0.25)' : 'var(--secondary)',
              color: activeMainTab === 'orders' ? '#FFFFFF' : 'var(--text-main)',
              padding: '1px 6px',
              borderRadius: '999px'
            }}>
              {pendingOrders.length + preparingOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('analytics')}
            style={{
              flex: 1,
              minWidth: '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: activeMainTab === 'analytics' ? 'var(--primary)' : 'transparent',
              color: activeMainTab === 'analytics' ? '#FFFFFF' : 'var(--text-main)',
              fontWeight: activeMainTab === 'analytics' ? 800 : 600,
              fontSize: '0.875rem',
              boxShadow: activeMainTab === 'analytics' ? '0 3px 10px rgba(230, 74, 25, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart2 size={16} />
            <span>Daily Orders Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('settings')}
            style={{
              flex: 1,
              minWidth: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: activeMainTab === 'settings' ? 'var(--primary)' : 'transparent',
              color: activeMainTab === 'settings' ? '#FFFFFF' : 'var(--text-main)',
              fontWeight: activeMainTab === 'settings' ? 800 : 600,
              fontSize: '0.875rem',
              boxShadow: activeMainTab === 'settings' ? '0 3px 10px rgba(230, 74, 25, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Settings size={16} />
            <span>Price &amp; Store Controls</span>
          </button>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 1: LIVE ORDERS STREAM                                     */}
      {/* ============================================================= */}
      {activeMainTab === 'orders' && (
        <div className="animate-fade-in">
          {/* KPI Mini-Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <div style={{ backgroundColor: '#FFF3E0', padding: '14px', borderRadius: '16px', border: '1px solid #FFE0B2' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>New Pending</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>{pendingOrders.length}</p>
            </div>
            <div style={{ backgroundColor: '#E3F2FD', padding: '14px', borderRadius: '16px', border: '1px solid #BBDEFB' }}>
              <p style={{ fontSize: '0.75rem', color: '#1976D2', fontWeight: 700 }}>Cooking Now</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1976D2' }}>{preparingOrders.length}</p>
            </div>
            <div style={{ backgroundColor: '#F3E5F5', padding: '14px', borderRadius: '16px', border: '1px solid #E1BEE7' }}>
              <p style={{ fontSize: '0.75rem', color: '#7B1FA2', fontWeight: 700 }}>On the Way</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7B1FA2' }}>{enRouteOrders.length}</p>
            </div>
            <div style={{ backgroundColor: '#E8F5E9', padding: '14px', borderRadius: '16px', border: '1px solid #C8E6C9' }}>
              <p style={{ fontSize: '0.75rem', color: '#388E3C', fontWeight: 700 }}>Delivered Today</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#388E3C' }}>{deliveredOrders.length}</p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#FFF8F0',
            padding: '4px',
            borderRadius: '9999px',
            border: '1px solid #F5E6D8',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            marginBottom: '20px',
            overflowX: 'auto',
            width: '100%'
          }} className="no-scrollbar">
            {[
              { id: 'all', label: 'All Orders' },
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
                    padding: '6px 16px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#3E2723',
                    fontSize: '0.825rem',
                    fontWeight: isActive ? 800 : 600,
                    border: 'none',
                    boxShadow: isActive ? '0 2px 8px rgba(229, 75, 42, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Orders Stream List */}
          {orders.length === 0 ? (
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '40px 20px',
              borderRadius: '20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)'
            }}>
              <p style={{ fontSize: '1.05rem', fontWeight: 700 }}>No orders found for this tab.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Live student orders from hostel rooms will appear here automatically.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {orders.map(order => {
                const isPaid = order.payment_status === 'paid';
                const isUpi = (order.payment_method || '').toLowerCase() === 'upi' || Boolean(order.upi_utr);

                return (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1px solid var(--border-color)',
                      padding: '18px',
                      boxShadow: 'var(--shadow-soft)'
                    }}
                  >
                    {/* Order Header Row */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                      <div>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          color: 'var(--primary)',
                          backgroundColor: '#FFF3E0',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)'
                        }}>
                          {order.id}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString() : 'Just now'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: isPaid ? '#E8F5E9' : '#FFF3E0',
                          color: isPaid ? '#2E7D32' : '#E65100',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          {isUpi ? <QrCode size={12} /> : null}
                          {order.payment_method?.toUpperCase()} · {isPaid ? 'PAID' : 'PENDING'}
                        </span>

                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor:
                            order.order_status === 'delivered' ? '#E8F5E9' :
                            order.order_status === 'en_route' ? '#F3E5F5' :
                            order.order_status === 'preparing' ? '#E3F2FD' :
                            order.order_status === 'cancelled' ? '#FFEBEE' : '#FFF3E0',
                          color:
                            order.order_status === 'delivered' ? '#2E7D32' :
                            order.order_status === 'en_route' ? '#7B1FA2' :
                            order.order_status === 'preparing' ? '#1976D2' :
                            order.order_status === 'cancelled' ? '#C62828' : '#E65100',
                          textTransform: 'capitalize'
                        }}>
                          {order.order_status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Location Info */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '10px',
                      margin: '12px 0'
                    }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer</p>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                          {order.customer_name}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={13} /> {order.phone}
                        </p>
                      </div>

                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Destination</p>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={15} color="var(--primary)" /> {order.hostel}
                        </p>
                        {isUpi && (
                          <div style={{
                            marginTop: '6px',
                            backgroundColor: '#FFF3E0',
                            border: '1px solid #FFE0B2',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#E65100' }}>
                              📱 UTR:
                            </span>
                            <code style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1C1311', letterSpacing: '0.04em' }}>
                              {order.upi_utr || 'Not submitted'}
                            </code>
                          </div>
                        )}
                      </div>

                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bill</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>
                          Items: ₹{order.subtotal} | Parcel: ₹{order.parcel_fee} | Del: ₹{order.delivery_fee}
                        </p>
                        <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>
                          Total: ₹{order.total}
                        </p>
                      </div>
                    </div>

                    {/* Items Breakdown */}
                    {order.items && order.items.length > 0 && (
                      <div style={{
                        backgroundColor: 'var(--secondary)',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        marginBottom: '14px'
                      }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                          Items to Prepare:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {order.items.map((item, i) => (
                            <span
                              key={i}
                              style={{
                                backgroundColor: '#FFFFFF',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: 'var(--text-main)'
                              }}
                            >
                              {item.quantity}x {item.item_name || item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Action Buttons Bar */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      paddingTop: '12px',
                      borderTop: '1px dashed var(--border-color)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          Status Control:
                        </span>
                        {updatingId === order.id && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <RefreshCw size={12} className="animate-spin" /> Updating status...
                          </span>
                        )}
                      </div>

                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {/* 1. Accept / Preparing Button */}
                        <button
                          type="button"
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          style={{
                            backgroundColor: order.order_status === 'preparing' ? '#E65100' : '#FFF3E0',
                            color: order.order_status === 'preparing' ? '#FFFFFF' : '#E65100',
                            border: order.order_status === 'preparing' ? '1px solid #E65100' : '1px solid #FFE0B2',
                            padding: '7px 14px',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            boxShadow: order.order_status === 'preparing' ? '0 2px 6px rgba(230, 81, 0, 0.3)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Flame size={14} />
                          {order.order_status === 'preparing' ? '🍳 Preparing' : 'Accept & Prepare'}
                        </button>

                        {/* 2. On the Way / Out for Delivery Button */}
                        <button
                          type="button"
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'en_route')}
                          style={{
                            backgroundColor: order.order_status === 'en_route' ? '#7B1FA2' : '#F3E5F5',
                            color: order.order_status === 'en_route' ? '#FFFFFF' : '#7B1FA2',
                            border: order.order_status === 'en_route' ? '1px solid #7B1FA2' : '1px solid #E1BEE7',
                            padding: '7px 14px',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            boxShadow: order.order_status === 'en_route' ? '0 2px 6px rgba(123, 31, 162, 0.3)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Bike size={14} />
                          {order.order_status === 'en_route' ? '🛵 On the Way' : 'Dispatch / On the Way'}
                        </button>

                        {/* 3. Delivered Button */}
                        <button
                          type="button"
                          disabled={updatingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          style={{
                            backgroundColor: order.order_status === 'delivered' ? '#2E7D32' : '#E8F5E9',
                            color: order.order_status === 'delivered' ? '#FFFFFF' : '#2E7D32',
                            border: order.order_status === 'delivered' ? '1px solid #2E7D32' : '1px solid #C8E6C9',
                            padding: '7px 14px',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            boxShadow: order.order_status === 'delivered' ? '0 2px 6px rgba(46, 125, 50, 0.3)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <CheckCircle2 size={14} />
                          {order.order_status === 'delivered' ? '✓ Delivered' : 'Mark Delivered'}
                        </button>

                        {/* 4. Payment Verification Button / Badge */}
                        {!isPaid ? (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleVerifyPayment(order.id)}
                            style={{
                              backgroundColor: '#FFF8E1',
                              color: '#F57C00',
                              border: '1px solid #FFE082',
                              padding: '7px 12px',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <ShieldCheck size={14} /> Verify Payment
                          </button>
                        ) : (
                          <span style={{
                            backgroundColor: '#E8F5E9',
                            color: '#2E7D32',
                            border: '1px solid #C8E6C9',
                            padding: '7px 12px',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Check size={14} /> Payment Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: DAILY ORDERS ANALYTICS (ADMIN ONLY)                   */}
      {/* ============================================================= */}
      {isAdmin && activeMainTab === 'analytics' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Metric Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px'
          }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '18px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Revenue Today</span>
                <span style={{ padding: '6px', backgroundColor: '#E8F5E9', borderRadius: '10px', color: '#2E7D32' }}><DollarSign size={18} /></span>
              </div>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2E7D32', marginTop: '6px' }}>₹{totalRevenue}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From {totalOrdersCount - cancelledOrders.length} active orders</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '18px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Orders</span>
                <span style={{ padding: '6px', backgroundColor: '#FFF3E0', borderRadius: '10px', color: 'var(--primary)' }}><ShoppingBag size={18} /></span>
              </div>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>{totalOrdersCount}</p>
              <p style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 600 }}>{deliveredOrders.length} Delivered · {cancelledOrders.length} Cancelled</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '18px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Order Value (AOV)</span>
                <span style={{ padding: '6px', backgroundColor: '#E3F2FD', borderRadius: '10px', color: '#1976D2' }}><TrendingUp size={18} /></span>
              </div>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1976D2', marginTop: '6px' }}>₹{averageOrderValue}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average student basket</p>
            </div>
          </div>

          {/* 2-Column Analytics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {/* Top Selling Dishes Ranking */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={18} color="var(--primary)" /> Top 5 Selling Dishes
              </h3>

              {topSellingItems.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No dish data recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {topSellingItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAF7F2', padding: '10px 14px', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#FFF', fontSize: '0.75rem', fontWeight: 800, display: 'grid', placeItems: 'center' }}>
                          {idx + 1}
                        </span>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.name}</p>
                          <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{item.quantity} plates ordered</p>
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                        ₹{item.revenue}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hostel Distribution */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-soft)'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--primary)" /> Hostel Order Breakdown
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {HOSTEL_LIST.map((hostel, idx) => {
                  const data = hostelOrdersMap[hostel] || { count: 0, revenue: 0 };
                  return (
                    <div key={idx} style={{ backgroundColor: '#FAF7F2', padding: '10px', borderRadius: '12px', border: '1px solid #EDE4DC' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {hostel}
                      </p>
                      <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
                        {data.count} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>orders (₹{data.revenue})</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Export & Actions */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '16px 20px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700 }}>Export Daily Orders Summary</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Download full tabular data for accounts and kitchen logs.</p>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: 'var(--radius-pill)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 3px 10px rgba(230, 74, 25, 0.3)'
              }}
            >
              <Download size={16} /> Download CSV Report
            </button>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: PRICE SETTINGS & STORE CONTROLS (ADMIN ONLY)           */}
      {/* ============================================================= */}
      {isAdmin && activeMainTab === 'settings' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Store Open / Closed & Delivery Time Controls */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-soft)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {/* Kitchen Status Toggle */}
            <div style={{
              backgroundColor: isStoreOpen ? '#F1F8E9' : '#FFEBEE',
              border: `1px solid ${isStoreOpen ? '#C8E6C9' : '#FFCDD2'}`,
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: isStoreOpen ? '#2E7D32' : '#C62828' }}>
                  Live Store Availability
                </span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {isStoreOpen ? '🟢 Kitchen is Currently OPEN' : '🔴 Kitchen is CLOSED'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isStoreOpen ? 'Students can place orders freely.' : 'Checkout is disabled on user website.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsStoreOpen(!isStoreOpen)}
                style={{
                  backgroundColor: isStoreOpen ? '#C62828' : '#2E7D32',
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                <Power size={16} />
                {isStoreOpen ? 'Turn OFF Kitchen (Close Store)' : 'Turn ON Kitchen (Open Store)'}
              </button>
            </div>

            {/* Delivery Time Setting */}
            <div style={{
              backgroundColor: '#FAF7F2',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #EDE4DC',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>
                  Delivery Time Estimate Display
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  Currently: {deliveryTimeEstimate}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Reflected live on customer home page &amp; delivery banner.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['15–20 mins', '20–25 mins', '25–35 mins', '40–50 mins (Rush)'].map((timeOption) => (
                  <button
                    key={timeOption}
                    type="button"
                    onClick={() => setDeliveryTimeEstimate(timeOption)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.78rem',
                      fontWeight: deliveryTimeEstimate === timeOption ? 800 : 500,
                      backgroundColor: deliveryTimeEstimate === timeOption ? 'var(--primary)' : '#FFFFFF',
                      color: deliveryTimeEstimate === timeOption ? '#FFFFFF' : 'var(--text-main)',
                      border: `1px solid ${deliveryTimeEstimate === timeOption ? 'var(--primary)' : 'var(--border-color)'}`
                    }}
                  >
                    {timeOption}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Announcement Banner Editor */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '4px' }}>
              Top Announcement Banner Text
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Changes the top announcement marquee seen by all visiting students.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={customAnnouncementInput}
                onChange={e => setCustomAnnouncementInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem'
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setAnnouncementText(customAnnouncementInput);
                  alert('Top announcement banner updated live!');
                }}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                Save
              </button>
            </div>
          </div>

          {/* Live Menu Prices & Stock Manager */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Live Menu Prices &amp; Availability Manager
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Add new items, edit prices, or toggle items In-Stock / Sold-Out. Changes appear immediately on the customer menu.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddItemModal(true)}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  padding: '9px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 3px 10px rgba(230, 74, 25, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Add New Menu Item
              </button>
            </div>

            {/* Modal / Card to Add New Menu Item */}
            {showAddItemModal && (
              <div style={{
                backgroundColor: '#FFF8F0',
                border: '2px dashed var(--primary)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h5 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PlusCircle size={18} /> Create New Menu Item
                  </h5>
                  <button
                    type="button"
                    onClick={() => setShowAddItemModal(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateItem}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Item Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ghee Podi Idly"
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 50"
                        value={newItemPrice}
                        onChange={e => setNewItemPrice(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Category *</label>
                      <select
                        value={newItemCategory}
                        onChange={e => setNewItemCategory(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                      >
                        <option value="tiffins">🥞 Hot Tiffins &amp; Fritters</option>
                        <option value="dosas">🥘 Signature Crispy Dosas</option>
                        <option value="biryani">🍛 Weekend Biryani &amp; Specials</option>
                        <option value="beverages">🥤 Beverages &amp; Extra Chutneys</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Portion / Serving</label>
                      <input
                        type="text"
                        placeholder="e.g. 4 pcs, 1 plate"
                        value={newItemPortion}
                        onChange={e => setNewItemPortion(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Emoji Icon</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['🥞', '🥘', '🍛', '🥟', '🍩', '🌶️', '🥤', '☕'].map(em => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => setNewItemEmoji(em)}
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              backgroundColor: newItemEmoji === em ? 'var(--primary)' : '#FFFFFF',
                              border: '1px solid var(--border-color)',
                              cursor: 'pointer'
                            }}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Badge (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Chef Choice, New 🔥"
                        value={newItemBadge}
                        onChange={e => setNewItemBadge(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Description / Highlights</label>
                    <input
                      type="text"
                      placeholder="e.g. Tossed in house ground spicy podi and generous dollop of pure cow ghee."
                      value={newItemDesc}
                      onChange={e => setNewItemDesc(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddItemModal(false)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-color)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingItem}
                      style={{
                        padding: '8px 20px',
                        borderRadius: '8px',
                        backgroundColor: '#2E7D32',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Check size={16} /> {isAddingItem ? 'Adding...' : 'Publish to Live Menu'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {menuCategories.map(category => (
                <div key={category.id}>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                    {category.icon} {category.title} ({category.items.length})
                  </h5>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                    {category.items.map(item => {
                      const currentPrice = getItemPrice(item);
                      const isOutOfStock = isItemOutOfStock(item.id);
                      const isEditing = editingPriceItemId === item.id;
                      const isCustom = String(item.id).startsWith('custom_');

                      return (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: isOutOfStock ? '#FAFAFA' : '#FAF7F2',
                            border: `1px solid ${isCustom ? '#FFE0B2' : (isOutOfStock ? '#EEEEEE' : '#EDE4DC')}`,
                            padding: '10px 14px',
                            borderRadius: '12px',
                            opacity: isOutOfStock ? 0.65 : 1,
                            position: 'relative'
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1, marginRight: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.emoji} {item.name}
                              </p>
                              {isCustom && (
                                <span style={{ fontSize: '0.65rem', backgroundColor: '#FFF3E0', color: '#E65100', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                                  ✨ Added
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.725rem', color: isOutOfStock ? '#C62828' : '#2E7D32', fontWeight: 700 }}>
                              {isOutOfStock ? '🔴 SOLD OUT' : '🟢 IN STOCK'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            {isEditing ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>₹</span>
                                <input
                                  type="number"
                                  value={tempPriceInput}
                                  onChange={e => setTempPriceInput(e.target.value)}
                                  style={{ width: '60px', padding: '4px', borderRadius: '6px', border: '1px solid var(--primary)', fontSize: '0.85rem' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (tempPriceInput) updateItemPrice(item.id, tempPriceInput);
                                    setEditingPriceItemId(null);
                                  }}
                                  style={{ padding: '4px', backgroundColor: '#2E7D32', color: '#FFF', borderRadius: '6px' }}
                                >
                                  <Check size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPriceItemId(item.id);
                                  setTempPriceInput(currentPrice.toString());
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid var(--border-color)',
                                  padding: '4px 8px',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: 800,
                                  color: 'var(--primary)'
                                }}
                              >
                                ₹{currentPrice} <Edit2 size={11} color="var(--text-muted)" />
                              </button>
                            )}

                            {/* In-Stock / Sold-Out Toggle */}
                            <button
                              type="button"
                              onClick={() => toggleItemStock(item.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-pill)',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                backgroundColor: isOutOfStock ? '#E8F5E9' : '#FFEBEE',
                                color: isOutOfStock ? '#2E7D32' : '#C62828',
                                border: `1px solid ${isOutOfStock ? '#C8E6C9' : '#FFCDD2'}`
                              }}
                            >
                              {isOutOfStock ? 'In-Stock' : 'Sold-Out'}
                            </button>

                            {/* Delete custom item button */}
                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                title="Delete Item"
                                style={{
                                  padding: '4px 6px',
                                  borderRadius: '6px',
                                  backgroundColor: '#FFEBEE',
                                  border: '1px solid #FFCDD2',
                                  color: '#C62828',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
