import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MENU_CATEGORIES } from '../data/menuData';
import { API_BASE_URL } from '../config/api';

const StoreContext = createContext();
const STORAGE_KEY_SETTINGS = 'idly_store_settings_v1';
const STORAGE_KEY_PRICES = 'idly_custom_prices_v1';
const STORAGE_KEY_OUT_OF_STOCK = 'idly_out_of_stock_v1';
const STORAGE_KEY_CUSTOM_ITEMS = 'idly_custom_items_v1';

export function StoreProvider({ children }) {
  // Store status: Open / Closed
  const [isStoreOpen, setIsStoreOpenState] = useState(() => {
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
  const [deliveryTimeEstimate, setDeliveryTimeEstimateState] = useState(() => {
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
  const [announcementText, setAnnouncementTextState] = useState(() => {
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
  const [customPrices, setCustomPricesState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PRICES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  // Out of stock item IDs: ['t1', 'd3']
  const [outOfStockItemIds, setOutOfStockItemIdsState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OUT_OF_STOCK);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Dynamic Custom Menu Items created by Admin: []
  const [customMenuItems, setCustomMenuItemsState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_ITEMS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Sync settings with Backend API in real-time
  const fetchRemoteSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/store`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          if (data.settings.isStoreOpen !== undefined) setIsStoreOpenState(data.settings.isStoreOpen);
          if (data.settings.deliveryTimeEstimate) setDeliveryTimeEstimateState(data.settings.deliveryTimeEstimate);
          if (data.settings.announcementText) setAnnouncementTextState(data.settings.announcementText);
          if (data.settings.customPrices) {
            setCustomPricesState(data.settings.customPrices);
            localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(data.settings.customPrices));
          }
          if (data.settings.outOfStockItemIds) {
            setOutOfStockItemIdsState(data.settings.outOfStockItemIds);
            localStorage.setItem(STORAGE_KEY_OUT_OF_STOCK, JSON.stringify(data.settings.outOfStockItemIds));
          }
          if (Array.isArray(data.settings.customMenuItems)) {
            setCustomMenuItemsState(data.settings.customMenuItems);
            localStorage.setItem(STORAGE_KEY_CUSTOM_ITEMS, JSON.stringify(data.settings.customMenuItems));
          }
        }
      }
    } catch (e) {
      // Quietly use local cache on offline
    }
  }, []);

  useEffect(() => {
    fetchRemoteSettings();
    const interval = setInterval(fetchRemoteSettings, 5000);
    return () => clearInterval(interval);
  }, [fetchRemoteSettings]);

  // Helper to push updates to backend
  const pushUpdateToBackend = async (partialUpdate) => {
    try {
      const token = localStorage.getItem('idly_staff_token');
      await fetch(`${API_BASE_URL}/store`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(partialUpdate)
      });
    } catch (e) {
      console.warn('Sync to backend warning:', e);
    }
  };

  // Updaters
  const setIsStoreOpen = (val) => {
    setIsStoreOpenState(val);
    pushUpdateToBackend({ isStoreOpen: val });
  };

  const setDeliveryTimeEstimate = (val) => {
    setDeliveryTimeEstimateState(val);
    pushUpdateToBackend({ deliveryTimeEstimate: val });
  };

  const setAnnouncementText = (val) => {
    setAnnouncementTextState(val);
    pushUpdateToBackend({ announcementText: val });
  };

  const updateStoreSettings = (newSettings) => {
    if (newSettings.isStoreOpen !== undefined) setIsStoreOpenState(newSettings.isStoreOpen);
    if (newSettings.deliveryTimeEstimate !== undefined) setDeliveryTimeEstimateState(newSettings.deliveryTimeEstimate);
    if (newSettings.announcementText !== undefined) setAnnouncementTextState(newSettings.announcementText);
    pushUpdateToBackend(newSettings);
  };

  const updateItemPrice = (itemId, newPrice) => {
    const parsed = parseFloat(newPrice) || 0;
    const nextPrices = { ...customPrices, [itemId]: parsed };
    setCustomPricesState(nextPrices);
    localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(nextPrices));
    pushUpdateToBackend({ customPrices: nextPrices });
  };

  const toggleItemStock = (itemId) => {
    const nextStock = outOfStockItemIds.includes(itemId)
      ? outOfStockItemIds.filter(id => id !== itemId)
      : [...outOfStockItemIds, itemId];
    setOutOfStockItemIdsState(nextStock);
    localStorage.setItem(STORAGE_KEY_OUT_OF_STOCK, JSON.stringify(nextStock));
    pushUpdateToBackend({ outOfStockItemIds: nextStock });
  };

  // Add a brand new custom menu item (Admin)
  const addMenuItem = async (itemData) => {
    try {
      const token = localStorage.getItem('idly_staff_token');
      const res = await fetch(`${API_BASE_URL}/store/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(itemData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add item');
      }
      if (data.settings && Array.isArray(data.settings.customMenuItems)) {
        setCustomMenuItemsState(data.settings.customMenuItems);
        localStorage.setItem(STORAGE_KEY_CUSTOM_ITEMS, JSON.stringify(data.settings.customMenuItems));
      }
      return data;
    } catch (err) {
      console.error('addMenuItem error:', err);
      // Fallback local creation
      const localItem = {
        id: `custom_${Date.now()}`,
        ...itemData,
        price: parseFloat(itemData.price) || 0
      };
      const nextList = [localItem, ...customMenuItems];
      setCustomMenuItemsState(nextList);
      localStorage.setItem(STORAGE_KEY_CUSTOM_ITEMS, JSON.stringify(nextList));
      pushUpdateToBackend({ customMenuItems: nextList });
      return { success: true, item: localItem };
    }
  };

  // Delete a custom menu item (Admin)
  const deleteMenuItem = async (itemId) => {
    try {
      const token = localStorage.getItem('idly_staff_token');
      const res = await fetch(`${API_BASE_URL}/store/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data.settings && Array.isArray(data.settings.customMenuItems)) {
        setCustomMenuItemsState(data.settings.customMenuItems);
        localStorage.setItem(STORAGE_KEY_CUSTOM_ITEMS, JSON.stringify(data.settings.customMenuItems));
      } else {
        const nextList = customMenuItems.filter(i => i.id !== itemId);
        setCustomMenuItemsState(nextList);
        localStorage.setItem(STORAGE_KEY_CUSTOM_ITEMS, JSON.stringify(nextList));
      }
      return data;
    } catch (err) {
      console.error('deleteMenuItem error:', err);
      const nextList = customMenuItems.filter(i => i.id !== itemId);
      setCustomMenuItemsState(nextList);
      localStorage.setItem(STORAGE_KEY_CUSTOM_ITEMS, JSON.stringify(nextList));
      pushUpdateToBackend({ customMenuItems: nextList });
    }
  };

  // Dynamically compute merged categories (Base MENU_CATEGORIES + customMenuItems)
  const menuCategories = React.useMemo(() => {
    return MENU_CATEGORIES.map(category => {
      const addedForCategory = customMenuItems.filter(item => {
        const catId = (item.category || '').toLowerCase();
        return catId === category.id.toLowerCase() ||
               (catId === 'tiffin' && category.id === 'tiffins') ||
               (catId === 'dosa' && category.id === 'dosas') ||
               (catId === 'drinks' && category.id === 'beverages');
      });

      return {
        ...category,
        items: [...addedForCategory, ...category.items]
      };
    });
  }, [customMenuItems]);

  // Helper to get effective price of an item
  const getItemPrice = (item) => {
    if (item && item.id && customPrices[item.id] !== undefined) {
      return customPrices[item.id];
    }
    return item?.price || 0;
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
        customMenuItems,
        addMenuItem,
        deleteMenuItem,
        menuCategories,
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
