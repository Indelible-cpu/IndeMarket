import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, Tag, TrendingUp, ChevronRight, Package, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { mockCategories, mockProducts, Product } from '../mockData';
import { useAppContext } from '../store';
import { handleProductImageError, getProductFallbackImage } from '../lib/imageUtils';

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSearchSubmitted?: () => void;
  autoFocus?: boolean;
}

const RECENT_SEARCHES_KEY = 'inde_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export function SearchAutocomplete({
  placeholder = "Search products, brands, categories...",
  className = "",
  inputClassName = "",
  onSearchSubmitted,
  autoFocus = false
}: SearchAutocompleteProps) {
  const { formatPrice } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load recent searches:', err);
    }
  }, []);

  // Fetch products from Firestore (fallback to mockProducts if offline/empty)
  useEffect(() => {
    let isMounted = true;
    const fetchProductsForSearch = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(100));
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));
        const snap = await Promise.race([getDocs(q), timeoutPromise]) as any;
        
        if (isMounted && snap?.docs?.length > 0) {
          const fetched = snap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as Product[];
          setProducts(fetched);
        } else if (isMounted) {
          setProducts(mockProducts);
        }
      } catch (err) {
        if (isMounted) {
          setProducts(mockProducts);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProductsForSearch();
    return () => { isMounted = false; };
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute matched categories and products based on current search term
  const trimmedTerm = searchTerm.trim().toLowerCase();

  const matchedCategories = useMemo(() => {
    if (!trimmedTerm) return [];
    return mockCategories.filter(cat =>
      cat.name.toLowerCase().includes(trimmedTerm)
    );
  }, [trimmedTerm]);

  const matchedProducts = useMemo(() => {
    if (!trimmedTerm) return [];
    return products.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(trimmedTerm);
      const catMatch = p.category?.toLowerCase().includes(trimmedTerm);
      const descMatch = p.description?.toLowerCase().includes(trimmedTerm);
      const sellerMatch = p.sellerName?.toLowerCase().includes(trimmedTerm);
      return nameMatch || catMatch || descMatch || sellerMatch;
    }).slice(0, 6); // limit to 6 top product suggestions
  }, [trimmedTerm, products]);

  // Combine suggestions into a flattened indexable list for keyboard navigation
  const suggestionsList = useMemo(() => {
    if (!trimmedTerm) return [];
    const items: Array<{ type: 'product' | 'category' | 'fullSearch'; data: any }> = [];

    // Matched categories first
    matchedCategories.slice(0, 2).forEach(cat => {
      items.push({ type: 'category', data: cat });
    });

    // Matched products
    matchedProducts.forEach(prod => {
      items.push({ type: 'product', data: prod });
    });

    // View all results option at the end
    items.push({ type: 'fullSearch', data: { query: searchTerm.trim() } });

    return items;
  }, [trimmedTerm, matchedCategories, matchedProducts, searchTerm]);

  // Reset selected keyboard index when search term changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchTerm]);

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const updated = [clean, ...recentSearches.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== termToRemove);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const executeSearch = (queryStr: string) => {
    const clean = queryStr.trim();
    if (!clean) return;
    saveRecentSearch(clean);
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(clean)}`);
    if (onSearchSubmitted) onSearchSubmitted();
  };

  const navigateToProduct = (product: Product) => {
    saveRecentSearch(product.name);
    setIsOpen(false);
    navigate(`/product/${product.id}`);
    if (onSearchSubmitted) onSearchSubmitted();
  };

  const navigateToCategory = (categoryName: string) => {
    saveRecentSearch(categoryName);
    setIsOpen(false);
    navigate(`/search?category=${encodeURIComponent(categoryName)}`);
    if (onSearchSubmitted) onSearchSubmitted();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestionsList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestionsList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestionsList.length) {
        const item = suggestionsList[selectedIndex];
        if (item.type === 'product') {
          navigateToProduct(item.data);
        } else if (item.type === 'category') {
          navigateToCategory(item.data.name);
        } else if (item.type === 'fullSearch') {
          executeSearch(searchTerm);
        }
      } else {
        executeSearch(searchTerm);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Helper function to highlight search keyword in text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-indigo-100 text-indigo-900 font-bold rounded px-0.5 py-0">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          executeSearch(searchTerm);
        }}
        className="relative w-full group"
      >
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full pl-11 pr-10 py-2.5 bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none text-sm text-gray-900 placeholder-gray-400 ${inputClassName}`}
        />
        <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />

        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
          
          {/* STATE A: User is typing (trimmedTerm is present) */}
          {trimmedTerm ? (
            <div>
              {/* Category Matches */}
              {matchedCategories.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" /> Categories
                  </div>
                  {matchedCategories.map((cat) => {
                    const idx = suggestionsList.findIndex(s => s.type === 'category' && s.data.name === cat.name);
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => navigateToCategory(cat.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-xl transition-colors ${
                          isSelected ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={cat.image} 
                            alt={cat.name} 
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-md object-cover bg-gray-100 shrink-0" 
                            onError={(e) => {
                              e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(cat.name)}/400/400`;
                            }}
                          />
                          <span>In <span className="font-semibold">{highlightText(cat.name, trimmedTerm)}</span></span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Product Matches */}
              <div className="p-2">
                <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-500" /> Products ({matchedProducts.length})
                  </span>
                  {loading && <span className="text-[10px] text-gray-400 animate-pulse">Updating...</span>}
                </div>

                {matchedProducts.length > 0 ? (
                  matchedProducts.map((product) => {
                    const idx = suggestionsList.findIndex(s => s.type === 'product' && s.data.id === product.id);
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => navigateToProduct(product)}
                        className={`w-full flex items-center gap-3 p-2.5 text-left rounded-xl transition-all ${
                          isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'hover:bg-gray-50'
                        }`}
                      >
                        <img
                          src={product.images?.[0] || getProductFallbackImage(product.id || product.name)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-100"
                          onError={(e) => handleProductImageError(e, product.id || product.name)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {highlightText(product.name, trimmedTerm)}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-indigo-600 font-semibold">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 truncate">{product.category}</span>
                            {product.stock === 0 && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-gray-500">
                    No exact product matches found for "<span className="font-medium text-gray-800">{searchTerm}</span>"
                  </div>
                )}
              </div>

              {/* View All Search Option */}
              <div className="p-2 bg-gray-50/80 border-t border-gray-100">
                {(() => {
                  const idx = suggestionsList.findIndex(s => s.type === 'fullSearch');
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      type="button"
                      onClick={() => executeSearch(searchTerm)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                        isSelected ? 'bg-indigo-600 text-white' : 'text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Search all results for "<span className="font-bold">{searchTerm}</span>"
                      </span>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                    </button>
                  );
                })()}
              </div>
            </div>
          ) : (
            /* STATE B: Empty Input (Recent searches & Popular categories) */
            <div>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" /> Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[11px] font-medium text-indigo-600 hover:underline lowercase"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => executeSearch(term)}
                        className="group flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Clock className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500" />
                          {term}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Categories & Trending */}
              <div className="p-3 bg-gray-50/50">
                <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Popular Categories
                </div>
                <div className="flex flex-wrap gap-1.5 p-1">
                  {mockCategories.slice(0, 6).map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => navigateToCategory(cat.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 rounded-full text-xs font-medium text-gray-700 transition-all shadow-2xs"
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Prompt */}
              <div className="p-3 text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Type any keyword to instantly preview items</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
