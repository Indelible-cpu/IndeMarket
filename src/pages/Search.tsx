import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, ShoppingCart, Filter, X, Eye } from 'lucide-react';
import { mockCategories, mockProducts } from '../mockData';
import { useAppContext } from '../store';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Breadcrumb } from '../components/Breadcrumb';
import { WishlistButton } from '../components/WishlistButton';
import { NotifyMeButton } from '../components/NotifyMeButton';
import { handleProductImageError, getProductFallbackImage } from '../lib/imageUtils';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, formatPrice, currencyInfo } = useAppContext();
  
  const categoryQuery = searchParams.get('category');
  const searchQuery = searchParams.get('q');

  const [activeCategory, setActiveCategory] = useState(categoryQuery || 'All');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        } else {
          setProducts(mockProducts);
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
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryQuery) {
      setActiveCategory(categoryQuery);
    } else {
      setActiveCategory('All');
    }
  }, [categoryQuery]);

  const maxAvailablePrice = useMemo(() => {
    if (products.length === 0) return 1000000;
    return Math.max(...products.map(p => p.price || 0));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      let matchesCategory = true;
      let matchesSearch = true;
      let matchesPrice = true;

      if (activeCategory && activeCategory !== 'All') {
        matchesCategory = product.category?.toLowerCase() === activeCategory.toLowerCase();
      }

      if (searchQuery) {
        matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      }

      if (minPrice !== '') {
        matchesPrice = matchesPrice && (product.price >= minPrice);
      }
      if (maxPrice !== '') {
        matchesPrice = matchesPrice && (product.price <= maxPrice);
      }

      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [activeCategory, searchQuery, products, minPrice, maxPrice]);

  return (
    <div className="animate-in fade-in duration-500">
      <Breadcrumb
        items={[
          ...(searchQuery ? [{ label: `Search: ${searchQuery}` }] : activeCategory !== 'All' ? [{ label: activeCategory }] : [{ label: 'All Products' }])
        ]}
      />

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="hidden md:block w-full md:w-64 shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveCategory('All');
                      setSearchParams(searchQuery ? { q: searchQuery } : {});
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === 'All' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Categories
                  </button>
                  {mockCategories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setActiveCategory(cat.name);
                        setSearchParams(searchQuery ? { category: cat.name, q: searchQuery } : { category: cat.name });
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory.toLowerCase() === cat.name.toLowerCase() ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Price Range ({currencyInfo.code})</h3>
                
                <div className="mb-4">
                  <input 
                    type="range" 
                    min="0" 
                    max={maxAvailablePrice} 
                    value={maxPrice === '' ? maxAvailablePrice : maxPrice} 
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0</span>
                    <span>{formatPrice(maxAvailablePrice)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
                  />
                  <span className="text-gray-400">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" 
                  />
                </div>
                {(minPrice !== '' || maxPrice !== '') && (
                  <button 
                    onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                    className="mt-3 text-xs text-indigo-600 font-medium hover:underline"
                  >
                    Clear Price Filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {searchQuery ? `Search results for "${searchQuery}"` : activeCategory !== 'All' ? `${activeCategory} Products` : 'All Products'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Showing {filteredProducts.length} results</p>
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 shadow-2xs transition-all w-full sm:w-auto"
            >
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Filter Products ({activeCategory !== 'All' || minPrice !== '' || maxPrice !== '' ? 'Active' : 'All'})</span>
            </button>
          </div>

          {/* Mobile Filter Drawer Modal */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-sm">Categories</h4>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      <button
                        onClick={() => {
                          setActiveCategory('All');
                          setSearchParams(searchQuery ? { q: searchQuery } : {});
                        }}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${activeCategory === 'All' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        All Categories
                      </button>
                      {mockCategories.map(cat => (
                        <button
                          key={cat.name}
                          onClick={() => {
                            setActiveCategory(cat.name);
                            setSearchParams(searchQuery ? { category: cat.name, q: searchQuery } : { category: cat.name });
                          }}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${activeCategory.toLowerCase() === cat.name.toLowerCase() ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-3 text-sm">Price Range ({currencyInfo.code})</h4>
                    <div className="flex items-center gap-2 mb-4">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500" 
                      />
                      <span className="text-gray-400">-</span>
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2 mt-auto">
                  <button
                    onClick={() => { setActiveCategory('All'); setSearchParams({}); setMinPrice(''); setMaxPrice(''); }}
                    className="flex-1 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 px-3 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <p className="text-lg text-gray-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <p className="text-lg text-gray-500 mb-4">No products found matching your criteria.</p>
              <button
                onClick={() => { setActiveCategory('All'); setSearchParams({}); setMinPrice(''); setMaxPrice(''); }}
                className="text-indigo-600 font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.images?.[0] || getProductFallbackImage(product.id || product.name)}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => handleProductImageError(e, product.id || product.name)}
                    />
                    {product.stock === 0 && (
                      <div className="absolute top-2 left-2 bg-gray-900/90 text-white text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md backdrop-blur-sm">
                        OUT OF STOCK
                      </div>
                    )}
                    <div className="absolute top-2 right-2 z-10">
                      <WishlistButton product={product} />
                    </div>
                  </div>
                  
                  <div className="p-3.5 sm:p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="text-sm sm:text-lg font-medium text-gray-900 line-clamp-2">
                        <Link to={`/product/${product.id}`} className="hover:text-indigo-600 transition-colors">
                          {product.name}
                        </Link>
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">{product.rating || 0}</span>
                    </div>
    
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
                      <span>By</span>
                      <span className="font-medium text-gray-900 flex items-center gap-1 truncate">
                        {product.sellerName}
                        {product.isVerifiedSeller && <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                      </span>
                    </div>
                    
                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-1">
                      <div className="flex flex-col">
                        <span className="text-base sm:text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          to={`/product/${product.id}`}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                          title="View product images and details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                        {product.stock === 0 ? (
                          <NotifyMeButton product={product} variant="compact" />
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors focus:outline-none shrink-0"
                            title="Buy or Add to Cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
