import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Product, Order, OrderStatus, StoreSettings } from '../types';

// Storage key for custom Firebase config in browser localStorage
const FIREBASE_CONFIG_STORAGE_KEY = 'the_full_cart_firebase_config_v1';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Check environment variables or saved localStorage config
export function getFirebaseConfig(): FirebaseConfigParams | null {
  try {
    // 1. Check localStorage first (allows setting via Admin UI without code edit)
    const localSaved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (parsed?.apiKey && parsed?.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read firebase config from localStorage', e);
  }

  // 2. Check import.meta.env
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId && envApiKey !== 'YOUR_API_KEY') {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

export function saveCustomFirebaseConfig(config: FirebaseConfigParams | null): void {
  if (!config) {
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
  } else {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}

// Singleton instances
let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export function getFirebaseDb(): Firestore | null {
  if (dbInstance) return dbInstance;

  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    dbInstance = getFirestore(appInstance);
    return dbInstance;
  } catch (err) {
    console.error('Failed to initialize Firebase app or Firestore:', err);
    return null;
  }
}

// ==========================================
// FIRESTORE COLLECTIONS & DOCUMENT HELPERS
// ==========================================

const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SETTINGS: 'settings',
};

// 1. PRODUCTS SUBSCRIPTION & MUTATIONS
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    return onSnapshot(
      productsRef,
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      (err) => {
        console.error('Firestore products subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to products:', err);
    return null;
  }
}

export async function saveProductToDb(product: Product): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase is not configured');

  const { id, ...data } = product;
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await setDoc(docRef, data, { merge: true });
}

export async function deleteProductFromDb(productId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase is not configured');

  const docRef = doc(db, COLLECTIONS.PRODUCTS, productId);
  await deleteDoc(docRef);
}

// 2. ORDERS SUBSCRIPTION & MUTATIONS
export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
        });
        onUpdate(list);
      },
      (err) => {
        console.error('Firestore orders subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to orders:', err);
    return null;
  }
}

export async function createOrderInDb(order: Order): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase is not configured');

  const { id, ...data } = order;
  const docRef = doc(db, COLLECTIONS.ORDERS, id);
  await setDoc(docRef, data);
}

export async function updateOrderStatusInDb(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase is not configured');

  const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
  const payload: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (trackingNumber) {
    payload.trackingNumber = trackingNumber;
  }
  await updateDoc(docRef, payload);
}

export async function deleteOrderFromDb(orderId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase is not configured');

  const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await deleteDoc(docRef);
}

// 3. STORE SETTINGS SUBSCRIPTION & MUTATIONS
export function subscribeToSettings(
  onUpdate: (settings: StoreSettings) => void,
  onError?: (error: Error) => void
): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'general');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as StoreSettings);
        }
      },
      (err) => {
        console.error('Firestore settings subscription error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.error('Failed to subscribe to settings:', err);
    return null;
  }
}

export async function saveSettingsToDb(settings: StoreSettings): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase is not configured');

  const docRef = doc(db, COLLECTIONS.SETTINGS, 'general');
  await setDoc(docRef, settings, { merge: true });
}

// 4. SEED DEMO DATA TO FIREBASE (ONE-CLICK POPULATE)
export async function seedInitialDataToFirebase(
  products: Product[],
  settings: StoreSettings,
  orders?: Order[]
): Promise<{ productsUploaded: number; ordersUploaded: number }> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase is not configured. Please check your credentials.');

  let productsUploaded = 0;
  for (const prod of products) {
    const { id, ...data } = prod;
    await setDoc(doc(db, COLLECTIONS.PRODUCTS, id), data, { merge: true });
    productsUploaded++;
  }

  await setDoc(doc(db, COLLECTIONS.SETTINGS, 'general'), settings, { merge: true });

  let ordersUploaded = 0;
  if (orders && orders.length > 0) {
    for (const ord of orders) {
      const { id, ...data } = ord;
      await setDoc(doc(db, COLLECTIONS.ORDERS, id), data, { merge: true });
      ordersUploaded++;
    }
  }

  return { productsUploaded, ordersUploaded };
}
