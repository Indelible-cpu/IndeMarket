import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAppContext } from '../store';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { handleProductImageError, getProductFallbackImage } from '../lib/imageUtils';

export function Wishlist() {
  const { user, addToCart, formatPrice } = useAppContext();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWishlist = async () => {
      let remoteItems: any[] = [];
      try {
        setLoading(true);
        const q = query(
          collection(db, 'wishlist'),
          where('userId', '==', user.id)
        );
        const snapshot = await getDocs(q);
        remoteItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        remoteItems.sort((a: any, b: any) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      } catch (error) {
        // Fallback silently to localStorage
      }

      // Merge with localStorage items
      let localItems: any[] = [];
      try {
        const saved = localStorage.getItem(`inde_wishlist_${user.id}`);
        if (saved) localItems = JSON.parse(saved);
      } catch (e) {
        // ignore
      }

      const combined = [...remoteItems];
      localItems.forEach(li => {
        if (!combined.some(ri => ri.productId === li.productId || ri.id === li.id)) {
          combined.push(li);
        }
      });

      setWishlistItems(combined);
      setLoading(false);
    };

    fetchWishlist();
  }, [user, navigate]);

  const removeFromWishlist = async (id: string) => {
    try {
      if (!id.startsWith('local-')) {
        try {
          await deleteDoc(doc(db, 'wishlist', id));
        } catch (e) {
          // ignore remote delete failure
        }
      }
      
      setWishlistItems(prev => {
        const next = prev.filter(item => item.id !== id);
        if (user) {
          try {
            localStorage.setItem(`inde_wishlist_${user.id}`, JSON.stringify(next));
          } catch (e) {}
        }
        return next;
      });
      
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-indigo-600 fill-current" />
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <p className="text-lg text-gray-500">Loading your wishlist...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-indigo-200" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            Save items you love to your wishlist. Review them anytime and easily move them to your cart when you're ready to buy.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const product = item.product;
            if (!product) return null;
            
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.images?.[0] || getProductFallbackImage(product.id || product.name)}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => handleProductImageError(e, product.id || product.name)}
                  />
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      SALE
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                      <Link to={`/product/${product.id}`} className="hover:text-indigo-600 transition-colors">
                        {product.name}
                      </Link>
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{product.rating || 0}</span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-4">
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
