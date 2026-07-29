import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShoppingCart, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { Product, mockProducts } from '../mockData';
import { useAppContext } from '../store';
import { WishlistButton } from './WishlistButton';
import { handleProductImageError, getProductFallbackImage } from '../lib/imageUtils';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface RelatedProductsProps {
  currentProduct: Product | any;
}

interface RecommendedItem {
  product: Product;
  reason: string;
  matchScore: number;
}

export function RelatedProducts({ currentProduct }: RelatedProductsProps) {
  const { addToCart, formatPrice } = useAppContext();
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [summaryInsight, setSummaryInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);

  const fetchRecommendations = async () => {
    if (!currentProduct) return;
    setLoading(true);

    try {
      // Get catalog candidate products from Firestore or mockData
      let candidates: Product[] = [];
      try {
        const q = query(collection(db, 'products'), limit(30));
        const snap = await getDocs(q);
        if (!snap.empty) {
          candidates = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        }
      } catch (err) {
        console.warn('Firestore fetch for candidates failed, falling back to mockProducts:', err);
      }

      if (candidates.length === 0) {
        candidates = mockProducts;
      }

      // Filter out current product
      const candidateList = candidates.filter(p => p.id !== currentProduct.id);

      // Request Gemini-powered recommendations from server API
      const res = await fetch('/api/related-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentProduct: {
            id: currentProduct.id,
            name: currentProduct.name,
            category: currentProduct.category,
            description: currentProduct.description,
            price: currentProduct.price,
            tags: (currentProduct as any).tags || []
          },
          candidateProducts: candidateList.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            description: p.description,
            tags: (p as any).tags || []
          }))
        })
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const data = await res.json();
      const recs: { productId: string; reason: string; matchScore: number }[] = data.recommendations || [];

      // Map back to full product objects
      const mapped: RecommendedItem[] = recs
        .map(rec => {
          const matchedProd = candidateList.find(p => p.id === rec.productId);
          if (!matchedProd) return null;
          return {
            product: matchedProd,
            reason: rec.reason,
            matchScore: rec.matchScore || 85
          };
        })
        .filter((item): item is RecommendedItem => item !== null);

      if (mapped.length > 0) {
        setRecommendations(mapped);
        setSummaryInsight(data.summaryInsight || '');
        setIsAiGenerated(!!data.aiGenerated);
      } else {
        // Fallback if mapping returned empty
        const categoryFallback = candidateList
          .filter(p => p.category === currentProduct.category)
          .slice(0, 4)
          .map(p => ({
            product: p,
            reason: `Top recommendation in ${currentProduct.category}`,
            matchScore: 85
          }));
        setRecommendations(categoryFallback);
        setSummaryInsight(`Smart selections from ${currentProduct.category}`);
        setIsAiGenerated(false);
      }
    } catch (error) {
      console.warn('Error fetching Gemini related products:', error);
      // Graceful category fallback
      const fallbackCatalog = mockProducts.filter(p => p.id !== currentProduct.id);
      const categoryFallback = fallbackCatalog
        .filter(p => p.category === currentProduct.category)
        .slice(0, 4)
        .map(p => ({
          product: p,
          reason: `Featured in ${currentProduct.category}`,
          matchScore: 82
        }));
      setRecommendations(categoryFallback);
      setSummaryInsight(`Curated recommendations in ${currentProduct.category}`);
      setIsAiGenerated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [currentProduct?.id, currentProduct?.category]);

  if (!currentProduct) return null;

  return (
    <div className="mt-12 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-xs relative overflow-hidden">
      {/* Decorative ambient background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>AI Powered Suggestions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Related Products You Might Love
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Analyzing <span className="font-semibold text-gray-800">{currentProduct.name}</span> specs, category ({currentProduct.category}), and context.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-indigo-200 hover:border-indigo-300 text-indigo-700 text-xs font-bold shadow-xs hover:bg-indigo-50 transition-all disabled:opacity-50"
          title="Refresh AI Recommendations"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Suggestions</span>
        </button>
      </div>

      {/* AI Summary Insight Banner */}
      {!loading && summaryInsight && (
        <div className="relative z-10 mb-6 p-3.5 sm:p-4 bg-white/90 backdrop-blur-xs rounded-2xl border border-indigo-100 shadow-2xs flex items-start sm:items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                {isAiGenerated ? 'Gemini AI Analysis' : 'Smart Recommendation'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 font-medium line-clamp-2">
              "{summaryInsight}"
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs animate-pulse space-y-3">
              <div className="aspect-square bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded-md w-3/4" />
              <div className="h-3 bg-gray-100 rounded-md w-1/2" />
              <div className="h-8 bg-gray-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No related items found at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {recommendations.map(({ product, reason, matchScore }) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group"
            >
              {/* Image & Match Tag */}
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.images?.[0] || getProductFallbackImage(product.id || product.name)}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => handleProductImageError(e, product.id || product.name)}
                  />
                </Link>

                <div className="absolute top-2.5 left-2.5 bg-indigo-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-300" />
                  <span>{matchScore}% Match</span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <WishlistButton product={product} />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                    {product.category}
                  </span>
                  <Link to={`/product/${product.id}`} className="block group-hover:text-indigo-600 transition-colors">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                  </Link>

                  {/* AI Reason Badge */}
                  <div className="mt-2.5 p-2 bg-indigo-50/70 border border-indigo-100/80 rounded-xl">
                    <p className="text-[11px] text-indigo-900 leading-tight font-medium line-clamp-2">
                      ✨ {reason}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-extrabold text-gray-900 block">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[11px] text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(product, 1)}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1 shadow-xs active:scale-95"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
