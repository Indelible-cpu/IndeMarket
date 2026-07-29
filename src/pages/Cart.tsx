import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShieldAlert, Bookmark, Ticket, Check, X, Truck, ShoppingCart } from 'lucide-react';
import { useAppContext, AVAILABLE_PROMOS } from '../store';
import { handleProductImageError, getProductFallbackImage } from '../lib/imageUtils';

export function Cart() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    formatPrice,
    saveForLater,
    savedForLater,
    moveToCart,
    removeSavedForLater,
    appliedPromo,
    applyPromo,
    removePromo,
    getDiscountAmount,
  } = useAppContext();

  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');

  const freeShippingThreshold = 15000;
  const freeShippingProgress = Math.min(100, (cartTotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);

  const discountAmount = getDiscountAmount();
  const isFreeShippingApplied = appliedPromo?.discountType === 'shipping';
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    if (applyPromo(promoInput)) {
      setPromoInput('');
    }
  };

  if (cart.length === 0 && savedForLater.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your shopping cart is empty</h2>
        <p className="text-gray-500 mb-8">Discover top items across categories and enjoy fast delivery.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3.5 font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors shadow-md"
        >
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Shopping Cart</h1>

      {/* Free Shipping Progress Banner */}
      {cart.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between text-sm font-semibold mb-2 text-indigo-900">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              {remainingForFreeShipping === 0 || isFreeShippingApplied ? (
                <span className="text-emerald-700 font-bold">🎉 Congratulations! You unlocked FREE Express Delivery!</span>
              ) : (
                <span>Add {formatPrice(remainingForFreeShipping)} more for FREE Express Shipping</span>
              )}
            </div>
            <span className="text-xs text-indigo-600">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="w-full h-2.5 bg-indigo-200/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
              style={{ width: `${isFreeShippingApplied ? 100 : freeShippingProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items & Saved Items */}
        <div className="lg:col-span-2 space-y-8">
          {cart.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Cart Items ({cart.length})</h2>
              </div>

              {cart.map((item) => {
                const productImages = item.product.images && item.product.images.length >= 5
                  ? item.product.images
                  : [
                      item.product.images?.[0] || getProductFallbackImage(item.product.id),
                      item.product.images?.[1] || getProductFallbackImage(`${item.product.id}-2`),
                      item.product.images?.[2] || getProductFallbackImage(`${item.product.id}-3`),
                      item.product.images?.[3] || getProductFallbackImage(`${item.product.id}-4`),
                      item.product.images?.[4] || getProductFallbackImage(`${item.product.id}-5`),
                    ];

                return (
                  <div key={item.product.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto items-center sm:items-start">
                      <Link to={`/product/${item.product.id}`} className="block w-28 h-28 shrink-0 bg-gray-50 rounded-2xl overflow-hidden relative group border border-gray-100 shadow-xs">
                        <img
                          src={productImages[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => handleProductImageError(e, item.product.id || item.product.name)}
                        />
                        <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          5 Photos
                        </span>
                      </Link>

                      {/* 5 Real Images Gallery Strip in Cart */}
                      <div className="flex items-center gap-1.5 max-w-[112px] overflow-x-auto pb-1 scrollbar-none">
                        {productImages.slice(0, 5).map((imgUrl, imgIdx) => (
                          <Link
                            key={imgIdx}
                            to={`/product/${item.product.id}`}
                            title={`View Photo ${imgIdx + 1}`}
                            className="w-5 h-5 rounded-md overflow-hidden border border-gray-200 hover:border-indigo-500 shrink-0 transition-all hover:scale-110"
                          >
                            <img
                              src={imgUrl}
                              alt={`Product view ${imgIdx + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => handleProductImageError(e, `${item.product.id}-${imgIdx}`)}
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                        <Link to={`/product/${item.product.id}`} className="hover:text-indigo-600 transition-colors">
                          {item.product.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">Seller: {item.product.sellerName}</p>
                      <div className="text-lg font-bold text-indigo-600">
                        {formatPrice(item.product.price)}
                      </div>
                    </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-gray-600 hover:text-indigo-600 font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 font-semibold text-sm min-w-[2rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                        className="px-3 py-1.5 text-gray-600 hover:text-indigo-600 font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => saveForLater(item.product.id)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Save for later"
                      >
                        <Bookmark className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center text-gray-500">
              Your cart is currently empty. Check out your saved items below!
            </div>
          )}

          {/* Saved for Later Section */}
          {savedForLater.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Bookmark className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Saved for Later ({savedForLater.length})</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedForLater.map((item) => (
                  <div key={item.product.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-4 items-center">
                    <img
                      src={item.product.images?.[0] || getProductFallbackImage(item.product.id || item.product.name)}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0"
                      onError={(e) => handleProductImageError(e, item.product.id || item.product.name)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{item.product.name}</h4>
                      <div className="text-sm font-bold text-indigo-600">{formatPrice(item.product.price)}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => moveToCart(item.product.id)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          Move to Cart
                        </button>
                        <button
                          onClick={() => removeSavedForLater(item.product.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Promo Code */}
        {cart.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 sticky top-24 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              
              {/* Promo Code Form */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-indigo-600" /> Promo / Discount Code
                </label>
                
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs font-bold text-emerald-800">
                    <div>
                      <span className="block font-extrabold uppercase">{appliedPromo.code}</span>
                      <span className="text-emerald-600 font-normal">{appliedPromo.description}</span>
                    </div>
                    <button
                      onClick={removePromo}
                      className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
                      title="Remove promo code"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 uppercase font-semibold text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-gray-900 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {/* Available Promos Quick Copy */}
                {!appliedPromo && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">Available Coupons:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_PROMOS.map((p) => (
                        <button
                          key={p.code}
                          onClick={() => applyPromo(p.code)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-indigo-100 transition-colors"
                        >
                          {p.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(cartTotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Promo Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {remainingForFreeShipping === 0 || isFreeShippingApplied ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span className="font-medium text-gray-900">Standard Delivery</span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-gray-900">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-indigo-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 flex gap-2.5">
                <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  <span className="font-bold block mb-0.5">Direct Seller Checkout</span>
                  Complete payment via Mobile Money or Card at the next step.
                </p>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-bold text-base hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
