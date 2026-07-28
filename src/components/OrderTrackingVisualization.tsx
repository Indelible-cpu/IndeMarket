import React, { useState } from 'react';
import { 
  ShoppingBag, 
  CreditCard, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Building2,
  Copy,
  Check
} from 'lucide-react';

interface OrderTrackingProps {
  order: {
    id: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    total?: number;
    paymentReference?: string;
    shippingAddress?: string;
    sellerId?: string;
    buyerId?: string;
  };
  compact?: boolean;
}

const STEPS = [
  {
    id: 'pending_payment',
    label: 'Order Placed',
    icon: ShoppingBag,
    description: 'Order created & waiting for payment',
    estimatedTime: 'Day 1'
  },
  {
    id: 'payment_sent',
    label: 'Payment Sent',
    icon: CreditCard,
    description: 'Buyer submitted payment details',
    estimatedTime: 'Day 1'
  },
  {
    id: 'payment_received',
    label: 'Processing',
    icon: PackageCheck,
    description: 'Payment confirmed & order being packed',
    estimatedTime: 'Day 1 - 2'
  },
  {
    id: 'shipped',
    label: 'Shipped',
    icon: Truck,
    description: 'Package handed to courier & in transit',
    estimatedTime: 'Day 2 - 3'
  },
  {
    id: 'completed',
    label: 'Delivered',
    icon: CheckCircle2,
    description: 'Order delivered & confirmed by buyer',
    estimatedTime: 'Day 3 - 4'
  }
];

export function OrderTrackingVisualization({ order, compact = false }: OrderTrackingProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const currentStepIndex = STEPS.findIndex(s => s.id === order.status) >= 0 
    ? STEPS.findIndex(s => s.id === order.status) 
    : 0;

  const trackingNumber = `IND-${order.id.slice(0, 8).toUpperCase()}`;

  // Estimate delivery date based on order creation date
  const createdDate = new Date(order.createdAt);
  const estDeliveryMin = new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000);
  const estDeliveryMax = new Date(createdDate.getTime() + 4 * 24 * 60 * 60 * 1000);
  const formattedEstRange = `${estDeliveryMin.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${estDeliveryMax.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const copyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const getStepDate = (index: number) => {
    if (index > currentStepIndex) return 'Pending';
    if (index === 0) return new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    if (order.updatedAt && index === currentStepIndex) {
      return new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    }
    return 'Completed';
  };

  // Progress percentage (0% to 100%)
  const progressPercent = (currentStepIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-2xl p-4 sm:p-6 border border-gray-100/80 shadow-xs space-y-6">
      
      {/* Top Meta Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              <Truck className="w-3.5 h-3.5" />
              Package Status
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              Carrier: <span className="text-gray-900 font-bold">Inde Express Courier</span>
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm font-medium text-gray-500">Tracking #:</span>
            <span className="font-mono text-sm font-bold text-gray-900 bg-white px-2.5 py-0.5 rounded-md border border-gray-200 shadow-2xs">
              {trackingNumber}
            </span>
            <button
              onClick={copyTracking}
              type="button"
              className="p-1 hover:bg-gray-200/60 text-gray-400 hover:text-indigo-600 rounded transition-colors"
              title="Copy Tracking Number"
            >
              {copiedTracking ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Estimated Delivery Badge */}
        <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {order.status === 'completed' ? 'Delivered On' : 'Estimated Delivery'}
            </div>
            <div className="text-xs sm:text-sm font-bold text-gray-900">
              {order.status === 'completed' && order.updatedAt
                ? new Date(order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : formattedEstRange}
            </div>
          </div>
        </div>
      </div>

      {/* Step Progress Visualizer Bar */}
      <div className="pt-2 pb-2">
        {/* Desktop & Tablet Step Progress Bar */}
        <div className="relative">
          {/* Background Connecting Rail */}
          <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200 rounded-full -z-0" />
          
          {/* Active Filled Progress Rail */}
          <div 
            className="absolute top-5 left-6 h-1 bg-indigo-600 rounded-full transition-all duration-700 ease-out -z-0"
            style={{ width: `calc(${progressPercent}% * 0.88)` }}
          />

          {/* Step Indicators Grid */}
          <div className="relative z-10 flex justify-between items-start w-full">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isUpcoming = idx > currentStepIndex;

              return (
                <div 
                  key={step.id} 
                  className="flex flex-col items-center text-center max-w-[80px] sm:max-w-[110px]"
                >
                  {/* Step Node Circle */}
                  <div className="relative group">
                    <div 
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 font-bold ${
                        isCompleted 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-100' 
                          : isCurrent 
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 shadow-lg scale-110 animate-pulse' 
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>

                    {/* Active pulse ring for current step */}
                    {isCurrent && (
                      <span className="absolute -inset-1 rounded-full bg-indigo-400/30 animate-ping -z-10" />
                    )}
                  </div>

                  {/* Step Labels */}
                  <div className="mt-3 space-y-0.5">
                    <div className={`text-xs font-bold leading-snug ${
                      isCurrent 
                        ? 'text-indigo-600 scale-105' 
                        : isCompleted 
                        ? 'text-gray-900' 
                        : 'text-gray-400'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] text-gray-500 hidden sm:block line-clamp-1">
                      {getStepDate(idx)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Active Status Banner */}
      <div className="bg-white rounded-xl p-3.5 border border-indigo-100 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
            {React.createElement(STEPS[currentStepIndex].icon, { className: "w-5 h-5" })}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <span>{STEPS[currentStepIndex].label}</span>
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {STEPS[currentStepIndex].description}
            </p>
          </div>
        </div>

        {/* Toggle Detailed History button */}
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 shrink-0"
        >
          <span>{showHistory ? 'Hide Logs' : 'View Timeline'}</span>
          {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Detailed Activity History Timeline */}
      {showHistory && (
        <div className="bg-white rounded-xl p-4 border border-gray-200/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Package Tracking History
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative flex items-start gap-3 text-xs">
                  {/* Timeline bullet circle */}
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                    isCurrent 
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-200' 
                      : isCompleted 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="w-3 h-3" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {getStepDate(idx)}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
