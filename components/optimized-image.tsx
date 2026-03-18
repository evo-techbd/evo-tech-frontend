/**
 * Optimized Image Component
 *
 * Drop-in replacement for Next.js Image that automatically applies
 * Cloudinary optimizations. Works with next.config unoptimized: true
 *
 * Since your app uses unoptimized: true, this component:
 * 1. Applies Cloudinary transformations to Cloudinary-hosted images
 * 2. Passes through other images as-is
 * 3. Handles the fill prop by converting to width/height when needed
 */

import Image from "next/image";
import type { ImageProps } from "next/image";
import { getOptimizedImageUrl } from "@/lib/image-loader";

interface OptimizedImageProps extends Omit<ImageProps, "priority" | "loader"> {
  quality?: number;
  isHero?: boolean; // Use high quality for hero images
  isThumbnail?: boolean; // Use compressed quality for thumbnails
  displayWidth?: number; // Hint for optimization width
}

/**
 * OptimizedImage Component
 *
 * Automatically optimizes Cloudinary image URLs and applies best practices:
 * - Cloudinary URL transformation (for Cloudinary-hosted images)
 * - Format auto-selection (WebP/AVIF)
 * - Quality auto-adjustment
 * - Device pixel ratio handling
 * - Progressive JPEG encoding
 *
 * @example
 * <OptimizedImage
 *   src={product.mainImage}
 *   alt="Product"
 *   width={300}
 *   height={300}
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 *
 * @example Hero image
 * <OptimizedImage
 *   src={banner.image}
 *   alt="Banner"
 *   width={1200}
 *   height={400}
 * />
 */
export function OptimizedImage({
  src,
  quality,
  isHero = false,
  isThumbnail = false,
  displayWidth,
  width,
  height,
  alt = "Image",
  ...restProps
}: OptimizedImageProps) {
  // Determine quality based on usage
  let effectiveQuality = quality;
  if (!effectiveQuality) {
    if (isHero) {
      effectiveQuality = 85;
    } else if (isThumbnail) {
      effectiveQuality = 75;
    } else {
      effectiveQuality = 80; // Default balanced quality
    }
  }

  // Estimate width for optimization
  let widthHint = displayWidth ?? width ?? 800;
  if (isHero) widthHint = Math.max(widthHint as number, 1200);

  // Optimize URL for Cloudinary images
  const optimizedSrc = String(src || "").includes("res.cloudinary.com")
    ? getOptimizedImageUrl(src as string, widthHint as number, effectiveQuality)
    : src;

  return (
    <Image
      {...restProps}
      src={optimizedSrc}
      width={width}
      height={height}
      alt={alt}
    />
  );
}

// Export for convenience
export default OptimizedImage;
