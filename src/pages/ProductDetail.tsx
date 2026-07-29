import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, ShoppingCart, Truck, Shield, ArrowLeft, ZoomIn, Maximize2, X, ChevronLeft, ChevronRight, Sparkles, MessageSquare, Send } from 'lucide-react';
import { useAppContext } from '../store';
import { mockProducts } from '../mockData';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../components/Breadcrumb';
import { WishlistButton } from '../components/WishlistButton';
import { NotifyMeButton } from '../components/NotifyMeButton';
import { ProductReviewsSection } from '../components/ProductReviewsSection';
import { PriceDropToggle } from '../components/PriceDropToggle';
import { ShareButtons } from '../components/ShareButtons';
import { ProductQuestionsAndAnswers } from '../components/ProductQuestionsAndAnswers';
import { RelatedProducts } from '../components/RelatedProducts';
import { SpecGuideModal } from '../components/SpecGuideModal';
import { Ruler } from 'lucide-react';
import { handleProductImageError, getProductFallbackImage } from '../lib/imageUtils';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, addToCart, formatPrice } = useAppContext();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Inquiry Chat Modal State
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isSpecGuideOpen, setIsSpecGuideOpen] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);

  // Zoom & Lightbox State
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleSendInquiry = async () => {
    if (!inquiryText.trim() || !product) return;
    setSendingInquiry(true);
    try {
      const convData = {
        buyerId: user?.id || `buyer-guest-${Date.now()}`,
        buyerName: user?.name || 'Inquiring Buyer',
        sellerId: product.sellerId || 'current-seller',
        sellerName: product.sellerName || 'Marketplace Seller',
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || '',
        productPrice: product.price,
        lastMessage: inquiryText.trim(),
        lastMessageAt: new Date().toISOString(),
        unreadCountSeller: 1,
        createdAt: new Date().toISOString(),
      };

      let convId = `conv-${Date.now()}`;
      try {
        const ref = await addDoc(collection(db, 'inquiry_conversations'), convData);
        convId = ref.id;
      } catch (e) {
        console.warn('Firestore conv add error:', e);
      }

      const msgData = {
        conversationId: convId,
        senderId: user?.id || `buyer-guest-${Date.now()}`,
        senderName: user?.name || 'Inquiring Buyer',
        senderRole: 'buyer' as const,
        text: inquiryText.trim(),
        createdAt: new Date().toISOString(),
      };

      try {
        await addDoc(collection(db, 'inquiry_messages'), msgData);
      } catch (e) {
        console.warn('Firestore msg add error:', e);
      }

      // Local persistence cache update
      const savedConvs = JSON.parse(localStorage.getItem('inde_seller_conversations') || '[]');
      const newConvObj = { id: convId, ...convData };
      localStorage.setItem('inde_seller_conversations', JSON.stringify([newConvObj, ...savedConvs]));
      localStorage.setItem(`inde_msgs_${convId}`, JSON.stringify([{ id: `msg-${Date.now()}`, ...msgData }]));

      toast.success('Inquiry sent to seller! You can also check Seller Dashboard -> Messages.', {
        duration: 5000,
        icon: '💬'
      });
      setIsInquiryModalOpen(false);
      setInquiryText('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send inquiry to seller.');
    } finally {
      setSendingInquiry(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          const fallback = mockProducts.find(p => p.id === id);
          if (fallback) setProduct(fallback);
        }
      } catch (error: any) {
        console.error("Error fetching product", error);
        const fallback = mockProducts.find(p => p.id === id);
        if (fallback) setProduct(fallback);
        if (error?.code === 'unavailable') {
          console.error("Firestore is unavailable. Check network connection or firestoreDatabaseId.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Track product in Recently Viewed local storage
  useEffect(() => {
    if (product && product.id) {
      try {
        const stored = localStorage.getItem('inde_recently_viewed');
        let list: any[] = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(list)) list = [];

        list = list.filter((p: any) => p.id !== product.id);

        list.unshift({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          images: product.images,
          sellerName: product.sellerName,
          rating: product.rating,
          reviewsCount: product.reviewsCount,
          isVerifiedSeller: product.isVerifiedSeller,
          stock: product.stock,
          updatedAt: new Date().toISOString()
        });

        localStorage.setItem('inde_recently_viewed', JSON.stringify(list.slice(0, 10)));
      } catch (err) {
        console.warn('Error saving recently viewed product:', err);
      }
    }
  }, [product]);

  if (loading) {
    return (
      <div className="text-center py-24 animate-in fade-in duration-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Breadcrumb
        items={[
          { label: product.category, href: `/search?category=${encodeURIComponent(product.category)}` },
          { label: product.name }
        ]}
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Product Image Gallery */}
          <div className="p-8 lg:p-12 bg-gray-50 flex flex-col items-center justify-center gap-6 select-none">
            {/* Main Image with Lens Hover Zoom */}
            <div
              ref={imageContainerRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsFullscreenModalOpen(true)}
              className="relative w-full flex items-center justify-center bg-white rounded-2xl shadow-sm p-4 overflow-hidden border border-gray-100 cursor-crosshair group transition-all"
            >
              <div className="relative w-full aspect-square overflow-hidden rounded-xl flex items-center justify-center">
                <img
                  src={product.images?.[activeImageIndex] || product.images?.[0] || getProductFallbackImage(product.id || product.name)}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  style={{
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    transform: isZoomed ? 'scale(2.4)' : 'scale(1.0)',
                  }}
                  className="w-full h-full object-cover transition-transform duration-150 ease-out pointer-events-none"
                  onError={(e) => handleProductImageError(e, product.id || product.name)}
                />
              </div>

              {/* Hover Zoom & Expand Badges */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={`px-3 py-1.5 bg-gray-900/80 backdrop-blur-md text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-opacity duration-200 ${isZoomed ? 'opacity-100 shadow-md' : 'opacity-0 group-hover:opacity-100'}`}>
                  <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isZoomed ? '2.4x Zoom' : 'Hover to Zoom'}</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullscreenModalOpen(true);
                  }}
                  title="Expand Fullscreen"
                  className="p-2 bg-white/90 backdrop-blur-md hover:bg-white text-gray-700 hover:text-indigo-600 rounded-full shadow-md transition-all transform hover:scale-110"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {!isZoomed && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-sm border border-gray-200/80 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Move cursor over image to inspect detail
                </div>
              )}
            </div>

            {/* Thumbnails list with hover-zoom and scale transition */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 w-full snap-x">
                {product.images.map((img: string, idx: number) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      onMouseEnter={() => setActiveImageIndex(idx)}
                      className={`group relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 snap-center ${
                        isActive
                          ? 'border-indigo-600 shadow-lg ring-2 ring-indigo-200 ring-offset-2 scale-105'
                          : 'border-transparent hover:border-indigo-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-115 ease-out"
                        onError={(e) => handleProductImageError(e, `${product.id}-${idx}`)}
                      />
                      <div className={`absolute inset-0 bg-indigo-900/10 transition-opacity ${isActive ? 'opacity-0' : 'group-hover:opacity-0'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-8 lg:p-12 flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              {product.stock > 0 ? (
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  In Stock ({product.stock})
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  Out of Stock
                </span>
              )}
            </div>

            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {product.name}
              </h1>
              <WishlistButton product={product} className="bg-gray-100 hover:bg-gray-200 ml-4" />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <a
                href="#customer-reviews"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('customer-reviews')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1 group cursor-pointer"
              >
                <Star className="w-5 h-5 text-yellow-400 fill-current group-hover:scale-110 transition-transform" />
                <span className="font-bold text-gray-900">{product.rating || 0}</span>
                <span className="text-gray-500 group-hover:text-indigo-600 group-hover:underline">({product.reviewsCount || 0} reviews)</span>
              </a>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Sold by</span>
                <Link to={`/seller/${product.sellerId}`} className="font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  {product.sellerName}
                  {product.isVerifiedSeller && <ShieldCheck className="w-4 h-4 text-green-500" />}
                </Link>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-extrabold text-gray-900">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-gray-400 line-through mb-1">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>

            {/* Price Drop Alert & Size/Spec Guide */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <PriceDropToggle product={product} />
              <button
                onClick={() => setIsSpecGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-xl font-bold text-xs transition-colors"
              >
                <Ruler className="w-4 h-4 text-indigo-600" />
                <span>View Size & Specs Guide</span>
              </button>
            </div>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-auto pt-8 border-t border-gray-100">
              {product.stock > 0 ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-gray-600 hover:text-indigo-600 transition-colors focus:outline-none"
                    >
                      -
                    </button>
                    <span className="px-4 py-3 font-medium text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-3 text-gray-600 hover:text-indigo-600 transition-colors focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => addToCart(product, quantity)}
                    className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-semibold">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span>This item is currently out of stock. Subscribe below to be notified when it returns!</span>
                  </div>
                  <NotifyMeButton product={product} variant="full" />
                </div>
              )}

              {/* Ask Seller a Question Button */}
              <div className="mt-4">
                <button
                  onClick={() => setIsInquiryModalOpen(true)}
                  className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-2xs"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Message Seller About This Item</span>
                </button>
              </div>

              {/* Social Media & Link Share Component */}
              <ShareButtons
                productName={product.name}
                productPrice={formatPrice(product.price)}
                productImage={product.images?.[0]}
                className="mt-5"
              />

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Truck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium">Nationwide Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium">Secure Transactions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini API Related Products Suggestions */}
      <RelatedProducts currentProduct={product} />

      {/* Product Reviews & Ratings Section */}
      <ProductReviewsSection
        productId={product.id}
        productName={product.name}
        currentRating={product.rating}
        currentReviewsCount={product.reviewsCount}
        onRatingUpdated={(newRating, newCount) => {
          setProduct((prev: any) => ({
            ...prev,
            rating: newRating,
            reviewsCount: newCount
          }));
        }}
      />

      {/* Customer Questions & Answers Section */}
      <ProductQuestionsAndAnswers productId={product.id} productName={product.name} />

      {/* Spec Guide Modal */}
      <SpecGuideModal
        category={product.category || 'Electronics'}
        isOpen={isSpecGuideOpen}
        onClose={() => setIsSpecGuideOpen(false)}
      />

      {/* Fullscreen Lightbox Modal */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          {/* Header Controls */}
          <div className="w-full flex items-center justify-between text-white max-w-6xl">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm sm:text-base text-gray-200">{product.name}</span>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-indigo-300">
                {activeImageIndex + 1} / {product.images?.length || 1}
              </span>
            </div>
            <button
              onClick={() => setIsFullscreenModalOpen(false)}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              title="Close Fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Image Display */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden">
            {product.images && product.images.length > 1 && (
              <button
                onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                className="absolute left-2 sm:left-4 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all border border-white/10 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={product.images?.[activeImageIndex] || product.images?.[0]}
              alt={product.name}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />

            {product.images && product.images.length > 1 && (
              <button
                onClick={() => setActiveImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 sm:right-4 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all border border-white/10 shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Navigation */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto p-2 bg-white/10 backdrop-blur-md rounded-2xl max-w-full">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-indigo-500 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message Seller Inquiry Modal */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsInquiryModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Inquire About Product</h3>
                  <p className="text-xs text-gray-500">Send a direct message to seller <span className="font-semibold">{product.sellerName}</span></p>
                </div>
              </div>
              <button onClick={() => setIsInquiryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-100">
              <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">{product.name}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-0.5">{formatPrice(product.price)}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Your Message / Question</label>
              <textarea
                rows={4}
                value={inquiryText}
                onChange={e => setInquiryText(e.target.value)}
                placeholder="Ask about availability, delivery areas, bulk discounts, or warranty details..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsInquiryModalOpen(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!inquiryText.trim() || sendingInquiry}
                onClick={handleSendInquiry}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {sendingInquiry ? 'Sending...' : 'Send Inquiry'}
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Add To Cart Bar */}
      {product && (
        <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">Total</span>
            <span className="text-base font-extrabold text-gray-900 truncate">{formatPrice(product.price * quantity)}</span>
          </div>
          {product.stock > 0 ? (
            <button
              onClick={() => addToCart(product, quantity)}
              className="flex-1 max-w-[220px] bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95 shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart ({quantity})</span>
            </button>
          ) : (
            <div className="flex-1 max-w-[220px]">
              <NotifyMeButton product={product} variant="compact" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
