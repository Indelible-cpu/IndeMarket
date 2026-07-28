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

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkWishlist = async () => {
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
        } else {
          setIsFavorited(false);
          setWishlistDocId(null);
        }
      } catch (error) {
        console.error("Error checking wishlist", error);
      } finally {
        setLoading(false);
      }
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

    try {
      if (isFavorited && wishlistDocId) {
        // Remove from wishlist
        await deleteDoc(doc(db, 'wishlist', wishlistDocId));
        setIsFavorited(false);
        setWishlistDocId(null);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const docRef = await addDoc(collection(db, 'wishlist'), {
          userId: user.id,
          productId: product.id,
          product: product, // Storing product info for easy rendering on Wishlist page
          createdAt: serverTimestamp()
        });
        setIsFavorited(true);
        setWishlistDocId(docRef.id);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error("Error toggling wishlist", error);
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
