import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAppContext } from '../store';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface WishlistButtonProps {
  product: any;
  className?: string;
}

export function WishlistButton({ product, className = '' }: WishlistButtonProps) {
  const { user } = useAppContext();
  const [isFavorited, setIsFavorited] = useState(false);
  const [wishlistDocId, setWishlistDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper for localStorage fallback wishlist
  const getLocalWishlist = (): any[] => {
    if (!user) return [];
    try {
      const saved = localStorage.getItem(`inde_wishlist_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const setLocalWishlist = (items: any[]) => {
    if (!user) return;
    try {
      localStorage.setItem(`inde_wishlist_${user.id}`, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save wishlist to localStorage", e);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkWishlist = async () => {
      let foundInRemote = false;
      try {
        const q = query(
          collection(db, 'wishlist'),
          where('userId', '==', user.id),
          where('productId', '==', product.id)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setIsFavorited(true);
          setWishlistDocId(snapshot.docs[0].id);
          foundInRemote = true;
        }
      } catch (error) {
        // Quietly fallback to localStorage if permissions or network fail
      }

      if (!foundInRemote) {
        const localItems = getLocalWishlist();
        const existing = localItems.find((item: any) => item.productId === product.id);
        if (existing) {
          setIsFavorited(true);
          setWishlistDocId(existing.id || `local-${product.id}`);
        } else {
          setIsFavorited(false);
          setWishlistDocId(null);
        }
      }

      setLoading(false);
    };

    checkWishlist();
  }, [user, product.id]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to add to wishlist');
      return;
    }

    setLoading(true);

    const localItems = getLocalWishlist();

    try {
      if (isFavorited && wishlistDocId) {
        // Remove from Firestore if doc ID is not purely local
        if (!wishlistDocId.startsWith('local-')) {
          try {
            await deleteDoc(doc(db, 'wishlist', wishlistDocId));
          } catch (e) {
            // Ignore firestore delete error and sync local
          }
        }
        
        // Remove from local storage
        const updatedLocal = localItems.filter((i: any) => i.productId !== product.id && i.id !== wishlistDocId);
        setLocalWishlist(updatedLocal);

        setIsFavorited(false);
        setWishlistDocId(null);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        let newDocId = `local-${product.id}-${Date.now()}`;
        try {
          const docRef = await addDoc(collection(db, 'wishlist'), {
            userId: user.id,
            productId: product.id,
            product: product,
            createdAt: serverTimestamp()
          });
          newDocId = docRef.id;
        } catch (e) {
          // Fallback to local ID
        }

        const newItem = {
          id: newDocId,
          userId: user.id,
          productId: product.id,
          product: product,
          createdAt: new Date().toISOString()
        };

        const updatedLocal = [newItem, ...localItems.filter((i: any) => i.productId !== product.id)];
        setLocalWishlist(updatedLocal);

        setIsFavorited(true);
        setWishlistDocId(newDocId);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`p-2 rounded-full focus:outline-none transition-colors ${
        isFavorited 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
      } ${className}`}
      aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
    </button>
  );
}

