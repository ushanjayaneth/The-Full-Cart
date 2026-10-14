import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import type { Order, OrderStatus, Product } from '../../types';
import { InvoiceModal } from './InvoiceModal';
import { FirebaseConfigModal } from './FirebaseConfigModal';
import { processGalleryImage } from '../../utils/imageUpload';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Store,
  DollarSign,
  Plus,
  Printer,
  MessageCircle,
  Trash2,
  Edit2,
  Check,
  Search,
  Settings,
  RefreshCw,
  ShoppingBag,
  Upload,
  Image as ImageIcon,
  Database,
  LogOut,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const {
    orders,
    products,
    settings,
    updateOrderStatus,
    deleteOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
    resetStoreData,
    activeAdminTab,
    setActiveAdminTab,
    isFirebaseConnected,
    seedToFirebase,
  } = useStore();

  // Local states
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Firebase config & seed state
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  // Product Modal (Add / Edit)
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    sku: '',
    name: '',
    sinhalaName: '',
    category: 'electronics',
    price: 1000,
    originalPrice: 1500,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    description: '',
    rating: 5.0,
    reviewsCount: 1,
    badge: 'NEW',
    isFeatured: true,
    unit: 'Item',
  });

  // Settings local state
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // Financial statistics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus !== 'all' && o.status !== orderFilterStatus) {
      return false;
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchOrderNum = o.orderNumber.toLowerCase().includes(q);
      const matchCustomer = o.customer.name.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.includes(q);
      const matchCity = o.customer.city.toLowerCase().includes(q);
      if (!matchOrderNum && !matchCustomer && !matchPhone && !matchCity) {
        return false;
      }
    }
    return true;
  });

  // WhatsApp customer updater
  const handleWhatsAppCustomer = (order: Order) => {
    const statusText =
      order.status === 'pending'
        ? 'received and is pending verification'
        : order.status === 'processing'
        ? 'verified and is now being packed'
        : order.status === 'dispatched'
        ? `dispatched via courier (Tracking: ${order.trackingNumber})`
        : order.status === 'delivered'
        ? 'successfully delivered'
        : 'cancelled';

    const message = encodeURIComponent(
      `Hello ${order.customer.name}!\n\nThis is an update from *${settings.storeName}* regarding your Order *#${order.orderNumber}*.\n\nYour order status is now: *${statusText}*.\nTotal Payable (COD): ${settings.currencySymbol} ${order.total.toLocaleString()}.\n\nThank you for shopping with us!`
    );

    const waNum = order.customer.whatsapp || order.customer.phone;
    window.open(`https://wa.me/${waNum.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  // Open Product Modal
  const openAddProductModal = () => {
    setEditingProduct(null);
    setImageInputMode('upload');
    setProductForm({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      sinhalaName: '',
      category: 'electronics',
      price: 2500,
      originalPrice: 3200,
      stock: 15,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      description: 'High quality authentic product with warranty and fast delivery.',
      rating: 5.0,
      reviewsCount: 1,
      badge: 'NEW',
      isFeatured: true,
      unit: 'Piece',
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setImageInputMode(prod.image.startsWith('data:') ? 'upload' : 'url');
    setProductForm({ ...prod });
    setProductModalOpen(true);
  };

  // Gallery File Selection Handler
  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingImage(true);
      const optimizedDataUrl = await processGalleryImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.85,
      });
      setProductForm((prev) => ({ ...prev, image: optimizedDataUrl }));
    } catch (err: unknown) {
      alert((err as Error)?.message || 'Failed to process image');
    } finally {
      setIsCompressingImage(false);
      // Reset input value so same file can be picked again if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.image) {
      alert('Please upload an image or provide an image URL');
      return;
    }

    if (editingProduct) {
      await updateProduct({
        ...productForm,
        id: editingProduct.id,
      });
    } else {
      await addProduct(productForm);
    }
    setProductModalOpen(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Seed demo data to Firebase
  const handleSeedFirebase = async () => {
    if (!confirm('Sync products and settings to Google Firebase Cloud database now?')) {
      return;
    }
    setIsSeeding(true);
    try {
      const res = await seedToFirebase();
      setSeedNotice(`Success! Uploaded ${res.productsUploaded} products to Firebase Firestore.`);
      setTimeout(() => setSeedNotice(null), 4000);
    } catch (err: unknown) {
      alert('Firebase Sync failed: ' + ((err as Error)?.message || 'Check credentials'));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="admin-container">
      {/* Invoice Modal */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

      {/* Firebase Config Modal */}
      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onSaved={() => {}}
      />

      {/* Top Header Card */}
      <div className="admin-header-strip">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '9999px',
            }}>
              ADMIN MANAGEMENT PORTAL
            </span>

            {/* Firebase Live Status Pill */}
            <span
              onClick={() => setIsFirebaseModalOpen(true)}
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 10px',
                borderRadius: '9999px',
                background: isFirebaseConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isFirebaseConnected ? '#34d399' : '#fbbf24',
                border: `1px solid ${isFirebaseConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              }}
              title="Click to configure Firebase database"
            >
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isFirebaseConnected ? '#10b981' : '#f59e0b',
                display: 'inline-block',
                boxShadow: isFirebaseConnected ? '0 0 6px #10b981' : 'none',
              }} />
              {isFirebaseConnected ? 'Firebase Cloud Connected' : 'Local Mode (Click to setup Firebase)'}
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
            {settings.storeName} — Admin Hub
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Real-time control over customer orders, products catalog, stock, and store settings
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Firebase Setup Button */}
          <button
            className="btn-secondary"
            onClick={() => setIsFirebaseModalOpen(true)}
            style={{ fontSize: '0.84rem', padding: '8px 14px' }}
            title="Configure Google Firebase connection"
          >
            <Database size={15} style={{ color: '#f59e0b' }} />
            <span>Firebase DB</span>
          </button>

          {/* Open Live Storefront */}
          <button
            className="btn-secondary"
            onClick={() => window.open('/', '_blank')}
            style={{ fontSize: '0.84rem', padding: '8px 14px' }}
            title="Open customer storefront in a new tab"
          >
            <Store size={15} style={{ color: '#38bdf8' }} />
            <span>Live Store</span>
            <ExternalLink size={13} style={{ opacity: 0.7 }} />
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn-secondary"
              style={{
                fontSize: '0.84rem',
                padding: '8px 14px',
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}
              title="Log out of Admin Portal"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Cloud Seed Banner if Firebase connected */}
      {seedNotice && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle2 size={18} />
          <span>{seedNotice}</span>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="admin-tabs-nav">
        <button
          className={`admin-tab-btn ${activeAdminTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('overview')}
        >
          <TrendingUp size={16} />
          <span>Overview</span>
        </button>

        <button
          className={`admin-tab-btn ${activeAdminTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('orders')}
        >
          <Package size={16} />
          <span>Orders ({orders.length})</span>
          {pendingOrdersCount > 0 && (
            <span style={{
              background: '#f59e0b',
              color: '#78350f',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '9999px',
            }}>
              {pendingOrdersCount} new
            </span>
          )}
        </button>

        <button
          className={`admin-tab-btn ${activeAdminTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('inventory')}
        >
          <ShoppingBag size={16} />
          <span>Products & Stock ({products.length})</span>
          {lowStockCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '9999px',
            }}>
              {lowStockCount} low
            </span>
          )}
        </button>

        <button
          className={`admin-tab-btn ${activeAdminTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveAdminTab('settings')}
        >
          <Settings size={16} />
          <span>Store Settings</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Metrics 4 Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <DollarSign size={26} />
              </div>
              <div>
                <div className="metric-title">Total Sales Revenue</div>
                <div className="metric-val">{settings.currencySymbol} {totalRevenue.toLocaleString()}</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <Package size={26} />
              </div>
              <div>
                <div className="metric-title">Total Orders Placed</div>
                <div className="metric-val">{orders.length}</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <div className="metric-title">Pending Orders</div>
                <div className="metric-val" style={{ color: '#fbbf24' }}>{pendingOrdersCount}</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <div className="metric-title">Low Stock Alert</div>
                <div className="metric-val" style={{ color: lowStockCount > 0 ? '#f87171' : 'inherit' }}>
                  {lowStockCount}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Firebase Action Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(245, 158, 11, 0.08) 100%)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
              }}>
                <Database size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Firebase Cloud Database Sync</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {isFirebaseConnected
                    ? 'Connected to Google Firebase! Products and orders sync in real-time across devices.'
                    : 'Currently in local storage mode. Add your Firebase credentials to enable cloud sync.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {isFirebaseConnected && (
                <button
                  className="btn-secondary"
                  onClick={handleSeedFirebase}
                  disabled={isSeeding}
                  style={{ fontSize: '0.82rem', padding: '8px 16px' }}
                >
                  <Sparkles size={15} style={{ color: '#f59e0b' }} />
                  <span>{isSeeding ? 'Syncing...' : 'Sync All Data to Cloud'}</span>
                </button>
              )}
              <button
                className="btn-primary"
                onClick={() => setIsFirebaseModalOpen(true)}
                style={{ fontSize: '0.82rem', padding: '8px 16px' }}
              >
                <Settings size={15} />
                <span>{isFirebaseConnected ? 'Firebase Settings' : 'Connect Firebase'}</span>
              </button>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Recent Customer Orders</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Latest orders placed on your store</p>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setActiveAdminTab('orders')}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                View All Orders →
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Quick Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 800, color: '#a5b4fc' }}>{o.orderNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.customer.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{o.customer.city}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {settings.currencySymbol} {o.total.toLocaleString()}
                      </td>
                      <td>
                        <span className={`status-badge status-${o.status}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedInvoiceOrder(o)}
                            style={{ padding: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1' }}
                            title="Print Invoice"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => handleWhatsAppCustomer(o)}
                            style={{ padding: '6px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}
                            title="Chat with Customer"
                          >
                            <MessageCircle size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeAdminTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Filters & Search Bar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--bg-card)',
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Status pills */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['all', 'pending', 'processing', 'dispatched', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilterStatus(st)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      background: orderFilterStatus === st ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                      color: orderFilterStatus === st ? 'white' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Order Search */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Search customer, phone, order #..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ padding: '7px 10px 7px 32px', fontSize: '0.82rem' }}
                />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Customer & Address</th>
                  <th>Items Ordered</th>
                  <th>Amount</th>
                  <th>Status Workflow</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No orders found matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id}>
                      {/* Order info */}
                      <td>
                        <div style={{ fontWeight: 800, color: '#a5b4fc', fontSize: '0.95rem' }}>
                          {ord.orderNumber}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '2px' }}>
                          Track: {ord.trackingNumber}
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div style={{ fontWeight: 700 }}>{ord.customer.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          📞 {ord.customer.phone}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '220px' }}>
                          {ord.customer.address}, {ord.customer.city}
                        </div>
                      </td>

                      {/* Items */}
                      <td>
                        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {ord.items.map((it, idx) => (
                            <span key={idx}>
                              • {it.product.name} <strong>×{it.quantity}</strong>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Amount */}
                      <td>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                          {settings.currencySymbol} {ord.total.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700 }}>
                          {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'WhatsApp'}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td>
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="form-select"
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            borderRadius: '8px',
                            width: 'auto',
                            borderColor:
                              ord.status === 'delivered' ? '#10b981' :
                              ord.status === 'dispatched' ? '#a855f7' :
                              ord.status === 'processing' ? '#3b82f6' :
                              ord.status === 'pending' ? '#f59e0b' : '#ef4444',
                          }}
                        >
                          <option value="pending">🟡 Pending (New)</option>
                          <option value="processing">🔵 Processing (Packing)</option>
                          <option value="dispatched">🟣 Dispatched (Courier)</option>
                          <option value="delivered">🟢 Delivered (Cash In)</option>
                          <option value="cancelled">🔴 Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedInvoiceOrder(ord)}
                            className="header-btn"
                            style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                            title="Generate Printable Delivery Slip"
                          >
                            <Printer size={14} />
                            <span>Slip</span>
                          </button>

                          <button
                            onClick={() => handleWhatsAppCustomer(ord)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: 'rgba(34, 197, 94, 0.15)',
                              color: '#4ade80',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                            title="Chat with Customer via WhatsApp"
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete order ${ord.orderNumber}?`)) {
                                deleteOrder(ord.id);
                              }
                            }}
                            style={{ padding: '6px', color: '#f87171' }}
                            title="Delete order"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT INVENTORY */}
      {activeAdminTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Product Catalog & Inventory</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Add products from device gallery or camera, adjust stock, and manage prices
              </p>
            </div>
            <button className="btn-primary" onClick={openAddProductModal}>
              <Plus size={18} />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products List Table */}
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Available</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={prod.image}
                          alt={prod.name}
                          style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{prod.name}</div>
                          {prod.sinhalaName && (
                            <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>{prod.sinhalaName}</div>
                          )}
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                            SKU: {prod.sku} {prod.badge ? `• ${prod.badge}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.78rem', textTransform: 'capitalize', color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        {prod.category}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {settings.currencySymbol} {prod.price.toLocaleString()}
                      </div>
                      {prod.originalPrice && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                          {settings.currencySymbol} {prod.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontWeight: 800,
                          color: prod.stock <= 5 ? '#f87171' : '#34d399',
                        }}>
                          {prod.stock} {prod.unit || 'units'}
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => updateProduct({ ...prod, stock: Math.max(0, prod.stock - 1) })}
                            style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.75rem' }}
                          >
                            -1
                          </button>
                          <button
                            onClick={() => updateProduct({ ...prod, stock: prod.stock + 5 })}
                            style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.75rem' }}
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
                        ★ {prod.rating}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditProductModal(prod)}
                          style={{ padding: '6px', color: '#93c5fd' }}
                          title="Edit product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete product ${prod.name}?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          style={{ padding: '6px', color: '#f87171' }}
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add / Edit Product Modal (With Direct Device Gallery Upload) */}
          {productModalOpen && (
            <div className="modal-backdrop" onClick={() => setProductModalOpen(false)}>
              <div
                className="modal-card"
                style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                </div>

                <form onSubmit={handleSaveProduct} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Product Name (English) *</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="form-input"
                        placeholder="e.g. Wireless ANC Noise Cancelling Earbuds"
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Sinhala Name (සිංහල නම - Optional)</label>
                      <input
                        type="text"
                        value={productForm.sinhalaName || ''}
                        onChange={(e) => setProductForm({ ...productForm, sinhalaName: e.target.value })}
                        className="form-input"
                        placeholder="e.g. වයර්ලස් බ්ලූටූත් ඉයර්බඩ්ස්"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">SKU Code</label>
                      <input
                        type="text"
                        required
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="form-select"
                      >
                        <option value="electronics">Electronics & Tech</option>
                        <option value="fashion">Fashion & Wear</option>
                        <option value="home">Home & Kitchen</option>
                        <option value="groceries">Groceries & Foods</option>
                        <option value="beauty">Health & Beauty</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Selling Price ({settings.currencySymbol}) *</label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Original Price (For strikeout discount)</label>
                      <input
                        type="number"
                        value={productForm.originalPrice || ''}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Stock Quantity Available</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Unit Type</label>
                      <input
                        type="text"
                        value={productForm.unit || 'Piece'}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                        className="form-input"
                        placeholder="e.g. Piece, Box, Pack, Kg"
                      />
                    </div>

                    {/* ENHANCED IMAGE UPLOADER: DIRECT GALLERY PICKER + URL */}
                    <div className="form-group" style={{
                      gridColumn: '1 / -1',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '16px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                          Product Image *
                        </label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setImageInputMode('upload')}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: imageInputMode === 'upload' ? 'var(--accent-primary)' : 'transparent',
                              color: imageInputMode === 'upload' ? 'white' : 'var(--text-muted)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            📷 Gallery Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageInputMode('url')}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: imageInputMode === 'url' ? 'var(--accent-primary)' : 'transparent',
                              color: imageInputMode === 'url' ? 'white' : 'var(--text-muted)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            🔗 Web URL Link
                          </button>
                        </div>
                      </div>

                      {/* Hidden File Input for Gallery */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleGalleryFileSelect}
                      />

                      {/* Image Preview and Upload Box */}
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Thumbnail Preview */}
                        <div style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '2px solid var(--border-focus)',
                          background: 'rgba(0, 0, 0, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          position: 'relative',
                        }}>
                          {productForm.image ? (
                            <img
                              src={productForm.image}
                              alt="Product Preview"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <ImageIcon size={32} style={{ color: 'var(--text-dim)' }} />
                          )}
                          {isCompressingImage && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.7rem',
                              textAlign: 'center',
                              padding: '4px',
                            }}>
                              Compressing...
                            </div>
                          )}
                        </div>

                        {/* Upload Trigger Area */}
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          {imageInputMode === 'upload' ? (
                            <div>
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isCompressingImage}
                                className="btn-secondary"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  width: '100%',
                                  justifyContent: 'center',
                                  padding: '12px',
                                  border: '1.5px dashed var(--accent-primary)',
                                  background: 'rgba(99, 102, 241, 0.08)',
                                  borderRadius: '10px',
                                  color: '#a5b4fc',
                                  fontWeight: 700,
                                }}
                              >
                                <Upload size={18} />
                                <span>
                                  {isCompressingImage
                                    ? 'Optimizing image...'
                                    : 'Choose from Phone Gallery / Files'}
                                </span>
                              </button>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                                ✅ Tap to pick from gallery or take a photo. Image will automatically compress to fast web format.
                              </div>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="url"
                                placeholder="https://images.unsplash.com/photo-..."
                                value={productForm.image}
                                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                className="form-input"
                              />
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                Paste an online image link (Unsplash, imgur, or your CDN).
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Description</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="form-textarea"
                        placeholder="Details about product features, warranty, and package contents..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Badge (e.g. NEW, SALE, HOT DEAL)</label>
                      <input
                        type="text"
                        value={productForm.badge || ''}
                        onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '28px' }}>
                      <input
                        type="checkbox"
                        id="isFeaturedProd"
                        checked={productForm.isFeatured || false}
                        onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                      />
                      <label htmlFor="isFeaturedProd" style={{ fontSize: '0.86rem', fontWeight: 600, cursor: 'pointer' }}>
                        Feature on Storefront Homepage
                      </label>
                    </div>

                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setProductModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={isCompressingImage}>
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: STORE SETTINGS */}
      {activeAdminTab === 'settings' && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          padding: '28px',
          maxWidth: '740px',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Store & Delivery Settings</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Configure your WhatsApp order phone number, delivery fees, and discount coupons
          </p>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              <div className="form-group">
                <label className="form-label">Store Brand Name</label>
                <input
                  type="text"
                  value={settingsForm.storeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">WhatsApp Business Number (with Country Code) *</label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  className="form-input"
                  placeholder="94771234567"
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  All 1-Click WhatsApp orders will be directed to this number.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Fee ({settings.currencySymbol})</label>
                <input
                  type="number"
                  value={settingsForm.deliveryFee}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: Number(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Free Delivery Threshold ({settings.currencySymbol})</label>
                <input
                  type="number"
                  value={settingsForm.freeDeliveryThreshold}
                  onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Promo Coupon Code</label>
                <input
                  type="text"
                  value={settingsForm.promoCode}
                  onChange={(e) => setSettingsForm({ ...settingsForm, promoCode: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Promo Discount Percent (%)</label>
                <input
                  type="number"
                  value={settingsForm.promoDiscountPercent}
                  onChange={(e) => setSettingsForm({ ...settingsForm, promoDiscountPercent: Number(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Top Banner Announcement</label>
                <input
                  type="text"
                  value={settingsForm.bannerNotice}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bannerNotice: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Physical Store / Dispatch Address</label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="form-input"
                />
              </div>

            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsFirebaseModalOpen(true)}
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem' }}
                >
                  <Database size={15} style={{ color: '#f59e0b' }} />
                  <span>Configure Firebase DB</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset products, orders and settings back to initial demo data?')) {
                      resetStoreData();
                      setSettingsForm({ ...settings });
                    }
                  }}
                  className="btn-secondary"
                  style={{ color: '#f87171', fontSize: '0.82rem' }}
                >
                  <RefreshCw size={14} />
                  <span>Reset Demo Data</span>
                </button>
              </div>

              <button type="submit" className="btn-primary">
                {settingsSaved ? (
                  <>
                    <Check size={16} />
                    <span>Settings Saved!</span>
                  </>
                ) : (
                  <span>Save Store Settings</span>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
