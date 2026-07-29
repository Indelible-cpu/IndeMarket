import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Product, CartItem, ensureFiveImages } from './mockData';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  flag: string;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  MWK: { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MWK ', rate: 1.0, flag: '🇲🇼' },
  ZMW: { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZMW ', rate: 0.0155, flag: '🇿🇲' },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R ', rate: 0.0105, flag: '🇿🇦' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.00057, flag: '🇺🇸' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.00052, flag: '🇪🇺' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.00045, flag: '🇬🇧' },
};

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed' | 'shipping';
  discountValue: number; // e.g. 10 for 10%, 5000 for 5000 MWK
  minSpend?: number;
  description: string;
}

export const AVAILABLE_PROMOS: PromoCode[] = [
  { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minSpend: 10000, description: '10% off on orders over MWK 10,000' },
  { code: 'INDE5000', discountType: 'fixed', discountValue: 5000, minSpend: 30000, description: 'MWK 5,000 off on orders over MWK 30,000' },
  { code: 'FREESHIP', discountType: 'shipping', discountValue: 100, minSpend: 15000, description: 'Free Express Shipping on orders over MWK 15,000' },
];

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  loading: boolean;
  currency: string;
  setCurrency: (code: string) => void;
  currencyInfo: CurrencyInfo;
  formatPrice: (mwkAmount: number) => string;
  convertPrice: (mwkAmount: number) => number;
  
  // Comparison
  comparedProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  
  // Saved for Later
  savedForLater: CartItem[];
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  removeSavedForLater: (productId: string) => void;

  // Promo Code
  appliedPromo: PromoCode | null;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  getDiscountAmount: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrencyState] = useState<string>(() => {
    return localStorage.getItem('inde_currency') || 'MWK';
  });

  const setCurrency = (code: string) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem('inde_currency', code);
      toast.success(`Currency changed to ${code} (${CURRENCIES[code].symbol.trim()})`, { id: 'curr-toast' });
    }
  };

  const currencyInfo = CURRENCIES[currency] || CURRENCIES.MWK;

  const convertPrice = (mwkAmount: number): number => {
    if (typeof mwkAmount !== 'number' || isNaN(mwkAmount)) return 0;
    return mwkAmount * currencyInfo.rate;
  };

  const formatPrice = (mwkAmount: number): string => {
    if (typeof mwkAmount !== 'number' || isNaN(mwkAmount)) return '';
    const converted = mwkAmount * currencyInfo.rate;
    if (currencyInfo.code === 'MWK') {
      return `${currencyInfo.symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${currencyInfo.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!user) {
      toast.error('Account required to buy products! Please log in or register.', {
        icon: '🔒',
        duration: 4000,
        id: 'auth-required'
      });
      window.location.pathname = '/login';
      return;
    }

    const formattedProduct = ensureFiveImages(product);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === formattedProduct.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === formattedProduct.id
            ? { ...item, product: formattedProduct, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product: formattedProduct, quantity }];
    });
    toast.success('Added to cart!');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Compare functions
  const addToCompare = (product: Product) => {
    setComparedProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        toast('Already in comparison list');
        return prev;
      }
      if (prev.length >= 4) {
        toast.error('You can compare up to 4 items at a time');
        return prev;
      }
      toast.success(`Added ${product.name} to compare`);
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => setComparedProducts([]);

  const isInCompare = (productId: string) => comparedProducts.some((p) => p.id === productId);

  // Saved for later functions
  const saveForLater = (productId: string) => {
    const itemToSave = cart.find((i) => i.product.id === productId);
    if (itemToSave) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      setSavedForLater((prev) => {
        if (prev.some((i) => i.product.id === productId)) return prev;
        return [...prev, itemToSave];
      });
      toast.success('Moved item to Saved for Later');
    }
  };

  const moveToCart = (productId: string) => {
    const itemToMove = savedForLater.find((i) => i.product.id === productId);
    if (itemToMove) {
      setSavedForLater((prev) => prev.filter((i) => i.product.id !== productId));
      setCart((prev) => {
        const existing = prev.find((i) => i.product.id === productId);
        if (existing) {
          return prev.map((i) =>
            i.product.id === productId ? { ...i, quantity: i.quantity + itemToMove.quantity } : i
          );
        }
        return [...prev, itemToMove];
      });
      toast.success('Moved item back to Cart');
    }
  };

  const removeSavedForLater = (productId: string) => {
    setSavedForLater((prev) => prev.filter((i) => i.product.id !== productId));
    toast.success('Removed from Saved for Later');
  };

  // Promo code functions
  const applyPromo = (code: string): boolean => {
    const found = AVAILABLE_PROMOS.find((p) => p.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      toast.error('Invalid promo code');
      return false;
    }
    if (found.minSpend && cartTotal < found.minSpend) {
      toast.error(`Minimum order amount of ${formatPrice(found.minSpend)} required for this code`);
      return false;
    }
    setAppliedPromo(found);
    toast.success(`Promo code '${found.code}' applied!`);
    return true;
  };

  const removePromo = () => {
    setAppliedPromo(null);
    toast.success('Promo code removed');
  };

  const getDiscountAmount = (): number => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discountType === 'percentage') {
      return (cartTotal * appliedPromo.discountValue) / 100;
    }
    if (appliedPromo.discountType === 'fixed') {
      return Math.min(appliedPromo.discountValue, cartTotal);
    }
    return 0; // shipping discount is calculated separately
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        loading,
        currency,
        setCurrency,
        currencyInfo,
        formatPrice,
        convertPrice,
        comparedProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        savedForLater,
        saveForLater,
        moveToCart,
        removeSavedForLater,
        appliedPromo,
        applyPromo,
        removePromo,
        getDiscountAmount,
      }}
    >
      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-600">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium text-gray-500">Loading IndeMarket...</p>
        </div>
      ) : (
        children
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

