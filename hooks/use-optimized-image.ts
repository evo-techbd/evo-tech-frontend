/**
 * Hook for getting optimized Cloudinary image URLs
 * Automatically handles caching and responsive sizing
 */

import { useMemo } from "react";
import {
  getOptimizedImageUrl,
  getResponsiveImageUrl,
  getThumbnailImageUrl,
  getHeroImageUrl,
} from "@/lib/image-loader";

interface ImageOptimizationOptions {
  width?: number;
  quality?: number;
  maxWidth?: number;
}

/**
 * Hook to get optimized image URL with memoization
 * Prevents unnecessary recalculations on re-renders
 *
 * @param src - Original image URL
 * @param width - Desired width in pixels
 * @param quality - Image quality (1-100)
 * @returns Optimized URL
 *
 * @example
 * const { url } = useOptimizedImage(product.image, 800);
 * <Image src={url} alt="..." fill />
 */
export function useOptimizedImage(
  src: string | undefined | null,
  width: number = 800,
  quality: number = 80,
) {
  const url = useMemo(() => {
    return getOptimizedImageUrl(src, width, quality);
  }, [src, width, quality]);

  return { url };
}

/**
 * Hook for responsive images with automatic sizing
 *
 * @param src - Original image URL
 * @param options - Configuration for responsive sizing
 * @returns Optimized URL for responsive display
 *
 * @example
 * const { url } = useResponsiveImage(product.image, { width: 800 });
 * <Image src={url} sizes="(max-width: 768px) 100vw, 50vw" alt="..." />
 */
export function useResponsiveImage(
  src: string | undefined | null,
  options: ImageOptimizationOptions = {},
) {
  const url = useMemo(() => {
    return getResponsiveImageUrl(src, options);
  }, [src, options]);

  return { url };
}

/**
 * Hook for thumbnail/card images (highly compressed for speed)
 *
 * @param src - Original image URL
 * @param options - Configuration
 * @returns Highly compressed URL for thumbnails
 *
 * @example
 * const { url } = useThumbnailImage(product.image);
 * <img src={url} alt="..." />
 */
export function useThumbnailImage(
  src: string | undefined | null,
  options: ImageOptimizationOptions = {},
) {
  const url = useMemo(() => {
    return getThumbnailImageUrl(
      src,
      options.width ?? 300,
      options.quality ?? 75,
    );
  }, [src, options]);

  return { url };
}

/**
 * Hook for hero/banner images (higher quality for visual impact)
 *
 * @param src - Original image URL
 * @param options - Configuration
 * @returns High-quality URL for hero images
 *
 * @example
 * const { url } = useHeroImage(banner.image);
 * <Image src={url} alt="..." fill priority />
 */
export function useHeroImage(
  src: string | undefined | null,
  options: ImageOptimizationOptions = {},
) {
  const url = useMemo(() => {
    return getHeroImageUrl(src, options.width ?? 1200, options.quality ?? 85);
  }, [src, options]);

  return { url };
}

/**
 * For server components - import functions directly instead
 * Example: import { getOptimizedImageUrl } from '@/lib/image-loader'
 */
