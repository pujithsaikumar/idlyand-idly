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
    let parcel = 0;
    let count = 0;

    cartItems.forEach(item => {
      sub += item.price * item.quantity;
      count += item.quantity;

      const isBiryani = item.category === 'Biryani' || item.name.toLowerCase().includes('biriyani');
      const itemParcelRate = isBiryani ? 10 : 5;
      parcel += itemParcelRate * item.quantity;
    });

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
