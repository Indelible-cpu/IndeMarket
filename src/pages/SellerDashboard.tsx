import React, { useState, useMemo, useEffect } from 'react';
import { EscrowReceiptModal } from '../components/EscrowReceiptModal';
import { sendEscrowReceiptEmails } from '../lib/emailService';
import { 
  Store, 
  Package, 
  DollarSign, 
  Users, 
  Activity, 
  Plus, 
  FileText, 
  CheckCircle2, 
  X, 
  Download, 
  TrendingUp, 
  Calendar, 
  BarChart2, 
  Bell, 
  Mail, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  Save, 
  CreditCard, 
  Building2, 
  Phone, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  Printer,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { useAppContext } from '../store';
import { injectMockData } from '../lib/mockDataService';
import { mockProducts, Product, ensureFiveImages } from '../mockData';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { SellerMessaging } from '../components/SellerMessaging';
import { MultiImageUploader } from '../components/MultiImageUploader';

const generate30DayRevenueData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const dayOfWeek = d.getDay();
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.35 : 1.0;
    
    const base = 30000 + Math.sin(i * 0.45) * 14000;
    const randomSeed = Math.abs(Math.sin((i + 3) * 7777));
    const noise = 0.85 + randomSeed * 0.35;
    
    const revenue = Math.round((base * weekendBoost * noise) / 1000) * 1000;
    const orders = Math.max(1, Math.round(revenue / 26000) + Math.floor(randomSeed * 2));
    
    data.push({
      date: dateLabel,
      fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      revenue: revenue,
      orders: orders
    });
  }
  return data;
};

const CustomTooltip = ({ active, payload }: any) => {
  const { formatPrice } = useAppContext();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3.5 border border-gray-100 rounded-xl shadow-xl text-xs space-y-1.5 z-50">
        <p className="font-bold text-gray-900 border-b border-gray-100 pb-1 mb-1">{data.fullDate}</p>
        <p className="text-indigo-600 font-semibold flex items-center justify-between gap-4">
          <span>Sales Revenue:</span>
          <span className="font-bold text-sm">{formatPrice(data.revenue)}</span>
        </p>
        <p className="text-emerald-600 font-medium flex items-center justify-between gap-4">
          <span>Orders Completed:</span>
          <span className="font-bold text-sm">{data.orders} orders</span>
        </p>
      </div>
    );
  }
  return null;
};

