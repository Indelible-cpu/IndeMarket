import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, MessageCircle, Clock, CheckCircle2, ChevronRight, Upload, XCircle, RefreshCw, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../store';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { OrderTrackingVisualization } from '../components/OrderTrackingVisualization';
import { EscrowReceiptModal } from '../components/EscrowReceiptModal';
import { validateTransactionReference } from '../lib/fraudCheck';
import { sendEscrowReceiptEmails } from '../lib/emailService';
import toast from 'react-hot-toast';
import { handleProductImageError, getProductFallbackImage } from '../lib/imageUtils';

export function Orders() {
  const { user, formatPrice } = useAppContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Return Modal State
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');

  // Escrow Receipt Modal State
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isSeller = user.role === 'seller';
    const q = query(
      collection(db, 'orders'),
      where(isSeller ? 'sellerId' : 'buyerId', '==', user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedOrders.sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.paymentSentAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.paymentSentAt || 0).getTime();
        return timeB - timeA;
      });
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const [paymentReference, setPaymentReference] = useState<{ [key: string]: string }>({});

  const handleMarkPaymentSent = async (orderId: string) => {
    const ref = (paymentReference[orderId] || '').trim();
    const check = validateTransactionReference(ref);
    if (!check.valid) {
      toast.error(check.reason || 'Invalid transaction reference pattern', { duration: 5000 });
      return;
    }

    await updateOrderStatus(orderId, 'payment_sent', {
      paymentReference: ref,
      paymentSentAt: new Date().toISOString()
    });
    toast.success('Payment reference verified by fraud filter and submitted to seller for account confirmation!');
  };

  const handleSellerConfirmPayment = async (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const ref = targetOrder.paymentReference || 'TXN-CONFIRMED';
    const storeName = (user as any)?.storeName || user?.name || 'Verified Vendor';

    if (!confirm(`Confirm that transaction ID "${ref}" for ${formatPrice(targetOrder.total)} has been received in your store account?\n\nThis will digitally sign and release the official escrow receipt to the buyer.`)) {
      return;
    }

    const confirmationDate = new Date().toISOString();
    const signatureHash = `SIG-IND-${orderId.slice(0, 6).toUpperCase()}-${ref.toUpperCase()}`;

    await updateOrderStatus(orderId, 'payment_received', {
      sellerConfirmationDate: confirmationDate,
      sellerSignatureHash: signatureHash,
      sellerStoreName: storeName,
      sellerPhone: (user as any)?.phone || '+265 888 123 456',
      sellerEmail: user?.email || 'seller@indemarket.mw'
    });

    toast.success('Transaction confirmed! Official signed escrow receipt generated with watermark.');

    // Dispatch automated email receipt to both buyer and seller
    const buyerEmail = targetOrder.shippingDetails?.email || targetOrder.buyerEmail || user?.email || 'customer@indemarket.mw';
    const sellerEmail = user?.email || 'vendor@indemarket.mw';
    const buyerName = `${targetOrder.shippingDetails?.firstName || 'Valued'} ${targetOrder.shippingDetails?.lastName || 'Customer'}`.trim();

    sendEscrowReceiptEmails({
      orderId: targetOrder.id,
      receiptNumber: `RCP-IND-${targetOrder.id.slice(0, 8).toUpperCase()}`,
      buyerName,
      buyerEmail,
      buyerAddress: `${targetOrder.shippingDetails?.addressLine || 'Address'}, ${targetOrder.shippingDetails?.city || 'Blantyre'}`,
      sellerStoreName: storeName,
      sellerEmail,
      sellerPhone: (user as any)?.phone || '+265 888 123 456',
      paymentMethod: targetOrder.paymentMethod || 'Airtel Money',
      paymentReference: ref,
      totalAmount: targetOrder.total,
      items: (targetOrder.items || []).map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price
      })),
      confirmationDate,
      securityHash: signatureHash
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, additionalData: any = {}) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      if (targetOrder.status === newStatus) {
        toast.error(`It's already done! Order is already marked as ${newStatus.replace('_', ' ')}.`, {
          id: `already-done-${orderId}-${newStatus}`,
          icon: 'ℹ️'
        });
        return;
      }
      if (newStatus === 'shipped' && (targetOrder.status === 'shipped' || targetOrder.status === 'completed')) {
        toast.error(`It's already done! Order is already shipped.`, { id: `already-done-${orderId}` });
        return;
      }
      if (newStatus === 'payment_received' && (targetOrder.status === 'payment_received' || targetOrder.status === 'shipped' || targetOrder.status === 'completed')) {
        toast.error(`It's already done! Payment is already marked as received.`, { id: `already-done-${orderId}` });
        return;
      }
    }

    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus, 
        updatedAt: new Date().toISOString(),
        ...additionalData
      });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, ...additionalData } : o));
    } catch (error) {
      console.error("Error updating order", error);
      toast.error("Failed to update status.");
    }
  };

  const handleRequestReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderId || !returnReason.trim()) return;

    await updateOrderStatus(returnOrderId, 'return_requested', { returnReason: returnReason.trim() });
    setReturnOrderId(null);
    setReturnReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Awaiting Payment</span>;
      case 'payment_sent':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Upload className="w-3 h-3 mr-1" /> Payment Sent</span>;
      case 'payment_received':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Payment Received</span>;
      case 'shipped':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"><Package className="w-3 h-3 mr-1" /> Shipped</span>;
      case 'completed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
      case 'return_requested':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><RefreshCw className="w-3 h-3 mr-1" /> Return Requested</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {user?.role === 'seller' ? 'Customer Orders' : 'My Orders'}
        </h1>
        <div className="text-sm text-gray-500">
          Showing recent orders
        </div>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-gray-500">No orders found.</p>
          </div>
        ) : orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order Placed</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-sm font-medium text-gray-900">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order #</p>
                  <p className="text-sm font-medium text-indigo-600">{order.id.slice(0, 8)}</p>
                </div>
              </div>
              <div>
                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* Order Body */}
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{user?.role === 'seller' ? 'Buyer ID:' : 'Seller ID:'}</span>
                  <span className="text-indigo-600">{user?.role === 'seller' ? order.buyerId : order.sellerId}</span>
                </div>

                {/* View Official Escrow Receipt Button */}
                <button
                  type="button"
                  onClick={() => setSelectedReceiptOrder(order)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                    order.status === 'payment_received' || order.status === 'shipped' || order.status === 'completed'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {order.status === 'payment_received' || order.status === 'shipped' || order.status === 'completed'
                      ? 'View Official Signed Receipt'
                      : 'View Escrow Receipt (Draft)'}
                  </span>
                </button>
              </div>

              <div className="my-5">
                <OrderTrackingVisualization order={order} />
              </div>

              <div className="space-y-4">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={item.image || getProductFallbackImage(item.productId || item.name || 'order-item')}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => handleProductImageError(e, item.productId || item.name || 'order-item')}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">
                        <Link to={`/product/${item.productId}`} className="hover:text-indigo-600">{item.name}</Link>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Area depending on status and role */}
              {user?.role === 'buyer' && (order.status === 'pending_payment' || order.status === 'payment_sent') && (
                <div className="mt-8 pt-6 border-t border-gray-100 bg-yellow-50/50 -mx-6 -mb-6 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Payment Status: {order.status === 'pending_payment' ? 'Awaiting Payment Reference' : 'Payment Reference Submitted'}</h4>
                    <p className="text-xs text-gray-600">Enter your genuine mobile money or bank SMS transaction reference below. System anti-fraud will verify format before notifying seller.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {order.status === 'pending_payment' && (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. MPA-881930" 
                          className="px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono"
                          value={paymentReference[order.id] || ''}
                          onChange={(e) => setPaymentReference({...paymentReference, [order.id]: e.target.value})}
                        />
                        <button 
                          onClick={() => handleMarkPaymentSent(order.id)} 
                          className="px-5 py-2 border border-transparent bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition-colors whitespace-nowrap"
                          disabled={!paymentReference[order.id]}
                        >
                          Submit & Notify Seller
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}
              
              {user?.role === 'buyer' && order.status === 'shipped' && (
                <div className="mt-8 pt-6 border-t border-gray-100 bg-indigo-50/50 -mx-6 -mb-6 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Order is on the way</h4>
                    <p className="text-sm text-gray-600">Please confirm once you have received the items.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setReturnOrderId(order.id)}
                      className="px-4 py-2.5 border border-amber-300 text-amber-800 text-xs font-bold rounded-xl hover:bg-amber-50"
                    >
                      Request Return
                    </button>
                    <button onClick={() => updateOrderStatus(order.id, 'completed')} className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-sm transition-colors flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Confirm Delivery
                    </button>
                  </div>
                </div>
              )}

              {user?.role === 'buyer' && order.status === 'completed' && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setReturnOrderId(order.id)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Request Return / Refund
                  </button>
                </div>
              )}

              {user?.role === 'seller' && (order.status === 'payment_sent' || order.status === 'pending_payment') && (
                <div className="mt-8 pt-6 border-t border-gray-100 bg-blue-50/50 -mx-6 -mb-6 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Verify Transaction Reference</h4>
                    <p className="text-xs text-gray-600">Check your bank or mobile money statement for this transaction ID:</p>
                    <p className="text-sm font-mono font-bold mt-1.5 p-2 bg-white rounded-xl border border-blue-200 text-blue-900 inline-block">
                      Ref: {order.paymentReference || 'Not submitted yet'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSellerConfirmPayment(order.id)}
                    disabled={!order.paymentReference}
                    className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    Confirm Transaction & Issue Signed Receipt
                  </button>
                </div>
              )}

              {user?.role === 'seller' && order.status === 'payment_received' && (
                <div className="mt-8 pt-6 border-t border-gray-100 bg-purple-50/50 -mx-6 -mb-6 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Payment Confirmed & Signed</h4>
                    <p className="text-xs text-gray-600">Official receipt with seller signature released to buyer. Ready to dispatch package.</p>
                  </div>
                  <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-sm transition-colors">
                    Mark as Shipped
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Return Request Modal */}
      {returnOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form onSubmit={handleRequestReturn} className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Request Return or Refund</h3>
                <p className="text-xs text-gray-500">Order #{returnOrderId.slice(0, 8)}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Reason for Return</label>
              <textarea
                required
                rows={3}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g. Defective unit, wrong size received, or missing accessories..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReturnOrderId(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Submit Return Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Escrow Receipt Modal */}
      {selectedReceiptOrder && (
        <EscrowReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
          onConfirmPaymentBySeller={(orderId) => {
            handleSellerConfirmPayment(orderId);
            setSelectedReceiptOrder(prev => prev ? {
              ...prev,
              status: 'payment_received',
              sellerConfirmationDate: new Date().toISOString(),
              sellerSignatureHash: `SIG-IND-${orderId.slice(0,6).toUpperCase()}-${(prev.paymentReference || 'TXN').toUpperCase()}`,
              sellerStoreName: (user as any)?.storeName || user?.name || 'Verified Vendor'
            } : null);
          }}
        />
      )}
    </div>
  );
}
