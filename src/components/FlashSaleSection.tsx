import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../mockData';
import { useAppContext } from '../store';
import { Flame, Clock, ShoppingBag, ArrowRight } from 'lucide-react';

interface FlashSaleProps {
  products: Product[];
}

export function FlashSaleSection({ products }: FlashSaleProps) {
  const { formatPrice, addToCart } = useAppContext();
  
  // Flash sale timer (counts down 8 hours from now)
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 48, seconds: 32 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 }; // Reset loop
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter products that have originalPrice > price (discounts)
  const flashProducts = products
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .slice(0, 4);

  if (flashProducts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-rose-500 via-red-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl my-10 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Countdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
            <Flame className="w-7 h-7 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Flash Sale Deals</h2>
            <p className="text-rose-100 text-xs sm:text-sm font-medium">Limited time offers on top items. Grab them before they sell out!</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl shrink-0">
          <Clock className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-semibold text-rose-200 uppercase tracking-wider mr-1">Ends In:</span>
          <div className="flex items-center gap-1 font-mono font-bold text-sm sm:text-base">
            <span className="bg-white text-gray-900 px-2 py-1 rounded-lg shadow-sm">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="bg-white text-gray-900 px-2 py-1 rounded-lg shadow-sm">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="bg-white text-gray-900 px-2 py-1 rounded-lg shadow-sm">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {flashProducts.map((product) => {
          const discountPercent = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0;
          
          // Simulated claim percentage
          const claimedPercent = Math.min(88, 35 + (product.price % 40));

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-4 text-gray-900 shadow-md hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'; }}
                  />
                  <div className="absolute top-2 left-2 bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                    -{discountPercent}% OFF
                  </div>
                </div>

                <Link
                  to={`/product/${product.id}`}
                  className="font-bold text-sm text-gray-900 hover:text-indigo-600 line-clamp-2 mb-1.5 transition-colors"
                >
                  {product.name}
                </Link>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-extrabold text-rose-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through font-medium">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Stock progress bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                    <span>Sold: {claimedPercent}%</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${claimedPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="w-full bg-gray-900 hover:bg-rose-600 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Claim Deal</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
