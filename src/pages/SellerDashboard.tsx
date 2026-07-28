import React, { useState, useMemo, useEffect } from 'react';
import { Store, Package, DollarSign, Users, Activity, Plus, FileText, CheckCircle2, X, Download, TrendingUp, Calendar, BarChart2, Bell, Mail } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { useAppContext } from '../store';
import { injectMockData } from '../lib/mockDataService';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { SellerMessaging } from '../components/SellerMessaging';

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

const stats = [
  { name: 'Total Sales (30 Days)', value: 'MWK 1,250,000', icon: DollarSign, change: '+12%', changeType: 'positive' },
  { name: 'Active Orders', value: '14', icon: Package, change: '+3', changeType: 'positive' },
  { name: 'Total Products', value: '45', icon: Store, change: '0', changeType: 'neutral' },
  { name: 'Store Views', value: '2,400', icon: Activity, change: '+18%', changeType: 'positive' },
];

export function SellerDashboard() {
  const { user, formatPrice } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

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
        
        // Combine fetched with local alerts, deduplicating by email and productId
        const combined = [...fetched];
        localAlerts.forEach(la => {
          if (!combined.some(c => c.email === la.email && c.productId === la.productId)) {
            combined.push(la);
          }
        });
        setStockAlerts(combined);
      } catch (err) {
        console.warn('Error or timeout fetching stock notifications, using offline cache:', err);
        setStockAlerts(localAlerts);
      } finally {
        setAlertsLoading(false);
      }
    };
    fetchStockAlerts();
  }, []);

  const revenueData = useMemo(() => generate30DayRevenueData(), []);
  const total30DayRevenue = useMemo(() => revenueData.reduce((acc, curr) => acc + curr.revenue, 0), [revenueData]);
  const total30DayOrders = useMemo(() => revenueData.reduce((acc, curr) => acc + curr.orders, 0), [revenueData]);
  const avgDailyRevenue = useMemo(() => Math.round(total30DayRevenue / 30), [total30DayRevenue]);
  const peakDayRevenue = useMemo(() => Math.max(...revenueData.map(d => d.revenue)), [revenueData]);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '',
    image: ''
  });
  const [adding, setAdding] = useState(false);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        category: newProduct.category,
        stock: Number(newProduct.stock),
        images: [newProduct.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'],
        sellerId: user.id,
        sellerName: user.name,
        rating: 0,
        reviewsCount: 0,
        isVerifiedSeller: user.verified || false,
        createdAt: new Date().toISOString()
      });
      setShowAddProduct(false);
      setNewProduct({ name: '', description: '', price: '', category: 'Electronics', stock: '', image: '' });
      toast.success('Product added successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add product');
    } finally {
      setAdding(false);
    }
  };

  const [seeding, setSeeding] = useState(false);

  const handleSeedData = async () => {
    if (!user) return;
    if (!confirm('This will add demo products to your store. Continue?')) return;
    
    setSeeding(true);
    try {
      const demoProducts = [
        { name: 'MacBook Air M2', desc: 'Latest Apple Silicon, 8GB RAM, 256GB SSD', price: 1850000, cat: 'Electronics', img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&q=80' },
        { name: 'Sony Noise Cancelling Headphones', desc: 'Industry leading noise cancellation WH-1000XM4', price: 350000, cat: 'Electronics', img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80' },
        { name: 'Men\'s Running Sneakers', desc: 'Lightweight breathable mesh, perfect for daily runs', price: 65000, cat: 'Fashion', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' },
        { name: 'Ceramic Coffee Mug', desc: 'Handcrafted artisan ceramic mug 400ml', price: 12000, cat: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80' },
        { name: 'Organic Cotton T-Shirt', desc: '100% organic cotton, ethically made', price: 25000, cat: 'Fashion', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80' },
        { name: 'Smart Fitness Watch', desc: 'Heart rate monitor, step counter, sleep tracking', price: 120000, cat: 'Electronics', img: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80' },
        { name: 'Stainless Steel Water Bottle', desc: 'Vacuum insulated, keeps drinks cold for 24h', price: 30000, cat: 'Sports', img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80' },
        { name: 'Skincare Travel Set', desc: 'Cleanser, toner, moisturizer in TSA approved sizes', price: 45000, cat: 'Beauty', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80' },
        { name: 'Yoga Mat', desc: 'Non-slip eco-friendly TPE yoga mat with alignment lines', price: 35000, cat: 'Sports', img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80' }
      ];

      for (const p of demoProducts) {
        await addDoc(collection(db, 'products'), {
          name: p.name,
          description: p.desc,
          price: p.price,
          category: p.cat,
          stock: 10,
          images: [p.img],
          sellerId: user.id,
          sellerName: user.name,
          rating: 4.5,
          reviewsCount: Math.floor(Math.random() * 50) + 1,
          isVerifiedSeller: user.verified || false,
          createdAt: new Date().toISOString()
        });
      }
      toast.success('Demo data added successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add demo data');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={async () => {
              if (confirm('Inject global marketplace mock data?')) {
                setSeeding(true);
                try {
                  await injectMockData();
                  toast.success('Global mock data injected!');
                } catch (e) {
                  toast.error('Failed to inject mock data');
                } finally {
                  setSeeding(false);
                }
              }
            }}
            disabled={seeding}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50"
          >
            {seeding ? 'Working...' : 'Inject Global Data'}
          </button>
          <button 
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50"
          >
            {seeding ? 'Seeding...' : 'Seed My Store'}
          </button>
          <button 
            onClick={() => {
              // Simulate export
              setTimeout(() => {
                toast.success('Store data exported successfully');
              }, 500);
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" /> Export Data
          </button>
          <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-5 h-5" /> Add New Product
          </button>
        </div>
      </div>

      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddProduct(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
              <button onClick={() => setShowAddProduct(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (MWK)</label>
                  <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Sports', 'Automotive'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" placeholder="https://..." value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddProduct(false)} className="px-6 py-2 border rounded-xl font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={adding} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">
                  {adding ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.changeType === 'positive' ? 'bg-green-100 text-green-700' : 
                stat.changeType === 'negative' ? 'bg-red-100 text-red-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.name}</h3>
            <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 30-Day Revenue Trend Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">30-Day Sales & Revenue Trend</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Sales performance analytics and order velocity over the last 30 days
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chartMetric === 'revenue'
                  ? 'bg-white text-indigo-600 shadow-sm'
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
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Order Count
            </button>
          </div>
        </div>

        {/* Highlight Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50/60 rounded-xl p-3.5 border border-indigo-100/80">
            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">30-Day Revenue</p>
            <p className="text-lg font-extrabold text-indigo-950 mt-0.5">{formatPrice(total30DayRevenue)}</p>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-100/80">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">30-Day Orders</p>
            <p className="text-lg font-extrabold text-emerald-950 mt-0.5">{total30DayOrders} orders</p>
          </div>
          <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-100/80">
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Daily Average</p>
            <p className="text-lg font-extrabold text-blue-950 mt-0.5">{formatPrice(avgDailyRevenue)}</p>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-100/80">
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Peak Single Day</p>
            <p className="text-lg font-extrabold text-amber-950 mt-0.5">{formatPrice(peakDayRevenue)}</p>
          </div>
        </div>

        {/* Recharts Chart */}
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
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `MWK ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                  activeDot={{ r: 6, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="orders" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4 flex gap-6 overflow-x-auto">
          {['overview', 'orders', 'products', 'stock alerts', 'messages', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium capitalize pb-4 -mb-4 px-1 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab === 'stock alerts' && <Bell className="w-3.5 h-3.5 text-amber-500" />}
              <span>{tab}</span>
              {tab === 'stock alerts' && stockAlerts.length > 0 && (
                <span className="ml-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stockAlerts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Action Required</h3>
              
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Verify Payment for Order #ORD-109284</h4>
                    <p className="text-sm text-gray-600">Buyer "John Doe" marked payment as sent via Airtel Money. Please check your account.</p>
                  </div>
                </div>
                <button className="whitespace-nowrap px-4 py-2 bg-white border border-yellow-200 text-yellow-700 text-sm font-bold rounded-lg hover:bg-yellow-100 transition-colors">
                  Confirm Receipt
                </button>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Ship Order #ORD-081234</h4>
                    <p className="text-sm text-gray-600">Payment confirmed. 2 items need to be shipped to Lilongwe.</p>
                  </div>
                </div>
                <button className="whitespace-nowrap px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                  Mark as Shipped
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="py-12 text-center text-gray-500 flex flex-col items-center">
              <Package className="w-12 h-12 text-gray-300 mb-4" />
              <p className="font-medium text-gray-900 mb-2">Customer Orders</p>
              <p className="text-sm max-w-sm mb-4">View and manage your customer orders.</p>
              <a href="/orders" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold">Go to Orders</a>
            </div>
          )}

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
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[11px] font-bold rounded-lg border border-green-100 uppercase tracking-wider">
                          Active Alert
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              <SellerMessaging />
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'orders' && activeTab !== 'stock alerts' && activeTab !== 'messages' && (
            <div className="py-12 text-center text-gray-500 flex flex-col items-center">
              <FileText className="w-12 h-12 text-gray-300 mb-4" />
              <p className="font-medium text-gray-900 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</p>
              <p className="text-sm max-w-sm">This section is available in the full version of the IndeMarket application.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
