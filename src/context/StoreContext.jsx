import React, { createContext, useContext, useState, useEffect } from 'react';
import { MENU_CATEGORIES } from '../data/menuData';

const StoreContext = createContext();

const STORAGE_KEY_SETTINGS = 'idly_store_settings_v1';
const STORAGE_KEY_PRICES = 'idly_custom_prices_v1';
const STORAGE_KEY_OUT_OF_STOCK = 'idly_out_of_stock_v1';

export function StoreProvider({ children }) {
  // Store status: Open / Closed
  const [isStoreOpen, setIsStoreOpen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.isStoreOpen !== undefined ? parsed.isStoreOpen : true;
      } catch (e) {}
    }
    return true;
  });

  // Delivery time estimate (e.g. "20–25 mins")
  const [deliveryTimeEstimate, setDeliveryTimeEstimate] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.deliveryTimeEstimate || '20–25 mins';
      } catch (e) {}
    }
    return '20–25 mins';
  });

  // Top banner custom announcement message
  const [announcementText, setAnnouncementText] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.announcementText || '⚡ 100% Free Hostel Delivery on orders ≥ ₹100';
      } catch (e) {}
    }
    return '⚡ 100% Free Hostel Delivery on orders ≥ ₹100';
  });

  // Custom live pricing overrides: { [itemId]: price }
  const [customPrices, setCustomPrices] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRICES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  // Out of stock item IDs: ['t1', 'd3']
  const [outOfStockItemIds, setOutOfStockItemIds] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OUT_OF_STOCK);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify({
      isStoreOpen,
      deliveryTimeEstimate,
      announcementText
    }));
  }, [isStoreOpen, deliveryTimeEstimate, announcementText]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(customPrices));
  }, [customPrices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OUT_OF_STOCK, JSON.stringify(outOfStockItemIds));
  }, [outOfStockItemIds]);

  const updateStoreSettings = (newSettings) => {
    if (newSettings.isStoreOpen !== undefined) setIsStoreOpen(newSettings.isStoreOpen);
    if (newSettings.deliveryTimeEstimate !== undefined) setDeliveryTimeEstimate(newSettings.deliveryTimeEstimate);
    if (newSettings.announcementText !== undefined) setAnnouncementText(newSettings.announcementText);
  };

  const updateItemPrice = (itemId, newPrice) => {
    setCustomPrices(prev => ({
      ...prev,
      [itemId]: parseFloat(newPrice) || 0
    }));
  };

  const toggleItemStock = (itemId) => {
    setOutOfStockItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Helper to get effective price of an item
  const getItemPrice = (item) => {
    if (customPrices[item.id] !== undefined) {
      return customPrices[item.id];
    }
    return item.price;
  };

  const isItemOutOfStock = (itemId) => {
    return outOfStockItemIds.includes(itemId);
  };

  return (
    <StoreContext.Provider
      value={{
        isStoreOpen,
        setIsStoreOpen,
        deliveryTimeEstimate,
        setDeliveryTimeEstimate,
        announcementText,
        setAnnouncementText,
        customPrices,
        updateItemPrice,
        outOfStockItemIds,
        toggleItemStock,
        getItemPrice,
        isItemOutOfStock,
        updateStoreSettings
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
