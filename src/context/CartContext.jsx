import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState('Leaders Hostel');

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCartItems(prev => {
      return prev
        .map(i => {
          if (i.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const { subtotal, parcelFee, totalItemCount } = useMemo(() => {
    let sub = 0;
    let count = 0;
    let biryaniParcel = 0;
    let halfPortionCount = 0;
    let fullPortionCount = 0;

    cartItems.forEach(item => {
      sub += item.price * item.quantity;
      count += item.quantity;

      const itemName = (item.name || item.item_name || '').toLowerCase();
      const isBiryani = (item.category || '').toLowerCase() === 'biryani' || itemName.includes('biryani') || itemName.includes('biriyani');

      if (isBiryani) {
        biryaniParcel += 10 * item.quantity;
      } else if (itemName.includes('2 pcs') || itemName.includes('2pcs')) {
        // 2-pcs half portion items (e.g. 2 pcs bonda, 2 pcs vada fit together in 1 box)
        halfPortionCount += item.quantity;
      } else {
        fullPortionCount += item.quantity;
      }
    });

    const halfPortionParcel = Math.ceil(halfPortionCount / 2) * 5;
    const fullPortionParcel = fullPortionCount * 5;
    const parcel = biryaniParcel + halfPortionParcel + fullPortionParcel;

    return {
      subtotal: sub,
      parcelFee: parcel,
      totalItemCount: count
    };
  }, [cartItems]);

  const getDeliveryFee = (hostelName = selectedHostel, sub = subtotal) => {
    if (sub >= 100 || sub === 0) return 0;
    if (hostelName === 'VVH Hostel' || hostelName === 'IGH Hostel') {
      return 20;
    }
    return 10;
  };

  const deliveryFee = getDeliveryFee(selectedHostel, subtotal);
  const total = subtotal + parcelFee + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        selectedHostel,
        setSelectedHostel,
        getDeliveryFee,
        subtotal,
        parcelFee,
        deliveryFee,
        total,
        totalItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
