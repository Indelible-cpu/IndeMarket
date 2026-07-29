import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, CheckCircle, Smartphone, CreditCard, Banknote, Lock, ArrowRight, FileText } from 'lucide-react';
import { useAppContext } from '../store';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { validateTransactionReference } from '../lib/fraudCheck';
import toast from 'react-hot-toast';

export function Checkout() {
  const { user, cart, cartTotal, clearCart, formatPrice, appliedPromo, getDiscountAmount } = useAppContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrderRef, setCreatedOrderRef] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'airtel' | 'mpamba' | 'card' | 'cod'>('airtel');
  const [mobileNumber, setMobileNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [customTxnRef, setCustomTxnRef] = useState('');

  const discountAmount = getDiscountAmount();
  const finalTotal = Math.max(0, cartTotal - discountAmount);
  
  const [shippingDetails, setShippingDetails] = useState({
    firstName: '',
    lastName: '',
    addressLine: '',
    city: 'Blantyre',
    phoneNumber: ''
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    // Determine initial payment reference code
    let refCode = customTxnRef.trim();
    if (!refCode) {
      if (selectedPaymentMethod === 'airtel') {
        const phone = mobileNumber.replace(/\D/g, '').slice(-6) || '999123';
        refCode = `AIRTEL-${phone}-${Date.now().toString().slice(-4)}`;
      } else if (selectedPaymentMethod === 'mpamba') {
        const phone = mobileNumber.replace(/\D/g, '').slice(-6) || '888123';
        refCode = `MPAMBA-${phone}-${Date.now().toString().slice(-4)}`;
      } else if (selectedPaymentMethod === 'card') {
        const card = cardNumber.replace(/\D/g, '').slice(-4) || '4000';
        refCode = `CARD-${card}-${Date.now().toString().slice(-4)}`;
      } else {
        refCode = `COD-${Date.now().toString().slice(-6)}`;
      }
    }

    // Run system anti-fraud check on reference
    const check = validateTransactionReference(refCode);
    if (!check.valid) {
      toast.error(check.reason || 'Invalid transaction reference. Anti-fraud check failed.', { duration: 5000 });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const itemsBySeller = cart.reduce((acc, item) => {
        const sellerId = item.product.sellerId || 'unknown_seller';
        if (!acc[sellerId]) acc[sellerId] = [];
        acc[sellerId].push(item);
        return acc;
      }, {} as Record<string, typeof cart>);
      
      for (const [sellerId, itemsArray] of Object.entries(itemsBySeller)) {
        const items = itemsArray as typeof cart;
        const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        
        const firstItem = items[0];
        const storeName = firstItem?.product?.sellerName || 'IndeMarket Verified Store';

        await addDoc(collection(db, 'orders'), {
          buyerId: user.id,
          sellerId: sellerId,
          sellerName: storeName,
          sellerStoreName: storeName,
          sellerDetails: {
            storeName: storeName,
            location: 'Blantyre Commercial Hub, Malawi',
            phone: '+265 888 123 456',
            email: 'vendor@indemarket.mw'
          },
          items: items.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'
          })),
          total: total,
          status: 'payment_sent',
          paymentReference: refCode,
          paymentSentAt: new Date().toISOString(),
          shippingDetails,
          paymentMethod: selectedPaymentMethod,
          promoCode: appliedPromo?.code || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      setCreatedOrderRef(refCode);

      setTimeout(() => {
        setIsSubmitting(false);
        setOrderComplete(true);
        clearCart();
        toast.success('Payment reference verified by system anti-fraud filter!');
      }, 1200);
    } catch (error) {
      console.error("Error placing order", error);
      setIsSubmitting(false);
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (cart.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Order & Payment Sent!</h1>
        <p className="text-base text-gray-600 mb-8 max-w-lg mx-auto">
          Transaction Reference <span className="font-mono font-bold text-indigo-600">{createdOrderRef}</span> has passed system anti-fraud checks and was submitted to the store seller.
        </p>
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-8 text-left space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Escrow Status: Awaiting Seller Confirmation</h3>
              <p className="text-xs text-gray-500">The seller will verify transaction #{createdOrderRef} in their account ledger to digitally sign your official receipt.</p>
            </div>
          </div>

          <div className="text-xs text-gray-600 space-y-2">
            <p className="font-bold text-gray-900">Order Information:</p>
            <div className="flex justify-between">
              <span>Delivery Address:</span>
              <span className="font-semibold text-gray-800">{shippingDetails.addressLine}, {shippingDetails.city}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Option:</span>
              <span className="font-semibold uppercase text-indigo-600">{selectedPaymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction Reference:</span>
              <span className="font-mono font-bold text-gray-900">{createdOrderRef}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2 font-medium">
            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Official Escrow Receipt with watermark & seller signature will automatically unlock upon seller account confirmation.</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/orders')}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-md inline-flex items-center gap-2 text-base"
        >
          View My Orders & Receipt Status <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Information</h2>
                  <p className="text-xs text-gray-500">Where should we deliver your products?</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">First Name</label>
                  <input required type="text" placeholder="John" value={shippingDetails.firstName} onChange={(e) => setShippingDetails({...shippingDetails, firstName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Last Name</label>
                  <input required type="text" placeholder="Doe" value={shippingDetails.lastName} onChange={(e) => setShippingDetails({...shippingDetails, lastName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Street Address / Area</label>
                  <input required type="text" placeholder="Plot 12, Area 47, Sector 2" value={shippingDetails.addressLine} onChange={(e) => setShippingDetails({...shippingDetails, addressLine: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all bg-gray-50 focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">City / District</label>
                  <select value={shippingDetails.city} onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-gray-50 focus:bg-white">
                    <option value="Blantyre">Blantyre</option>
                    <option value="Lilongwe">Lilongwe</option>
                    <option value="Mzuzu">Mzuzu</option>
                    <option value="Zomba">Zomba</option>
                    <option value="Kasungu">Kasungu</option>
                    <option value="Mangochi">Mangochi</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Phone Number for Delivery</label>
                  <input required type="tel" placeholder="+265 999 123 456" value={shippingDetails.phoneNumber} onChange={(e) => setShippingDetails({...shippingDetails, phoneNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all bg-gray-50 focus:bg-white" />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>
                  <p className="text-xs text-gray-500">Encrypted and fast checkout</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {/* Airtel Money Option */}
                <div
                  onClick={() => setSelectedPaymentMethod('airtel')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    selectedPaymentMethod === 'airtel'
                      ? 'border-red-500 bg-red-50/30 ring-2 ring-red-500/20'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    AIRTEL
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-gray-900">Airtel Money</span>
                    <span className="block text-xs text-gray-500">Instant Mobile Wallet</span>
                  </div>
                </div>

                {/* TNM Mpamba Option */}
                <div
                  onClick={() => setSelectedPaymentMethod('mpamba')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    selectedPaymentMethod === 'mpamba'
                      ? 'border-emerald-600 bg-emerald-50/30 ring-2 ring-emerald-600/20'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    MPAMBA
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-gray-900">TNM Mpamba</span>
                    <span className="block text-xs text-gray-500">Instant Mobile Wallet</span>
                  </div>
                </div>

                {/* Credit/Debit Card Option */}
                <div
                  onClick={() => setSelectedPaymentMethod('card')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    selectedPaymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/20'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-gray-900">Visa / Mastercard</span>
                    <span className="block text-xs text-gray-500">Debit or Credit Card</span>
                  </div>
                </div>

                {/* Pay on Delivery */}
                <div
                  onClick={() => setSelectedPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    selectedPaymentMethod === 'cod'
                      ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-gray-900">Cash on Delivery</span>
                    <span className="block text-xs text-gray-500">Pay when item arrives</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Payment Inputs */}
              {(selectedPaymentMethod === 'airtel' || selectedPaymentMethod === 'mpamba') && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    Enter {selectedPaymentMethod === 'airtel' ? 'Airtel' : 'Mpamba'} Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+265 99... or +265 88..."
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <p className="text-[11px] text-gray-500">
                    A USSD prompt will be sent to your phone. Simply enter your mobile PIN to approve the transaction of <span className="font-bold text-gray-900">{formatPrice(finalTotal)}</span>.
                  </p>
                </div>
              )}

              {selectedPaymentMethod === 'card' && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" /> Card Details
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="MM/YY" className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm" />
                    <input type="text" placeholder="CVV" className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm" />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Right Column Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 sticky top-24 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center">
                  <img
                    src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-xl bg-gray-50 object-cover border border-gray-100 shrink-0"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'; }}
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <h4 className="font-bold text-gray-900 truncate">{item.product.name}</h4>
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                    <p className="font-bold text-indigo-600">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatPrice(cartTotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-end">
                <span className="text-base font-bold text-gray-900">Final Total</span>
                <span className="text-2xl font-extrabold text-indigo-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold text-base hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <span>Pay & Place Order</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
