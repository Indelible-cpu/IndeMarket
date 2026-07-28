import React, { useState, useEffect } from 'react';
import { Bell, Mail, CheckCircle2, X, Loader2, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAppContext } from '../store';
import toast from 'react-hot-toast';

interface NotifyMeModalProps {
  product: {
    id: string;
    name: string;
    images?: string[];
    price?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NotifyMeModal({ product, isOpen, onClose }: NotifyMeModalProps) {
  const { user, formatPrice } = useAppContext();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    } else {
      setEmail('');
    }
    setSubmitted(false);
  }, [user, isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      // Save local subscription marker first
      const stored = JSON.parse(localStorage.getItem('inde_stock_alerts') || '{}');
      stored[product.id] = email.trim();
      localStorage.setItem('inde_stock_alerts', JSON.stringify(stored));

      // Also save list of local alerts for seller dashboard offline view
      const storedList = JSON.parse(localStorage.getItem('inde_stock_alerts_list') || '[]');
      storedList.unshift({
        id: 'local_' + Date.now(),
        productId: product.id,
        productName: product.name,
        productPrice: product.price || 0,
        email: email.trim(),
        userId: user?.id || null,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('inde_stock_alerts_list', JSON.stringify(storedList));

      // Attempt Firestore sync with fallback timeout so UI is always instant and smooth
      try {
        const firestorePromise = addDoc(collection(db, 'stock_notifications'), {
          productId: product.id,
          productName: product.name,
          productPrice: product.price || 0,
          email: email.trim(),
          userId: user?.id || null,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout')), 3500));
        await Promise.race([firestorePromise, timeoutPromise]);
      } catch (err) {
        console.warn('Firestore stock alert save deferred to offline storage:', err);
      }

      setSubmitted(true);
      toast.success("Stock alert set! We'll notify you when back in stock.");
    } catch (error) {
      console.error('Error saving stock alert:', error);
      toast.error('Could not set stock alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">You're on the list!</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                We'll automatically send an email alert to{' '}
                <span className="font-semibold text-indigo-600">{email}</span> as soon as{' '}
                <span className="font-semibold text-gray-900">{product.name}</span> returns to inventory.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                  Out of Stock Alert
                </span>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">Get Notified</h3>
              </div>
            </div>

            {/* Product Preview */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-5">
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/100'}
                alt={product.name}
                className="w-14 h-14 object-cover rounded-xl border border-gray-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                {product.price && (
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Enter your email below. We'll monitor stock levels and alert you the instant this product is restocked by the seller.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Notification Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Setting Alert...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Notify Me When Available</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
