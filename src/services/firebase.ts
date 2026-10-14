import type { Product, Order, OrderStatus, StoreSettings } from '../types';

// Default Firebase Realtime Database URL provided by user
const DEFAULT_DATABASE_URL = 'https://the-full-cart-51c6c-default-rtdb.firebaseio.com';
const STORAGE_KEY_DB_URL = 'the_full_cart_rtdb_url_v1';

export function getDatabaseUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DB_URL);
    if (saved && saved.trim()) return saved.trim().replace(/\/+$/, '');
  } catch (e) {
    console.warn(e);
  }
  const envUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, '');
  return DEFAULT_DATABASE_URL;
}

export function saveDatabaseUrl(url: string): void {
  if (!url || !url.trim()) {
    localStorage.removeItem(STORAGE_KEY_DB_URL);
  } else {
    localStorage.setItem(STORAGE_KEY_DB_URL, url.trim().replace(/\/+$/, ''));
  }
}

export function isFirebaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

// Convert Firebase object map or array to array of items with ID
function parseFirebaseList<T extends { id: string }>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter(Boolean) as T[];
  }
  if (typeof raw === 'object') {
    const list: T[] = [];
    for (const [key, val] of Object.entries(raw as Record<string, T>)) {
      if (val && typeof val === 'object') {
        list.push({ ...val, id: val.id || key });
      }
    }
    return list;
  }
  return [];
}

// ==========================================
// 1. PRODUCTS REALTIME SUBSCRIPTION & MUTATIONS
// ==========================================

export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
): () => void {
  const dbUrl = getDatabaseUrl();
  let isClosed = false;

  // 1. Immediate initial fetch
  fetch(`${dbUrl}/products.json`)
    .then((res) => res.json())
    .then((data) => {
      if (!isClosed && data) {
        const list = parseFirebaseList<Product>(data);
        if (list.length > 0) {
          onUpdate(list);
        }
      }
    })
    .catch((err) => {
      console.warn('Initial products fetch error:', err);
      if (onError) onError(err);
    });

  // 2. Real-time stream using Server-Sent Events (SSE)
  let eventSource: EventSource | null = null;
  try {
    eventSource = new EventSource(`${dbUrl}/products.json`);

    eventSource.addEventListener('put', () => {
      try {
        fetch(`${dbUrl}/products.json`)
          .then((r) => r.json())
          .then((data) => {
            if (!isClosed && data) {
              const list = parseFirebaseList<Product>(data);
              if (list.length > 0) onUpdate(list);
            }
          });
      } catch (err) {
        console.warn('SSE put handler notice', err);
      }
    });

    eventSource.addEventListener('patch', () => {
      try {
        fetch(`${dbUrl}/products.json`)
          .then((r) => r.json())
          .then((data) => {
            if (!isClosed && data) {
              const list = parseFirebaseList<Product>(data);
              if (list.length > 0) onUpdate(list);
            }
          });
      } catch (err) {
        console.warn('SSE patch handler notice', err);
      }
    });

    eventSource.onerror = (err) => {
      // EventSource reconnects automatically on temporary drops
      console.warn('Products live stream reconnection notice', err);
    };
  } catch (err) {
    console.warn('SSE not supported or failed to initialize:', err);
  }

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
    }
  };
}

export async function saveProductToDb(product: Product): Promise<void> {
  const dbUrl = getDatabaseUrl();
  const res = await fetch(`${dbUrl}/products/${product.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    throw new Error(`Failed to save product to Firebase: ${res.statusText}`);
  }
}

export async function deleteProductFromDb(productId: string): Promise<void> {
  const dbUrl = getDatabaseUrl();
  const res = await fetch(`${dbUrl}/products/${productId}.json`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete product from Firebase: ${res.statusText}`);
  }
}

// ==========================================
// 2. ORDERS REALTIME SUBSCRIPTION & MUTATIONS
// ==========================================

