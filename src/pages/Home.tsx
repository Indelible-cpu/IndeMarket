import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { mockCategories, mockProducts } from '../mockData';
import { useAppContext } from '../store';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

import { injectMockData } from '../lib/mockDataService';
import { handleProductImageError, getProductFallbackImage } from '../lib/imageUtils';

import { WishlistButton } from '../components/WishlistButton';
import { NotifyMeButton } from '../components/NotifyMeButton';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { FlashSaleSection } from '../components/FlashSaleSection';
import { Scale } from 'lucide-react';

export function Home() {
  const { user, addToCart, formatPrice, addToCompare, isInCompare } = useAppContext();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
      const snapshot = await getDocs(q);
      const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(fetchedProducts.length > 0 ? fetchedProducts : mockProducts);

      // Seed initial Recently Viewed items if local storage is empty for instant demonstration
      if (!localStorage.getItem('inde_recently_viewed') && fetchedProducts.length > 0) {
        const initialSeed = fetchedProducts.slice(0, 4).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          images: p.images,
          sellerName: p.sellerName,
          rating: p.rating,
          reviewsCount: p.reviewsCount,
          isVerifiedSeller: p.isVerifiedSeller,
          stock: p.stock,
          updatedAt: new Date().toISOString()
        }));
        localStorage.setItem('inde_recently_viewed', JSON.stringify(initialSeed));
      }
    } catch (error: any) {
      console.error("Error fetching products", error);
      setProducts(mockProducts);
      if (error?.code === 'unavailable') {
        console.error("Firestore is unavailable. Check network connection or firestoreDatabaseId.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleResetData = async () => {
    try {
      setLoading(true);
      await injectMockData();
      await fetchProducts();
      toast.success('Mock data reset successfully');
    } catch (error) {
      console.error("Failed to reset data", error);
      toast.error('Failed to reset mock data');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="bg-indigo-600 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-indigo-600 opacity-90"></div>
        <div className="relative px-5 py-10 sm:px-16 sm:py-24 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between">
          <div className="max-w-2xl text-white">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6">
              Buy & Sell Instantly
            </h1>
            <p className="text-sm sm:text-xl text-indigo-100 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              Join IndeMarket today. The most trusted multi-vendor marketplace to discover amazing products and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start w-full sm:w-auto">
              <Link to="/search" className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-sm sm:text-base font-bold text-indigo-600 bg-white rounded-full hover:bg-indigo-50 transition-colors shadow-lg w-full sm:w-auto">
                Start Shopping
              </Link>
              <Link to={user?.role === 'seller' ? "/seller/dashboard" : "/become-seller"} className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-sm sm:text-base font-bold text-white border-2 border-white rounded-full hover:bg-indigo-700 transition-colors w-full sm:w-auto">
                {user?.role === 'seller' ? 'Seller Dashboard' : 'Become a Seller'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Popular Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {mockCategories.map((category) => (
            <Link
              key={category.name}
              to={`/search?category=${encodeURIComponent(category.name)}`}
              className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center border border-gray-100 shadow-2xs hover:shadow-xl hover:scale-105 transition-all duration-200 group flex flex-col items-center cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3 rounded-full overflow-hidden group-hover:scale-110 transition-all shadow-2xs bg-gray-100 flex items-center justify-center shrink-0">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(category.name)}/400/400`;
                  }}
                />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale Limited Time Deals */}
      <FlashSaleSection products={products} />

      {/* Trending Products */}
      <section>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Trending Products</h2>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={handleResetData}
              className="text-[11px] sm:text-xs font-medium text-gray-500 hover:text-indigo-600 bg-gray-100 px-2.5 py-1 rounded-md"
            >
              Reset Data
            </button>
            <Link to="/search" className="text-indigo-600 hover:text-indigo-700 font-bold text-xs sm:text-sm">View all &rarr;</Link>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-gray-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">No products available yet. Check back soon!</div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.images?.[0] || getProductFallbackImage(product.id || product.name)}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => handleProductImageError(e, product.id || product.name)}
                  />
                  {product.stock === 0 ? (
                    <div className="absolute top-3 left-3 bg-gray-900/90 text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm">
                      OUT OF STOCK
                    </div>
                  ) : product.originalPrice && product.originalPrice > product.price ? (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      SALE
                    </div>
                  ) : null}
                  <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                    <WishlistButton product={product} />
                    <button
                      onClick={() => addToCompare(product)}
                      className={`p-2 rounded-full shadow-md transition-all ${
                        isInCompare(product.id)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/90 text-gray-700 hover:bg-white hover:text-indigo-600'
                      }`}
                      title={isInCompare(product.id) ? 'In Compare List' : 'Compare Product'}
                    >
                      <Scale className="w-4 h-4" />
                    </button>
                  </div>
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
                    <span className="text-sm text-gray-400">({product.reviewsCount || 0})</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-500">By</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      {product.sellerName}
                      {product.isVerifiedSeller && <ShieldCheck className="w-4 h-4 text-green-500" />}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                    {product.stock === 0 ? (
                      <NotifyMeButton product={product} variant="compact" />
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewed />
    </div>
  );
}
