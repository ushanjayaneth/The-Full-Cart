export type OrderStatus = 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  sinhalaName?: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  description: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  isFeatured?: boolean;
  freeDelivery?: boolean;
  unit?: string;
  sku: string;
}


export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  notes?: string;
}

export type PaymentMethod = 'cod' | 'whatsapp' | 'card' | 'bank_transfer';

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  trackingNumber: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  currencySymbol: string;
  currencyCode: string;
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  bannerNotice: string;
  enablePromoDiscount: boolean;
  promoCode: string;
  promoDiscountPercent: number;
}