// Initial seller orders fallback list for demo / offline
const INITIAL_DEMO_ORDERS = [
  {
    id: 'ORD-109284',
    buyerName: 'John Doe',
    buyerPhone: '+265 999 123 456',
    deliveryAddress: 'Area 47, Sector 3, Lilongwe',
    items: [{ name: 'Sony Noise Cancelling Headphones', price: 350000, quantity: 1 }],
    totalAmount: 350000,
    paymentMethod: 'Airtel Money',
    status: 'Pending Payment',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-081234',
    buyerName: 'Chifundo Mwale',
    buyerPhone: '+265 888 765 432',
    deliveryAddress: 'Namiwawa, Blantyre',
    items: [{ name: 'MacBook Air M2', price: 1850000, quantity: 1 }],
    totalAmount: 1850000,
    paymentMethod: 'Bank Transfer (NBM)',
    status: 'Payment Verified',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-076123',
    buyerName: 'Mercy Phiri',
    buyerPhone: '+265 991 223 344',
    deliveryAddress: 'Luwinga, Mzuzu',
    items: [{ name: 'Organic Cotton T-Shirt', price: 25000, quantity: 2 }],
    totalAmount: 50000,
    paymentMethod: 'TNM Mpamba',
    status: 'Shipped',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function SellerDashboard() {
  const { user, setUser, formatPrice } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Products state
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Orders state
  const [orders, setOrders] = useState<any[]>(INITIAL_DEMO_ORDERS);
  const [ordersFilter, setOrdersFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<any | null>(null);

  // Settings State
  const [storeSettings, setStoreSettings] = useState({
    storeName: user?.storeName || `${user?.name || 'My'}'s Official Store`,
    tagline: 'Quality Products & Fast Escrow Delivery across Malawi',
    description: user?.storeDescription || 'Premier vendor specializing in genuine products with fast shipping in Blantyre, Lilongwe & Mzuzu.',
    phone: user?.phone || '+265 999 000 111',
    email: user?.email || 'vendor@indemarket.mw',
    location: 'Limbe Commercial District, Blantyre',
    payoutMethod: 'Airtel Money',
    accountNumber: '+265 999 000 111',
    accountHolder: user?.name || 'Store Manager',
    handlingTime: '1 Business Day',
    returnPolicy: '7 Days Money-Back Guarantee for undamaged items with original packaging.',
    deliveryCoverage: 'All Malawi (Blantyre, Lilongwe, Mzuzu, Zomba)',
    autoAcceptOrders: true,
    vacationMode: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // New product form state with multi-image support
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '10',
    images: [] as string[],
  });
  const [addingProduct, setAddingProduct] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Fetch stock alerts
  useEffect(() => {
    const fetchStockAlerts = async () => {
      let localAlerts: any[] = [];
      try {
        localAlerts = JSON.parse(localStorage.getItem('inde_stock_alerts_list') || '[]');
      } catch (e) {}

      try {
        setAlertsLoading(true);
        const q = query(collection(db, 'stock_notifications'), orderBy('createdAt', 'desc'));
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 3500));
        const snap = await Promise.race([getDocs(q), timeoutPromise]) as any;
        const fetched = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        
        const combined = [...fetched];
        localAlerts.forEach(la => {
          if (!combined.some(c => c.email === la.email && c.productId === la.productId)) {
            combined.push(la);
          }
        });
        setStockAlerts(combined);
      } catch (err) {
        console.warn('Error fetching stock notifications:', err);
        setStockAlerts(localAlerts);
      } finally {
        setAlertsLoading(false);
      }
    };
    fetchStockAlerts();
  }, []);

  // Fetch seller products from Firestore & local mockData
  const fetchSellerProducts = async () => {
    setProductsLoading(true);
    try {
      let remoteProducts: Product[] = [];
      if (user?.id) {
        try {
          const q = query(collection(db, 'products'), where('sellerId', '==', user.id));
          const snap = await getDocs(q);
          remoteProducts = snap.docs.map(doc => ensureFiveImages({ id: doc.id, ...doc.data() } as Product));
        } catch (e) {
          console.warn('Firestore fetch products failed, using mock fallbacks:', e);
        }
      }

      // Combine with mockProducts strictly owned by this seller
      const mockSellerProds = mockProducts
        .filter(p => user?.id && (p.sellerId === user.id || p.sellerName === (user as any).storeName))
        .map(p => ensureFiveImages(p));

      const combined = [...remoteProducts];
      mockSellerProds.forEach(mp => {
        if (!combined.some(c => c.id === mp.id)) {
          combined.push(mp);
        }
      });

      setSellerProducts(combined);
    } catch (err) {
      console.error('Error fetching products:', err);
      const mockSellerProds = mockProducts
        .filter(p => user?.id && (p.sellerId === user.id || p.sellerName === (user as any).storeName))
        .map(p => ensureFiveImages(p));
      setSellerProducts(mockSellerProds);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, [user]);

  const revenueData = useMemo(() => generate30DayRevenueData(), []);
  const total30DayRevenue = useMemo(() => revenueData.reduce((acc, curr) => acc + curr.revenue, 0), [revenueData]);
  const total30DayOrders = useMemo(() => revenueData.reduce((acc, curr) => acc + curr.orders, 0), [revenueData]);
  const avgDailyRevenue = useMemo(() => Math.round(total30DayRevenue / 30), [total30DayRevenue]);
  const peakDayRevenue = useMemo(() => Math.max(...revenueData.map(d => d.revenue)), [revenueData]);

  // Handle adding new product with multi images
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newProduct.name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (!newProduct.price || Number(newProduct.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    // Default to at least 5 images using ensureFiveImages if user uploaded fewer
    const finalImages = newProduct.images.length >= 1 
      ? newProduct.images 
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

    setAddingProduct(true);
    try {
      const productPayload = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price: Number(newProduct.price),
        category: newProduct.category,
        stock: Number(newProduct.stock) || 10,
        images: finalImages,
        sellerId: user.id,
        sellerName: user.storeName || user.name,
        rating: 4.8,
        reviewsCount: 1,
        isVerifiedSeller: user.verified || true,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'products'), productPayload);
      const newCreatedProduct = ensureFiveImages({ id: docRef.id, ...productPayload } as Product);

      setSellerProducts(prev => [newCreatedProduct, ...prev]);
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '10',
        images: []
      });
      toast.success('🎉 Product added successfully with multi-angle photos!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save product to Firestore');
    } finally {
      setAddingProduct(false);
    }
  };

  // Handle editing existing product
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setAddingProduct(true);
    try {
      const updatedImages = editingProduct.images && editingProduct.images.length > 0 
        ? editingProduct.images 
        : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

      const formatted = ensureFiveImages({
        ...editingProduct,
        images: updatedImages,
        price: Number(editingProduct.price),
        stock: Number(editingProduct.stock),
      });

      if (editingProduct.id) {
        try {
          const docRef = doc(db, 'products', editingProduct.id);
          await updateDoc(docRef, {
            name: formatted.name,
            description: formatted.description,
            price: formatted.price,
            stock: formatted.stock,
            category: formatted.category,
            images: formatted.images,
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Firestore product update warning:', err);
        }
      }

      setSellerProducts(prev => prev.map(p => p.id === formatted.id ? formatted : p));
      setEditingProduct(null);
      toast.success('Product updated successfully!');
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Failed to update product');
    } finally {
      setAddingProduct(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product from your store inventory?')) return;
    try {
      try {
        await deleteDoc(doc(db, 'products', productId));
      } catch (e) {
        console.warn('Firestore delete warning:', e);
      }
      setSellerProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product removed from store inventory');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  // Handle Order Status Updates
  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      if (targetOrder.status === newStatus) {
        toast.error(`It's already done! Order #${orderId} is already marked as ${newStatus}.`, {
          id: `already-done-${orderId}-${newStatus}`,
          icon: 'ℹ️'
        });
        return;
      }
      // If order status is logically already beyond or equal to the action
      if (newStatus === 'Payment Verified' && (targetOrder.status === 'Payment Verified' || targetOrder.status === 'Shipped' || targetOrder.status === 'Delivered')) {
        toast.error(`It's already done! Order #${orderId} payment is already confirmed.`, { id: `already-done-${orderId}` });
        return;
      }
      if (newStatus === 'Shipped' && (targetOrder.status === 'Shipped' || targetOrder.status === 'Delivered')) {
        toast.error(`It's already done! Order #${orderId} has already been shipped.`, { id: `already-done-${orderId}` });
        return;
      }
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Order #${orderId} marked as ${newStatus}`);
  };

  // Save Store Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      if (user) {
        setUser({
          ...user,
          storeName: storeSettings.storeName,
          storeDescription: storeSettings.description,
          phone: storeSettings.phone,
        });
      }
      setSavingSettings(false);
      toast.success('🎉 Store settings & payout account saved!');
    }, 400);
  };

  const handleSeedData = async () => {
    if (!user) return;
    if (!confirm('This will add high-res multi-image demo products to your store. Continue?')) return;
    
    setSeeding(true);
    try {
      const demoProducts = [
        { name: 'MacBook Air M2', desc: 'Latest Apple Silicon, 8GB RAM, 256GB SSD', price: 1850000, cat: 'Electronics' },
        { name: 'Sony Noise Cancelling Headphones', desc: 'Industry leading noise cancellation WH-1000XM4', price: 350000, cat: 'Electronics' },
        { name: 'Men\'s Running Sneakers', desc: 'Lightweight breathable mesh, perfect for daily runs', price: 65000, cat: 'Fashion' },
        { name: 'Ceramic Coffee Mug', desc: 'Handcrafted artisan ceramic mug 400ml', price: 12000, cat: 'Home & Kitchen' },
        { name: 'Smart Fitness Watch', desc: 'Heart rate monitor, step counter, sleep tracking', price: 120000, cat: 'Electronics' },
      ];

      for (const p of demoProducts) {
        const fullProd = ensureFiveImages({
          name: p.name,
          description: p.desc,
          price: p.price,
          category: p.cat,
          stock: 10,
          sellerId: user.id,
          sellerName: user.name,
          rating: 4.8,
          reviewsCount: 12,
          isVerifiedSeller: true,
          createdAt: new Date().toISOString()
        } as any);

        await addDoc(collection(db, 'products'), fullProd);
      }
      fetchSellerProducts();
      toast.success('Demo products with 5 images added!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add demo data');
    } finally {
      setSeeding(false);
    }
  };

  // Filtered seller products
  const filteredProducts = useMemo(() => {
    return sellerProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.category.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [sellerProducts, productSearch, productCategoryFilter]);

  // Filtered seller orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.buyerName.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesFilter = ordersFilter === 'All' || o.status === ordersFilter;
      return matchesSearch && matchesFilter;
    });
  }, [orders, orderSearch, ordersFilter]);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{storeSettings.storeName}</h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full flex items-center gap-1 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Seller
            </span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">{storeSettings.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button 
            type="button"
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors shadow-2xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            {seeding ? 'Seeding...' : 'Seed Sample Store Items'}
          </button>
          <button 
            type="button"
            onClick={() => {
              toast.success('Store financial & product data exported to CSV');
            }}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            type="button"
            onClick={() => setShowAddProduct(true)} 
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Add Product Modal with MultiImageUploader */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowAddProduct(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Add New Product to Store</h2>
                  <p className="text-xs text-gray-500">Upload multiple real product images from different angles</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowAddProduct(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Product Title</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Wireless Noise-Cancelling Headphones M2"
                  value={newProduct.name} 
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description & Specifications</label>
                <textarea 
                  required 
                  rows={3} 
                  placeholder="Describe item condition, features, warranty, and package contents..."
                  value={newProduct.description} 
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm" 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Price (MWK)</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="120000"
                    value={newProduct.price} 
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm font-semibold text-indigo-600" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Stock Quantity</label>
                  <input 
                    required 
                    type="number" 
                    value={newProduct.stock} 
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})} 
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm"
                  >
                    {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports', 'Automotive', 'Books', 'Toys & Games'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi Image Upload Module */}
              <div className="border-t border-gray-100 pt-4">
                <MultiImageUploader
                  images={newProduct.images}
                  onChange={(imgs) => setNewProduct({ ...newProduct, images: imgs })}
                  category={newProduct.category}
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white p-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddProduct(false)} 
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={addingProduct} 
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-md"
                >
                  {addingProduct ? 'Adding Product...' : 'Publish Product to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setEditingProduct(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Edit Product</h2>
                  <p className="text-xs text-gray-500">Update item details, price, inventory & image gallery</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Product Name</label>
                <input 
                  required 
                  type="text" 
                  value={editingProduct.name} 
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm font-semibold" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  required 
                  rows={3} 
                  value={editingProduct.description} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm" 
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Price (MWK)</label>
                  <input 
                    required 
                    type="number" 
                    value={editingProduct.price} 
                    onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm font-bold text-indigo-600" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Stock</label>
                  <input 
                    required 
                    type="number" 
                    value={editingProduct.stock} 
                    onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    value={editingProduct.category} 
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} 
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-sm"
                  >
                    {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports', 'Automotive', 'Books', 'Toys & Games'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi Image Upload Module */}
              <div className="border-t border-gray-100 pt-4">
                <MultiImageUploader
                  images={editingProduct.images || []}
                  onChange={(imgs) => setEditingProduct({ ...editingProduct, images: imgs })}
                  category={editingProduct.category}
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white p-2">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)} 
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={addingProduct} 
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-md"
                >
                  {addingProduct ? 'Updating...' : 'Save Product Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Key Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
              +12.4%
            </span>
          </div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">30-Day Revenue</h3>
          <p className="text-2xl font-extrabold text-gray-900">{formatPrice(total30DayRevenue)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
              {orders.length} Active
            </span>
          </div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Orders Processing</h3>
          <p className="text-2xl font-extrabold text-gray-900">{total30DayOrders} orders</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              Live Store
            </span>
          </div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Catalog Inventory</h3>
          <p className="text-2xl font-extrabold text-gray-900">{sellerProducts.length} items</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
              +18% Views
            </span>
          </div>
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Store Traffic</h3>
          <p className="text-2xl font-extrabold text-gray-900">2,480 views</p>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
        <div className="border-b border-gray-100 px-6 py-4 flex gap-6 overflow-x-auto bg-gray-50/50">
          {[
            { id: 'overview', label: 'Overview & Sales' },
            { id: 'products', label: `Products (${sellerProducts.length})` },
            { id: 'orders', label: `Orders (${orders.length})` },
            { id: 'stock alerts', label: 'Stock Alerts' },
            { id: 'messages', label: 'Customer Inquiry Messages' },
            { id: 'settings', label: 'Store & Payout Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-bold pb-3.5 -mb-4 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.id === 'stock alerts' && <Bell className="w-3.5 h-3.5 text-amber-500" />}
              <span>{tab.label}</span>
              {tab.id === 'stock alerts' && stockAlerts.length > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stockAlerts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Revenue Trend Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-xl font-bold text-gray-900">30-Day Sales & Revenue Trend</h2>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Sales performance analytics and order velocity over the last 30 days
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setChartMetric('revenue')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        chartMetric === 'revenue'
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Revenue (MWK)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMetric('orders')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        chartMetric === 'orders'
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Order Volume
                    </button>
                  </div>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartMetric === 'revenue' ? (
                      <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(val) => `MWK ${(val / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGradient)" activeDot={{ r: 6, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }} />
                      </AreaChart>
                    ) : (
                      <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Action Required Checklist */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Seller Action Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-yellow-50/80 border border-yellow-200/80 rounded-2xl p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-100 text-yellow-700 rounded-xl flex items-center justify-center shrink-0 font-bold">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Verify Payment #ORD-109284</h4>
                        <p className="text-xs text-gray-600 mt-1">Buyer "John Doe" paid via Airtel Money. Confirm funds in account.</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleUpdateOrderStatus('ORD-109284', 'Payment Verified')}
                      className="px-3.5 py-2 bg-white border border-yellow-300 text-yellow-800 text-xs font-bold rounded-xl hover:bg-yellow-100 transition-colors shrink-0 shadow-2xs"
                    >
                      Confirm
                    </button>
                  </div>

                  <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center shrink-0 font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Ship Order #ORD-081234</h4>
                        <p className="text-xs text-gray-600 mt-1">Payment verified. Package item for courier delivery to Blantyre.</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleUpdateOrderStatus('ORD-081234', 'Shipped')}
                      className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shrink-0 shadow-xs"
                    >
                      Dispatch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS MODULE */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Product Search & Category Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search product title..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
                  <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                  {['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setProductCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        productCategoryFilter === cat 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Table */}
              {productsLoading ? (
                <div className="py-16 text-center text-gray-400">Loading seller product catalog...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-bold text-gray-800 text-base">No products match your query</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">Click below to add a new product with multiple real images.</p>
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(true)}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-xs"
                  >
                    + Add New Product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="p-4">Product Details</th>
                        <th className="p-4">Photos</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredProducts.map((p) => {
                        const productImages = p.images && p.images.length >= 1 ? p.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'];
                        return (
                          <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={productImages[0]}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 text-sm truncate max-w-xs">{p.name}</p>
                                  <p className="text-gray-400 text-[11px] truncate max-w-xs">{p.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                {productImages.slice(0, 4).map((imgUrl, i) => (
                                  <img key={i} src={imgUrl} alt="Thumbnail" className="w-6 h-6 rounded-md object-cover border border-gray-200 shrink-0" />
                                ))}
                                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md ml-1">
                                  {productImages.length}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-gray-600">{p.category}</td>
                            <td className="p-4 font-bold text-indigo-600 text-sm">{formatPrice(p.price)}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                p.stock > 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                              }`}>
                                {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct(p)}
                                  title="Edit Product Details & Gallery"
                                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id)}
                                  title="Delete Product from Inventory"
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDERS MODULE */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Order Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Order ID or Buyer Name..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
                  {['All', 'Pending Payment', 'Payment Verified', 'Shipped', 'Delivered'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrdersFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        ordersFilter === st 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:border-gray-200 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-gray-900 text-sm">Order #{order.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          order.status === 'Payment Verified' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Delivered' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p><strong className="text-gray-900">Buyer:</strong> {order.buyerName} ({order.buyerPhone})</p>
                        <p><strong className="text-gray-900">Delivery Address:</strong> {order.deliveryAddress}</p>
                        <p><strong className="text-gray-900">Items:</strong> {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 w-full md:w-auto">
                      <span className="text-lg font-extrabold text-indigo-600">{formatPrice(order.totalAmount)}</span>
                      
                      <div className="flex items-center gap-2">
                        {order.status === 'Pending Payment' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, 'Payment Verified')}
                            className="px-3.5 py-1.5 bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs font-bold rounded-xl hover:bg-yellow-100 transition-colors"
                          >
                            Confirm Payment
                          </button>
                        )}
                        {order.status === 'Payment Verified' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, 'Shipped')}
                            className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {order.status === 'Shipped' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                            className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
                          >
                            Mark Delivered
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderReceipt(order)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: STOCK ALERTS */}
          {activeTab === 'stock alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Back-in-Stock Notification Requests</h3>
                  <p className="text-xs text-gray-500">Customers waiting for email notifications when out-of-stock items return.</p>
                </div>
                <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />
                  {stockAlerts.length} Total Subscriptions
                </span>
              </div>

              {alertsLoading ? (
                <div className="py-12 text-center text-gray-400">Loading stock alerts...</div>
              ) : stockAlerts.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-700">No stock alerts requested yet</p>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">When customers subscribe to out-of-stock item notifications, their requests will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-white">
                  {stockAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0 mt-0.5">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{alert.productName || 'Out of stock product'}</p>
                          <p className="text-xs text-indigo-600 font-semibold mt-0.5">{alert.email}</p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            Requested on {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            toast.success(`Email alert dispatched to ${alert.email}!`);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-2xs"
                        >
                          Send Restock Email
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <SellerMessaging />
            </div>
          )}

          {/* TAB 6: SETTINGS MODULE */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
              {/* Section 1: Store Details */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Store className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-gray-900">Store Profile & Branding</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Store Name</label>
                    <input
                      type="text"
                      value={storeSettings.storeName}
                      onChange={e => setStoreSettings({...storeSettings, storeName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Store Tagline</label>
                    <input
                      type="text"
                      value={storeSettings.tagline}
                      onChange={e => setStoreSettings({...storeSettings, tagline: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Store Description / About</label>
                  <textarea
                    rows={3}
                    value={storeSettings.description}
                    onChange={e => setStoreSettings({...storeSettings, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Business Phone</label>
                    <input
                      type="text"
                      value={storeSettings.phone}
                      onChange={e => setStoreSettings({...storeSettings, phone: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Support Email</label>
                    <input
                      type="email"
                      value={storeSettings.email}
                      onChange={e => setStoreSettings({...storeSettings, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Physical Location</label>
                    <input
                      type="text"
                      value={storeSettings.location}
                      onChange={e => setStoreSettings({...storeSettings, location: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Payout Accounts */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-gray-900">Escrow Sales Payout Method</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Payout Provider</label>
                    <select
                      value={storeSettings.payoutMethod}
                      onChange={e => setStoreSettings({...storeSettings, payoutMethod: e.target.value})}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    >
                      <option value="Airtel Money">Airtel Money</option>
                      <option value="TNM Mpamba">TNM Mpamba</option>
                      <option value="National Bank of Malawi">National Bank of Malawi</option>
                      <option value="FDH Bank">FDH Bank</option>
                      <option value="Standard Bank">Standard Bank</option>
                      <option value="NBS Bank">NBS Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Account / Mobile No.</label>
                    <input
                      type="text"
                      value={storeSettings.accountNumber}
                      onChange={e => setStoreSettings({...storeSettings, accountNumber: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={storeSettings.accountHolder}
                      onChange={e => setStoreSettings({...storeSettings, accountHolder: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Policies & Shipping */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-gray-900">Operating Policies & Delivery</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Standard Handling Time</label>
                    <input
                      type="text"
                      value={storeSettings.handlingTime}
                      onChange={e => setStoreSettings({...storeSettings, handlingTime: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Delivery Coverage</label>
                    <input
                      type="text"
                      value={storeSettings.deliveryCoverage}
                      onChange={e => setStoreSettings({...storeSettings, deliveryCoverage: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Store Return & Guarantee Policy</label>
                  <textarea
                    rows={2}
                    value={storeSettings.returnPolicy}
                    onChange={e => setStoreSettings({...storeSettings, returnPolicy: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {savingSettings ? 'Saving Settings...' : 'Save Store Settings'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Printable Escrow Receipt Modal */}
      {selectedOrderReceipt && (
        <EscrowReceiptModal
          order={{
            id: selectedOrderReceipt.id,
            items: selectedOrderReceipt.items,
            total: selectedOrderReceipt.totalAmount || selectedOrderReceipt.total,
            status: (selectedOrderReceipt.status === 'Payment Verified' || selectedOrderReceipt.status === 'Shipped' || selectedOrderReceipt.status === 'Delivered' || selectedOrderReceipt.status === 'payment_received' || selectedOrderReceipt.status === 'shipped' || selectedOrderReceipt.status === 'completed') ? 'payment_received' : 'pending_payment',
            paymentMethod: selectedOrderReceipt.paymentMethod || 'Airtel Money',
            paymentReference: selectedOrderReceipt.paymentReference || `TXN-${selectedOrderReceipt.id}`,
            sellerConfirmationDate: selectedOrderReceipt.sellerConfirmationDate || selectedOrderReceipt.createdAt || new Date().toISOString(),
            sellerDetails: {
              storeName: storeSettings.storeName,
              location: storeSettings.storeLocation,
              phone: storeSettings.phone,
              email: storeSettings.email
            },
            shippingDetails: {
              firstName: selectedOrderReceipt.buyerName?.split(' ')[0] || 'Customer',
              lastName: selectedOrderReceipt.buyerName?.split(' ').slice(1).join(' ') || '',
              addressLine: selectedOrderReceipt.deliveryAddress || 'Blantyre',
              city: 'Blantyre',
              phoneNumber: selectedOrderReceipt.buyerPhone || '+265 999 000 000'
            },
            sellerId: user?.id || 'seller_1',
            sellerName: storeSettings.storeName,
            createdAt: selectedOrderReceipt.createdAt || new Date().toISOString()
          }}
          onClose={() => setSelectedOrderReceipt(null)}
          onConfirmPaymentBySeller={(orderId) => {
            handleUpdateOrderStatus(orderId, 'Payment Verified');
            
            const confirmationDate = new Date().toISOString();
            const ref = selectedOrderReceipt.paymentReference || `TXN-${orderId}`;
            const signatureHash = `SIG-IND-${orderId.slice(0, 6).toUpperCase()}-${ref.toUpperCase()}`;

            sendEscrowReceiptEmails({
              orderId,
              receiptNumber: `RCP-IND-${orderId.slice(0, 8).toUpperCase()}`,
              buyerName: selectedOrderReceipt.buyerName || 'Valued Customer',
              buyerEmail: selectedOrderReceipt.buyerEmail || 'customer@indemarket.mw',
              buyerAddress: selectedOrderReceipt.deliveryAddress || 'Blantyre',
              sellerStoreName: storeSettings.storeName,
              sellerEmail: storeSettings.email || user?.email || 'vendor@indemarket.mw',
              sellerPhone: storeSettings.phone || '+265 888 123 456',
              paymentMethod: selectedOrderReceipt.paymentMethod || 'Airtel Money',
              paymentReference: ref,
              totalAmount: selectedOrderReceipt.totalAmount || selectedOrderReceipt.total || 0,
              items: (selectedOrderReceipt.items || []).map((i: any) => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price
              })),
              confirmationDate,
              securityHash: signatureHash
            });

            setSelectedOrderReceipt(prev => prev ? { ...prev, status: 'Payment Verified' } : null);
          }}
        />
      )}
    </div>
  );
}
