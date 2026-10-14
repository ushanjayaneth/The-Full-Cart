import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Product, CartItem, Order, OrderStatus, StoreSettings, CustomerInfo, PaymentMethod } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SETTINGS } from '../data/initialData';
import confetti from 'canvas-confetti';
import {
  isFirebaseConfigured,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToSettings,
  saveProductToDb,
  deleteProductFromDb,
  createOrderInDb,
  updateOrderStatusInDb,
  deleteOrderFromDb,
  saveSettingsToDb,
  seedInitialDataToFirebase,
} from '../services/firebase';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  settings: StoreSettings;
  selectedCategory: string;
  searchQuery: string;
  cartOpen: boolean;
  checkoutOpen: boolean;
  trackOrderOpen: boolean;
  adminView: boolean;
  activeAdminTab: 'overview' | 'orders' | 'inventory' | 'settings';
  selectedProductForModal: Product | null;
  lastPlacedOrder: Order | null;
  appliedPromo: string;
  promoDiscount: number;
  cartSubtotal: number;
  deliveryFee: number;
  cartTotal: number;
  cartCount: number;

  // Firebase status
  isFirebaseConnected: boolean;
  firebaseStatus: 'connected' | 'offline_fallback' | 'loading';
  seedToFirebase: () => Promise<{ productsUploaded: number; ordersUploaded: number }>;

  // Actions
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (q: string) => void;
  setCartOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;
  setTrackOrderOpen: (open: boolean) => void;
  setAdminView: (view: boolean) => void;
  setActiveAdminTab: (tab: 'overview' | 'orders' | 'inventory' | 'settings') => void;
  setSelectedProductForModal: (prod: Product | null) => void;
  setLastPlacedOrder: (ord: Order | null) => void;

  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;

  placeOrder: (customer: CustomerInfo, paymentMethod: PaymentMethod) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  resetStoreData: () => void;
  findOrder: (query: string) => Order | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'the_full_cart_products_v1',
  ORDERS: 'the_full_cart_orders_v1',
  SETTINGS: 'the_full_cart_settings_v1',
  CART: 'the_full_cart_cart_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load products from localStorage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Load orders (filtering out any old demo orders)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!saved) return [];
      const parsed: Order[] = JSON.parse(saved);
      return parsed.filter((o) => !o.id.startsWith('ord-100'));
    } catch {
      return [];
    }
  });

  // Load settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsed = saved ? JSON.parse(saved) : {};
      const merged = { ...INITIAL_SETTINGS, ...parsed };
      if (!merged.whatsappNumber || merged.whatsappNumber === '94771234567') {
        merged.whatsappNumber = '94776338514';
      }
      return merged;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Firebase connection state
  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'offline_fallback' | 'loading'>('loading');
  const isFirebaseConnected = firebaseStatus === 'connected';

  // Navigation & UI state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [trackOrderOpen, setTrackOrderOpen] = useState<boolean>(false);
  const [adminView, setAdminView] = useState<boolean>(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'orders' | 'inventory' | 'settings'>('overview');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<string>('');

  // Ref to track if initial data was synced
  const hasSyncedWithFirebase = useRef(false);

  // 1. SETUP FIREBASE REAL-TIME SUBSCRIPTIONS
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setFirebaseStatus('offline_fallback');
      return;
    }

    try {
      // Subscribe to Products
      const unsubProducts = subscribeToProducts((cloudProducts) => {
        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
          setFirebaseStatus('connected');
          hasSyncedWithFirebase.current = true;
        }
      });

      // Subscribe to Orders
      const unsubOrders = subscribeToOrders((cloudOrders) => {
        if (cloudOrders) {
          setOrders(cloudOrders);
          setFirebaseStatus('connected');
        }
      });

      // Subscribe to Settings
      const unsubSettings = subscribeToSettings((cloudSettings) => {
        if (cloudSettings) {
          setSettings(cloudSettings);
          setFirebaseStatus('connected');
        }
      });

      setFirebaseStatus('connected');

      return () => {
        if (unsubProducts) unsubProducts();
        if (unsubOrders) unsubOrders();
        if (unsubSettings) unsubSettings();
      };
    } catch (err) {
      console.warn('Firebase sync initialization warning:', err);
      setFirebaseStatus('offline_fallback');
    }
  }, []);

  // Persist to localStorage on change (Acts as instant local cache & offline fallback)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Financial calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const promoDiscount =
    appliedPromo && settings.enablePromoDiscount
      ? Math.round((cartSubtotal * settings.promoDiscountPercent) / 100)
      : 0;

  const deliveryFee =
    cartSubtotal === 0 || cartSubtotal >= settings.freeDeliveryThreshold
      ? 0
      : settings.deliveryFee;

  const cartTotal = Math.max(0, cartSubtotal - promoDiscount + deliveryFee);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo('');
  };

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === settings.promoCode.toUpperCase() && settings.enablePromoDiscount) {
      setAppliedPromo(clean);
      return { success: true, message: `Promo code applied! ${settings.promoDiscountPercent}% discount added.` };
    }
    return { success: false, message: 'Invalid or expired promo code.' };
  };

  const removePromoCode = () => {
    setAppliedPromo('');
  };

  // Place Order (With Firebase Cloud sync)
  const placeOrder = async (customer: CustomerInfo, paymentMethod: PaymentMethod): Promise<Order> => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TFC-${randNum}`;
    const trackingNumber = `DOM-${Math.floor(100000 + Math.random() * 900000)}-LK`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customer,
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee,
      discount: promoDiscount,
      total: cartTotal,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingNumber,
      notes: customer.notes || 'Order received through online storefront.',
    };

    // 1. Deduct stock locally
    const updatedProducts = products.map((prod) => {
      const itemInCart = cart.find((c) => c.product.id === prod.id);
      if (itemInCart) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - itemInCart.quantity),
        };
      }
      return prod;
    });
    setProducts(updatedProducts);

    // 2. Save order locally
    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);

    // 3. Sync to Firebase Cloud if connected
    if (isFirebaseConfigured()) {
      try {
        await createOrderInDb(newOrder);
        // Also update deducted stock in Firebase for the purchased items
        for (const item of cart) {
          const matched = updatedProducts.find((p) => p.id === item.product.id);
          if (matched) {
            await saveProductToDb(matched);
          }
        }
      } catch (err) {
        console.error('Failed to sync new order to Firebase Cloud:', err);
      }
    }

    // Celebrate with confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log(e);
    }

    clearCart();
    setCheckoutOpen(false);

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, notes?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status,
            updatedAt: new Date().toISOString(),
            notes: notes !== undefined ? notes : ord.notes,
          };
        }
        return ord;
      })
    );

    if (isFirebaseConfigured()) {
      try {
        await updateOrderStatusInDb(orderId, status);
      } catch (err) {
        console.error('Failed to update order status in Firebase:', err);
      }
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));

    if (isFirebaseConfigured()) {
      try {
        await deleteOrderFromDb(orderId);
      } catch (err) {
        console.error('Failed to delete order from Firebase:', err);
      }
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);

    if (isFirebaseConfigured()) {
      try {
        await saveProductToDb(newProd);
      } catch (err) {
        console.error('Failed to save new product to Firebase:', err);
      }
    }
    return newProd;
  };

  const updateProduct = async (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    if (isFirebaseConfigured()) {
      try {
        await saveProductToDb(updated);
      } catch (err) {
        console.error('Failed to update product in Firebase:', err);
      }
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    if (isFirebaseConfigured()) {
      try {
        await deleteProductFromDb(productId);
      } catch (err) {
        console.error('Failed to delete product from Firebase:', err);
      }
    }
  };

  const updateSettings = async (newSet: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSet };
    setSettings(updated);

    if (isFirebaseConfigured()) {
      try {
        await saveSettingsToDb(updated);
      } catch (err) {
        console.error('Failed to save settings to Firebase:', err);
      }
    }
  };

  const resetStoreData = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
    setAppliedPromo('');
  };

  // Seed demo data to Firebase with 1-click
  const seedToFirebase = async () => {
    const result = await seedInitialDataToFirebase(products, settings, orders);
    setFirebaseStatus('connected');
    return result;
  };

  const findOrder = (query: string): Order | undefined => {
    const q = query.trim().toLowerCase();
    if (!q) return undefined;
    return orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === q ||
        o.trackingNumber.toLowerCase() === q ||
        o.customer.phone.replace(/\D/g, '') === q.replace(/\D/g, '') ||
        o.customer.whatsapp.replace(/\D/g, '') === q.replace(/\D/g, '')
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        cart,
        settings,
        selectedCategory,
        searchQuery,
        cartOpen,
        checkoutOpen,
        trackOrderOpen,
        adminView,
        activeAdminTab,
        selectedProductForModal,
        lastPlacedOrder,
        appliedPromo,
        promoDiscount,
        cartSubtotal,
        deliveryFee,
        cartTotal,
        cartCount,

        isFirebaseConnected,
        firebaseStatus,
        seedToFirebase,

        setSelectedCategory,
        setSearchQuery,
        setCartOpen,
        setCheckoutOpen,
        setTrackOrderOpen,
        setAdminView,
        setActiveAdminTab,
        setSelectedProductForModal,
        setLastPlacedOrder,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        applyPromoCode,
        removePromoCode,

        placeOrder,
        updateOrderStatus,
        deleteOrder,

        addProduct,
        updateProduct,
        deleteProduct,
        updateSettings,
        resetStoreData,
        findOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