export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (error: Error) => void
): () => void {
  const dbUrl = getDatabaseUrl();
  let isClosed = false;

  const fetchOrders = () => {
    fetch(`${dbUrl}/orders.json`)
      .then((res) => res.json())
      .then((data) => {
        if (!isClosed && data) {
          const list = parseFirebaseList<Order>(data);
          // Sort by createdAt descending
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(list);
        }
      })
      .catch((err) => {
        console.warn('Orders fetch error:', err);
        if (onError) onError(err);
      });
  };

  fetchOrders();

  let eventSource: EventSource | null = null;
  try {
    eventSource = new EventSource(`${dbUrl}/orders.json`);
    eventSource.addEventListener('put', fetchOrders);
    eventSource.addEventListener('patch', fetchOrders);
  } catch (err) {
    console.warn('Orders SSE stream notice:', err);
  }

  return () => {
    isClosed = true;
    if (eventSource) eventSource.close();
  };
}

export async function createOrderInDb(order: Order): Promise<void> {
  const dbUrl = getDatabaseUrl();
  const res = await fetch(`${dbUrl}/orders/${order.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) {
    throw new Error(`Failed to save order to Firebase: ${res.statusText}`);
  }
}

export async function updateOrderStatusInDb(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<void> {
  const dbUrl = getDatabaseUrl();
  const payload: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (trackingNumber) {
    payload.trackingNumber = trackingNumber;
  }
  const res = await fetch(`${dbUrl}/orders/${orderId}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to update order in Firebase: ${res.statusText}`);
  }
}

export async function deleteOrderFromDb(orderId: string): Promise<void> {
  const dbUrl = getDatabaseUrl();
  const res = await fetch(`${dbUrl}/orders/${orderId}.json`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete order from Firebase: ${res.statusText}`);
  }
}

// ==========================================
// 3. SETTINGS REALTIME SUBSCRIPTION & MUTATIONS
// ==========================================

export function subscribeToSettings(
  onUpdate: (settings: StoreSettings) => void,
  onError?: (error: Error) => void
): () => void {
  const dbUrl = getDatabaseUrl();
  let isClosed = false;

  const fetchSettings = () => {
    fetch(`${dbUrl}/settings.json`)
      .then((res) => res.json())
      .then((data) => {
        if (!isClosed && data && typeof data === 'object') {
          onUpdate(data as StoreSettings);
        }
      })
      .catch((err) => {
        console.warn('Settings fetch error:', err);
        if (onError) onError(err);
      });
  };

  fetchSettings();

  let eventSource: EventSource | null = null;
  try {
    eventSource = new EventSource(`${dbUrl}/settings.json`);
    eventSource.addEventListener('put', fetchSettings);
    eventSource.addEventListener('patch', fetchSettings);
  } catch (err) {
    console.warn('Settings SSE stream notice:', err);
  }

  return () => {
    isClosed = true;
    if (eventSource) eventSource.close();
  };
}

export async function saveSettingsToDb(settings: StoreSettings): Promise<void> {
  const dbUrl = getDatabaseUrl();
  const res = await fetch(`${dbUrl}/settings.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    throw new Error(`Failed to save settings to Firebase: ${res.statusText}`);
  }
}

// ==========================================
// 4. SEED INITIAL PRODUCTS TO FIREBASE (1-CLICK)
// ==========================================

export async function seedInitialDataToFirebase(
  products: Product[],
  settings: StoreSettings,
  orders?: Order[]
): Promise<{ productsUploaded: number; ordersUploaded: number }> {
  const dbUrl = getDatabaseUrl();

  // Convert array to dictionary with id keys for clean Firebase structure
  const productsMap: Record<string, Product> = {};
  for (const p of products) {
    productsMap[p.id] = p;
  }

  // Upload products
  const pRes = await fetch(`${dbUrl}/products.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productsMap),
  });
  if (!pRes.ok) throw new Error('Failed to seed products to Firebase');

  // Upload settings
  const sRes = await fetch(`${dbUrl}/settings.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!sRes.ok) throw new Error('Failed to seed settings to Firebase');

  // Upload initial orders
  let ordersUploaded = 0;
  if (orders && orders.length > 0) {
    const ordersMap: Record<string, Order> = {};
    for (const o of orders) {
      ordersMap[o.id] = o;
      ordersUploaded++;
    }
    await fetch(`${dbUrl}/orders.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ordersMap),
    });
  }

  return { productsUploaded: products.length, ordersUploaded };
}
