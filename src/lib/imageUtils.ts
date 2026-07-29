import React from 'react';

/**
 * Returns a deterministic, unique fallback image URL for a given product ID or Name.
 * Uses picsum.photos with a unique seed so no two products share the same fallback.
 */
export function getProductFallbackImage(productIdOrName: string, width = 800, height = 800): string {
  const seed = encodeURIComponent(productIdOrName || 'product-item');
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * Handles img onError event by switching to a unique seed-based placeholder
 * specifically tuned to the product's ID or name, preventing duplicate fallbacks.
 */
export function handleProductImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  productIdOrName: string,
  width = 800,
  height = 800
) {
  const target = e.currentTarget;
  const fallbackUrl = getProductFallbackImage(productIdOrName, width, height);
  if (target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  }
}

/**
 * Safe accessor for a product's primary image with fallback.
 */
export function getProductPrimaryImage(product: any, index = 0): string {
  if (product?.images && Array.isArray(product.images) && product.images[index]) {
    return product.images[index];
  }
  return getProductFallbackImage(product?.id || product?.name || 'product');
}
