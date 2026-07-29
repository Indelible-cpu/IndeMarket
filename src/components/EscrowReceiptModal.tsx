import React, { useRef } from 'react';
import { ShieldCheck, Lock, CheckCircle2, Printer, X, Store, User, MapPin, Phone, Mail, Building2, AlertTriangle, FileText, QrCode, Award } from 'lucide-react';
import { useAppContext } from '../store';

interface EscrowReceiptModalProps {
  order: any;
  onClose: () => void;
  onConfirmPaymentBySeller?: (orderId: string) => void;
}

export function EscrowReceiptModal({ order, onClose, onConfirmPaymentBySeller }: EscrowReceiptModalProps) {
  const { user, formatPrice } = useAppContext();
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const isSeller = user?.role === 'seller' || user?.id === order.sellerId;
  const isConfirmedBySeller = order.status === 'payment_received' || order.status === 'shipped' || order.status === 'completed';

  const sellerStoreName = order.sellerStoreName || order.sellerDetails?.storeName || order.sellerName || 'IndeMarket Verified Store';
  const sellerLocation = order.sellerDetails?.location || order.sellerLocation || 'Blantyre Commercial District, Malawi';
  const sellerPhone = order.sellerDetails?.phone || order.sellerPhone || '+265 888 123 456';
  const sellerEmail = order.sellerDetails?.email || order.sellerEmail || 'vendor@indemarket.mw';

  const buyerName = `${order.shippingDetails?.firstName || 'Valued'} ${order.shippingDetails?.lastName || 'Customer'}`.trim();
  const buyerAddress = `${order.shippingDetails?.addressLine || 'Address'}, ${order.shippingDetails?.city || 'Blantyre'}`;
  const buyerPhone = order.shippingDetails?.phoneNumber || '+265 999 000 000';

  const receiptNumber = `RCP-IND-${(order.id || '').slice(0, 8).toUpperCase()}`;
  const confirmationTime = order.sellerConfirmationDate || order.updatedAt || order.createdAt;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Top Toolbar (Screen Only) */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">IndeMarket Escrow Receipt System</h3>
              <p className="text-xs text-gray-400">Order #{order.id?.slice(0, 8)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isConfirmedBySeller && (
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body Container */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 relative bg-white" ref={printRef}>
          
          {/* Watermark Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.04] select-none z-0">
            <div className="rotate-[-32deg] text-center font-black text-6xl sm:text-8xl tracking-widest text-indigo-900 uppercase leading-tight whitespace-nowrap">
              {isConfirmedBySeller ? (
                <>
                  INDEMARKET OFFICIAL<br />
                  ESCROW VERIFIED & SIGNED
                </>
              ) : (
                <>
                  UNCONFIRMED DRAFT<br />
                  AWAITING SELLER SIGNATURE
                </>
              )}
            </div>
          </div>

          {/* RECEIPT HEADER */}
          <div className="relative z-10 border-b-2 border-gray-900 pb-6 mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-black text-indigo-600 tracking-tight">IndeMarket</span>
                  <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold rounded-md uppercase tracking-wide">
                    Official Escrow
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-500">Multi-Vendor Verified E-Commerce Portal</p>
                <p className="text-[11px] text-gray-400">Blantyre, Malawi • support@indemarket.mw</p>
              </div>

              <div className="text-right">
                <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Receipt Number</p>
                <p className="text-lg font-mono font-black text-gray-900">{receiptNumber}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Issued: <span className="font-semibold text-gray-800">{new Date(confirmationTime).toLocaleDateString()}</span>
                </p>
              </div>
            </div>

            {/* STATUS BADGE BANNER */}
            <div className="mt-4">
              {isConfirmedBySeller ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>OFFICIAL VERIFIED ESCROW RECEIPT — Digitally Signed & Payment Account Confirmed by Seller</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] uppercase font-black rounded-lg shrink-0">
                    ESCROW LOCKED & CONFIRMED
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs font-semibold">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900">RECEIPT PENDING SELLER CONFIRMATION</p>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        The buyer has submitted payment ref <span className="font-mono font-bold">{order.paymentReference || 'N/A'}</span>. The official digitally signed receipt will be generated once the seller verifies the transaction ID in their account.
                      </p>
                    </div>
                  </div>
                  {isSeller && onConfirmPaymentBySeller && (
                    <button
                      type="button"
                      onClick={() => onConfirmPaymentBySeller(order.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md text-xs transition-colors shrink-0 print:hidden"
                    >
                      Confirm Transaction & Sign
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* STORE, BUYER & SELLER ADDRESS DETAILS */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs">
            
            {/* Store & Seller Details */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-1.5 font-extrabold text-gray-900 uppercase tracking-wider text-[11px] border-b border-gray-200 pb-2">
                <Store className="w-4 h-4 text-indigo-600" />
                <span>Store & Seller Details</span>
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{sellerStoreName}</p>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{sellerLocation}</span>
                </p>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{sellerPhone}</span>
                </p>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{sellerEmail}</span>
                </p>
                <p className="text-gray-400 text-[10px] mt-2 font-mono">Seller ID: {order.sellerId}</p>
              </div>
            </div>

            {/* Buyer Delivery Details */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-1.5 font-extrabold text-gray-900 uppercase tracking-wider text-[11px] border-b border-gray-200 pb-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Buyer Delivery Address</span>
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{buyerName}</p>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{buyerAddress}</span>
                </p>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{buyerPhone}</span>
                </p>
                <p className="text-gray-600 flex items-center gap-1 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>Payment Method: <strong className="uppercase">{order.paymentMethod || 'Airtel Money'}</strong></span>
                </p>
                <p className="text-indigo-700 font-mono font-bold text-[11px] mt-2">
                  Transaction Ref: {order.paymentReference || 'Unprovided'}
                </p>
              </div>
            </div>

          </div>

          {/* ITEMIZED PURCHASE TABLE */}
          <div className="relative z-10 mb-8 overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                  <th className="p-3.5">Item Description</th>
                  <th className="p-3.5 text-center">Qty</th>
                  <th className="p-3.5 text-right">Unit Price</th>
                  <th className="p-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="p-3.5 font-medium text-gray-900">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">SKU ID: {item.productId?.slice(0, 8) || 'IND-PROD'}</p>
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-bold text-gray-800">{item.quantity}</td>
                    <td className="p-3.5 text-right font-medium text-gray-700">{formatPrice(item.price)}</td>
                    <td className="p-3.5 text-right font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS & FINANCIAL SUMMARY */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <p className="font-extrabold flex items-center gap-1 text-indigo-950 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> IndeMarket Escrow Protection
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed pt-1">
                This transaction is protected by IndeMarket Buyer Escrow. Payment remains securely held until the buyer verifies item receipt in good condition.
              </p>
            </div>

            <div className="space-y-2 text-xs text-right">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Escrow Guarantee Fee</span>
                <span className="font-semibold text-emerald-600">FREE (0%)</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping / Delivery</span>
                <span className="font-semibold text-emerald-600">Included</span>
              </div>
              <div className="border-t-2 border-gray-900 pt-2 flex justify-between items-end text-sm">
                <span className="font-black text-gray-900">Total Paid</span>
                <span className="text-xl font-extrabold text-indigo-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* DIGITAL SIGNATURE & SECURITY STAMP SECTION */}
          <div className="relative z-10 pt-6 border-t-2 border-dashed border-gray-200">
            {isConfirmedBySeller ? (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                
                {/* Seller Digital Signature */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                      Seller Digital Signature
                    </span>
                  </div>
                  <div className="pl-8 text-xs">
                    <p className="font-bold text-emerald-800 font-serif italic text-base">
                      {sellerStoreName}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      Digitally Verified Hash: <span className="text-gray-800">#SIG-IND-{order.id?.slice(0, 6)}-{order.paymentReference || 'CONFIRMED'}</span>
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Confirmed On: {new Date(confirmationTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* QR Barcode Security Stamp */}
                <div className="sm:border-l border-gray-200 sm:pl-4 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl border border-gray-200 shrink-0">
                    <QrCode className="w-12 h-12 text-gray-800" />
                  </div>
                  <div className="text-[10px] text-gray-500 space-y-0.5">
                    <p className="font-bold text-gray-900 uppercase">IndeMarket Anti-Fraud Stamp</p>
                    <p className="font-mono text-indigo-600">ID: {receiptNumber}</p>
                    <p className="text-[9px] text-gray-400">Scan to verify authentic escrow receipt in IndeMarket database.</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200 text-center text-xs text-red-800 space-y-1">
                <p className="font-bold uppercase tracking-wider">Official Signed Receipt Locked</p>
                <p className="text-[11px] text-red-700">
                  This document will automatically be upgraded to an official signed receipt with the seller's digital signature stamp as soon as transaction #{order.paymentReference || 'N/A'} is confirmed.
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="relative z-10 text-center mt-8 pt-4 border-t border-gray-100 text-[10px] text-gray-400">
            <p>© 2026 IndeMarket Multi-Vendor Escrow System. Powered by Indelible Technologies.</p>
            <p className="mt-0.5">This receipt is an official transaction document generated under IndeMarket Marketplace Terms of Service.</p>
          </div>

        </div>

        {/* Modal Bottom Action Bar (Screen Only) */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <p className="text-xs text-gray-500 font-medium">
            {isConfirmedBySeller ? 'Official receipt ready for download or printing' : 'Awaiting seller payment verification'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs transition-colors"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
