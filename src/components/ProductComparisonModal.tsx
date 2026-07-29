import React, { useState } from 'react';
import { useAppContext } from '../store';
import { X, Scale, Trash2, ShoppingBag, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { handleProductImageError, getProductFallbackImage } from '../lib/imageUtils';

export function ProductComparisonBar() {
  const { comparedProducts, removeFromCompare, clearCompare, formatPrice, addToCart } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  if (comparedProducts.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Bar */}
      <div className="fixed bottom-16 sm:bottom-4 right-2 sm:right-8 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-2.5 sm:p-4 max-w-xl w-[calc(100vw-1rem)] sm:w-auto flex items-center justify-between gap-2 sm:gap-3 animate-in slide-in-from-bottom-5">
        <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm whitespace-nowrap pr-2 border-r border-gray-200">
            <Scale className="w-5 h-5" />
            <span>Compare ({comparedProducts.length}/4)</span>
          </div>

          <div className="flex items-center gap-2">
            {comparedProducts.map((p) => (
              <div key={p.id} className="relative group shrink-0">
                <img
                  src={p.images?.[0] || getProductFallbackImage(p.id || p.name)}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                  onError={(e) => handleProductImageError(e, p.id || p.name)}
                />
                <button
                  onClick={() => removeFromCompare(p.id)}
                  className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white rounded-full p-0.5 opacity-80 hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-colors shadow-sm"
          >
            View Table
          </button>
          <button
            onClick={clearCompare}
            className="text-gray-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comparison Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Product Comparison Matrix</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Matrix Table */}
            <div className="flex-1 overflow-x-auto p-6">
              <div className="min-w-[650px] grid grid-cols-5 gap-4 divide-x divide-gray-100">
                {/* Labels Column */}
                <div className="pr-4 space-y-6 text-sm font-semibold text-gray-500 pt-36">
                  <div className="h-10 flex items-center">Price</div>
                  <div className="h-10 flex items-center">Rating</div>
                  <div className="h-10 flex items-center">Category</div>
                  <div className="h-10 flex items-center">Seller</div>
                  <div className="h-10 flex items-center">Stock Availability</div>
                  <div className="h-12 flex items-center">Action</div>
                </div>

                {/* Items Columns */}
                {comparedProducts.map((product) => (
                  <div key={product.id} className="pl-4 space-y-6 flex flex-col">
                    {/* Header product info */}
                    <div className="h-32 flex flex-col items-center text-center group relative">
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-0 right-0 text-gray-300 hover:text-red-500 p-1"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <img
                        src={product.images?.[0] || getProductFallbackImage(product.id || product.name)}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 object-cover rounded-xl border border-gray-200 mb-2"
                        onError={(e) => handleProductImageError(e, product.id || product.name)}
                      />
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{product.name}</h4>
                    </div>

                    {/* Price */}
                    <div className="h-10 flex items-center font-bold text-indigo-600 text-base">
                      {formatPrice(product.price)}
                    </div>

                    {/* Rating */}
                    <div className="h-10 flex items-center text-sm font-medium text-gray-700 gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                      <span>{product.rating}</span>
                      <span className="text-xs text-gray-400">({product.reviewsCount})</span>
                    </div>

                    {/* Category */}
                    <div className="h-10 flex items-center text-sm text-gray-600">
                      {product.category}
                    </div>

                    {/* Seller */}
                    <div className="h-10 flex items-center text-sm text-gray-700 font-medium gap-1">
                      <span>{product.sellerName}</span>
                      {product.isVerifiedSeller && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" title="Verified Seller" />
                      )}
                    </div>

                    {/* Stock */}
                    <div className="h-10 flex items-center text-xs">
                      {product.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold">
                          In Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md font-semibold">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Add to Cart */}
                    <div className="h-12 flex items-center pt-2">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-medium text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
