import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Store, ShieldCheck, TrendingUp, Package, Users, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../store';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export function BecomeSeller() {
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [storeName, setStoreName] = useState(user?.name ? `${user.name}'s Store` : '');
  const [storeDescription, setStoreDescription] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleUpgradeToSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=/become-seller');
      return;
    }

    if (!storeName.trim()) {
      toast.error('Please enter a Store Name');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      const updateData = {
        role: 'seller' as const,
        storeName: storeName.trim(),
        storeDescription: storeDescription.trim(),
        phone: phone.trim() || user.phone || '',
        isVerifiedSeller: true,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userRef, updateData);

      // Update global context state
      const updatedUser = {
        ...user,
        ...updateData,
      };
      setUser(updatedUser);

      toast.success('🎉 Congratulations! Your Seller Account is now active!');
      navigate('/seller/dashboard');
    } catch (error: any) {
      console.error('Error upgrading account to seller:', error);
      toast.error('Failed to activate seller account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-10 text-center sm:text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold mb-4 border border-white/20">
            <Store className="w-3.5 h-3.5 text-yellow-300" />
            <span>IndeMarket Seller Program</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Start Selling & Growing Your Business
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Join thousands of independent vendors on Malawi's premier multi-vendor platform. Create your store, list products in seconds, and track real-time revenue analytics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Benefits */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Why sell on IndeMarket?</h2>
          
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-start gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 mt-0.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Real-Time Sales Analytics</h3>
              <p className="text-xs text-gray-500 mt-0.5">Interactive revenue charts, order counts, and performance metrics for full clarity.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-start gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Verified Vendor Badge</h3>
              <p className="text-xs text-gray-500 mt-0.5">Build buyer trust instantly with verified seller credentials and review rankings.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-start gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0 mt-0.5">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Seamless Order Management</h3>
              <p className="text-xs text-gray-500 mt-0.5">Manage customer orders, update tracking status, and notify buyers automatically.</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex items-start gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0 mt-0.5">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Direct Customer Inquiries</h3>
              <p className="text-xs text-gray-500 mt-0.5">Engage directly with buyers via seller messaging to answer pre-purchase questions.</p>
            </div>
          </div>
        </div>

        {/* Right column: Action Form or Guest Prompt */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl relative">
            {!user ? (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Store className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Sign In or Register First</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                    To start selling, create an account or sign in to your existing IndeMarket account.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    to="/register?role=seller"
                    className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Register as Seller</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login?redirect=/become-seller"
                    className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-sm transition-all flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            ) : user.role === 'seller' ? (
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">You're already a Seller!</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Your account is configured as a vendor. Access your store dashboard to manage products and orders.
                  </p>
                </div>
                <Link
                  to="/seller/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg text-sm"
                >
                  <Store className="w-4 h-4" />
                  <span>Go to Seller Dashboard</span>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleUpgradeToSeller} className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-xl font-bold text-gray-900">Activate Your Seller Store</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Logged in as <span className="font-semibold text-gray-700">{user.email}</span>. Fill in your store details to upgrade instantly.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="store-name" className="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                      Store / Business Name *
                    </label>
                    <input
                      id="store-name"
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Blantyre Electronics & Tech"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="store-desc" className="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                      Store Description (Optional)
                    </label>
                    <textarea
                      id="store-desc"
                      rows={3}
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      placeholder="Describe the products you sell and your store mission..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="business-phone" className="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                      Business Contact Phone *
                    </label>
                    <input
                      id="business-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +265 99 123 4567"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100/80 text-xs text-indigo-900 space-y-1">
                  <p className="font-bold">✨ Instant Activation Guarantee</p>
                  <p className="text-indigo-700">You will immediately gain access to the Seller Dashboard where you can list products, track orders, and view sales graphs.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-indigo-400 cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Activating Store...</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-5 h-5" />
                      <span>Activate Seller Account Now</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
