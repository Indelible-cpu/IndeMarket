import React, { useState, useEffect } from 'react';
import { TrendingDown, Bell, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAppContext } from '../store';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface PriceDropToggleProps {
  product: {
    id: string;
    name: string;
    price: number;
    images?: string[];
  };
  className?: string;
}

export function PriceDropToggle({ product, className = '' }: PriceDropToggleProps) {
  const { user, formatPrice } = useAppContext();
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);

  // Check if price drop alert is active for this product
  useEffect(() => {
    let isMounted = true;

    const checkAlertStatus = async () => {
      // First check local storage cache for instant UI feedback
      const localKey = user ? `inde_price_alert_${user.id}_${product.id}` : `inde_price_alert_guest_${product.id}`;
      const cached = localStorage.getItem(localKey);
      if (cached === 'true') {
        if (isMounted) setIsActive(true);
      }

      if (!user) return;

      try {
        const q = query(
          collection(db, 'priceAlerts'),
          where('userId', '==', user.id),
          where('productId', '==', product.id)
        );
        const snap = await getDocs(q);

        if (isMounted) {
          if (!snap.empty) {
            const firstDoc = snap.docs[0];
            const data = firstDoc.data();
            if (data.active !== false) {
              setIsActive(true);
              setDocId(firstDoc.id);
              localStorage.setItem(localKey, 'true');
            } else {
              setIsActive(false);
              setDocId(firstDoc.id);
              localStorage.setItem(localKey, 'false');
            }
          }
        }
      } catch (err) {
        console.warn('Firestore price alert check deferred:', err);
      }
    };

    checkAlertStatus();
    return () => { isMounted = false; };
  }, [user, product.id]);

  const handleToggle = async () => {
    if (loading) return;

    const localKey = user ? `inde_price_alert_${user.id}_${product.id}` : `inde_price_alert_guest_${product.id}`;
    const nextState = !isActive;

    if (!user) {
      // Guest experience with instant toast & local persistence
      setIsActive(nextState);
      localStorage.setItem(localKey, nextState ? 'true' : 'false');
      if (nextState) {
        toast.success("Price drop monitor enabled! Log in anytime to manage email alerts.", {
          icon: '📉'
        });
      } else {
        toast('Price drop monitor turned off.', { icon: '🔔' });
      }
      return;
    }

    try {
      setLoading(true);
      setIsActive(nextState);
      localStorage.setItem(localKey, nextState ? 'true' : 'false');

      if (nextState) {
        // Turning ON
        if (docId) {
          try {
            await updateDoc(doc(db, 'priceAlerts', docId), {
              active: true,
              updatedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn(e);
          }
        } else {
          try {
            const newRef = await addDoc(collection(db, 'priceAlerts'), {
              userId: user.id,
              userEmail: user.email,
              productId: product.id,
              productName: product.name,
              productImage: product.images?.[0] || '',
              initialPrice: product.price,
              active: true,
              createdAt: new Date().toISOString()
            });
            setDocId(newRef.id);
          } catch (e) {
            console.warn(e);
          }
        }

        toast.success(
          `Price drop alert active! We'll notify ${user.email} if ${product.name} goes on sale.`,
          { duration: 4500 }
        );
      } else {
        // Turning OFF
        if (docId) {
          try {
            await updateDoc(doc(db, 'priceAlerts', docId), {
              active: false,
              updatedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn(e);
          }
        }
        toast('Price drop alert turned off.', { icon: '🔕' });
      }
    } catch (err) {
      console.error('Error toggling price alert:', err);
      toast.error('Could not update price alert preference.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border-emerald-200 shadow-2xs'
          : 'bg-gray-50/80 border-gray-200/80 hover:border-indigo-200 hover:bg-white'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl transition-colors shrink-0 ${
              isActive
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-200/80 text-gray-600'
            }`}
          >
            <TrendingDown className={`w-5 h-5 ${isActive ? 'animate-bounce' : ''}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                Notify me of price drops
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                  <Check className="w-3 h-3 text-emerald-700" /> Active
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isActive
                ? `Monitoring ${formatPrice(product.price)} — we'll alert you on price decreases.`
                : 'Get an instant email alert if this item goes on sale.'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          disabled={loading}
          onClick={handleToggle}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 ${
            isActive ? 'bg-emerald-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              isActive ? 'translate-x-5' : 'translate-x-0'
            }`}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 text-gray-500 animate-spin" />
            ) : isActive ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
            ) : null}
          </span>
        </button>
      </div>
    </div>
  );
}
