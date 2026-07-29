import React, { useState, useEffect, useRef } from 'react';
import { User, MapPin, Package, Settings, Save, LogOut, Loader2, Upload, Bell, ShoppingBag, Tag, MessageSquare, Store } from 'lucide-react';
import { useAppContext } from '../store';
import { db, auth, storage } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export function Profile() {
  const { user, setUser, formatPrice } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    avatar: '',
  });
  const [notifications, setNotifications] = useState({
    orderStatus: true,
    promotions: true,
    stockAlerts: true,
    sellerUpdates: false,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob failed'));
              }
            },
            'image/jpeg',
            0.7
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      setUploadProgress(0);
      const compressedBlob = await compressImage(file);
      const storageRef = ref(storage, `avatars/${user.id}_${Date.now()}.jpg`);
      
      const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image');
          setUploadingImage(false);
          setUploadProgress(0);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData(prev => ({ ...prev, avatar: downloadURL }));
            toast.success('Image uploaded successfully. Save profile to apply changes.');
          } catch (err) {
            console.error('Error getting download URL:', err);
            toast.error('Failed to get download URL');
          } finally {
            setUploadingImage(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        }
      );
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
      setUploadingImage(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      avatar: user.avatar || '',
    });

    if (user.notificationPreferences) {
      setNotifications(user.notificationPreferences);
    } else {
      const saved = localStorage.getItem(`inde_notif_prefs_${user.id}`);
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!user) return;
      try {
        setOrdersLoading(true);
        const q = query(
          collection(db, 'orders'),
          where('buyerId', '==', user.id)
        );
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedOrders.sort((a: any, b: any) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        setRecentOrders(fetchedOrders.slice(0, 3));
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchRecentOrders();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        avatar: formData.avatar,
        notificationPreferences: notifications,
      });
      
      setUser({
        ...user,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        avatar: formData.avatar,
        notificationPreferences: notifications,
      });

      localStorage.setItem(`inde_notif_prefs_${user.id}`, JSON.stringify(notifications));
      
      toast.success('Profile and notification preferences saved successfully!');
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              Personal Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-3xl font-bold overflow-hidden border-4 border-white shadow-md relative">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      formData.name.charAt(0).toUpperCase() || <User className="w-8 h-8" />
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs font-bold gap-1 p-1 text-center backdrop-blur-[1px]">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                        <span>{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? `Uploading (${uploadProgress}%)` : 'Upload new photo'}
                  </button>
                  <p className="mt-2 text-xs text-gray-500">JPG, GIF or PNG. Max size of 5MB.</p>

                  {uploadingImage && (
                    <div className="mt-3 space-y-1.5 max-w-xs">
                      <div className="flex justify-between text-xs font-semibold text-gray-600">
                        <span>Uploading to Firebase...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-200 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 border rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  Delivery Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Email Notification Preferences Section */}
              <div className="pt-6 border-t border-gray-100">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    Email Notification Preferences
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage which alerts and communication updates are delivered to <span className="font-semibold text-gray-700">{user.email}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Order Status Alerts */}
                  <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl mt-0.5 shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          Order Status Alerts
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Receive instant emails when your order is placed, paid, shipped, or delivered.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications.orderStatus}
                      onClick={() => setNotifications(prev => ({ ...prev, orderStatus: !prev.orderStatus }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        notifications.orderStatus ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          notifications.orderStatus ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Option 2: Promotional Updates & Deals */}
                  <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-0.5 shrink-0">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          Promotional Updates & Flash Deals
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Stay informed about discount campaigns, weekend sales, and trending offers.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications.promotions}
                      onClick={() => setNotifications(prev => ({ ...prev, promotions: !prev.promotions }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        notifications.promotions ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          notifications.promotions ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Option 3: Stock Restock Alerts */}
                  <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl mt-0.5 shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          Stock Restock Notifications
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Get notified when out-of-stock items on your watchlist are available again.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications.stockAlerts}
                      onClick={() => setNotifications(prev => ({ ...prev, stockAlerts: !prev.stockAlerts }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        notifications.stockAlerts ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          notifications.stockAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Option 4: Seller Messages */}
                  <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 text-purple-700 rounded-xl mt-0.5 shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          Seller & Inquiry Messages
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Receive emails when sellers reply to your inquiries or product questions.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifications.sellerUpdates}
                      onClick={() => setNotifications(prev => ({ ...prev, sellerUpdates: !prev.sellerUpdates }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        notifications.sellerUpdates ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          notifications.sellerUpdates ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-gray-400 font-medium"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                Recent Orders
              </h2>
              <Link to="/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View All
              </Link>
            </div>

            {ordersLoading ? (
              <div className="text-center py-8 text-gray-500">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-100 rounded-xl">
                No recent orders found.
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <Link
                    key={order.id}
                    to="/orders"
                    className="block p-4 border border-gray-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-gray-500">Order #{order.id.slice(0, 8)}</span>
                        <p className="font-medium text-gray-900">
                          {order.createdAt ? new Date(order.createdAt?.seconds * 1000).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-sm text-gray-600">{order.items?.length || 0} items</span>
                      <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h2>
            
            {user.role === 'seller' ? (
              <Link
                to="/seller/dashboard"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors font-bold text-sm"
              >
                <Store className="w-5 h-5 text-indigo-600" />
                Open Seller Dashboard
              </Link>
            ) : (
              <Link
                to="/become-seller"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-bold text-sm shadow-sm"
              >
                <Store className="w-5 h-5 text-white" />
                Become a Seller / Open Store
              </Link>
            )}

            <button
              onClick={async () => {
                const { signOut } = await import('firebase/auth');
                await signOut(auth);
                setUser(null);
                navigate('/login');
                toast.success('Signed out successfully');
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
