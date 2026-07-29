import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, ShieldCheck, ShoppingCart, Trash2, Eye } from 'lucide-react';
import { useAppContext } from '../store';
import { WishlistButton } from './WishlistButton';
import { NotifyMeButton } from './NotifyMeButton';
import { handleProductImageError, getProductFallbackImage } from '../lib/imageUtils';

export interface RecentlyViewedItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  sellerName?: string;
  rating?: number;
  reviewsCount?: number;
  isVerifiedSeller?: boolean;
  stock?: number;
  updatedAt?: string;
}

export function RecentlyViewed() {
  const { addToCart, formatPrice } = useAppContext();
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem('inde_recently_viewed');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Keep the last 5 interacted items
            setRecentItems(parsed.slice(0, 5));
          }
        }
      } catch (err) {
        console.warn('Failed to parse recently viewed items:', err);
      }
    };

    loadRecentlyViewed();

    // Listen for storage changes across tabs or page navigation
    window.addEventListener('storage', loadRecentlyViewed);
    return () => window.removeEventListener('storage', loadRecentlyViewed);
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem('inde_recently_viewed');
    setRecentItems([]);
  };

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 rounded-3xl p-6 sm:p-8 border border-indigo-100/70 shadow-2xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            Recently Viewed
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pick up right where you left off from your recent browsing
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearHistory}
          className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/80 border border-transparent hover:border-gray-200"
          title="Clear recent viewing history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {recentItems.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-2xs border border-gray-100/90 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col"
          >
            <div className="relative aspect-square overflow-hidden bg-gray-50">
              <img
                src={product.images?.[0] || getProductFallbackImage(product.id || product.name)}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                onError={(e) => handleProductImageError(e, product.id || product.name)}
              />
              {product.stock === 0 && (
                <div className="absolute top-2 left-2 bg-gray-900/90 text-white text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-md backdrop-blur-xs">
                  OUT OF STOCK
                </div>
              )}
              <div className="absolute top-2 right-2 z-10">
                <WishlistButton product={product} />
              </div>
            </div>

            <div className="p-3.5 flex flex-col flex-1">
              <h3 className="text-xs font-bold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors leading-tight">
                <Link to={`/product/${product.id}`}>{product.name}</Link>
              </h3>

              <div className="flex items-center gap-1 mb-2 text-xs">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-gray-800 text-[11px]">{product.rating || 0}</span>
                <span className="text-gray-400 text-[11px]">({product.reviewsCount || 0})</span>
              </div>

              <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1">
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-[10px] text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    to={`/product/${product.id}`}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                    title="View product images and details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>
                  {product.stock === 0 ? (
                    <NotifyMeButton product={product} variant="compact" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors focus:outline-none shrink-0"
                      aria-label="Add to cart"
                      title="Buy or Add to Cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
