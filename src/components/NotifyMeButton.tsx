import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { NotifyMeModal } from './NotifyMeModal';

interface NotifyMeButtonProps {
  product: {
    id: string;
    name: string;
    images?: string[];
    price?: number;
  };
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
}

export function NotifyMeButton({ product, variant = 'full', className = '' }: NotifyMeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscribed = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('inde_stock_alerts') || '{}');
        if (stored[product.id]) {
          setIsSubscribed(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkSubscribed();
  }, [product.id, isModalOpen]);

  return (
    <>
      {isSubscribed ? (
        variant === 'icon' ? (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`p-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold border border-emerald-200 hover:bg-emerald-100 transition-all flex items-center justify-center ${className}`}
            title="Subscribed to back-in-stock alerts"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all ${className}`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Alert Set!</span>
          </button>
        )
      ) : variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`p-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold border border-amber-200 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center ${className}`}
          title="Notify me when back in stock"
        >
          <Bell className="w-5 h-5" />
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm ${className}`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notify Me</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`flex-1 bg-amber-500 hover:bg-amber-600 text-white px-6 py-4 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${className}`}
        >
          <Bell className="w-5 h-5 animate-pulse" />
          <span>Notify Me When Back in Stock</span>
        </button>
      )}

      <NotifyMeModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
