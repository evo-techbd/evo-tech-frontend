/**
 * Cloudinary Image URL Optimizer Utility with Safe URL Detection
 *
 * Only applies Cloudinary transformations to Cloudinary-hosted images.
 * Non-Cloudinary images pass through unchanged.
 *
 * Features:
 * - Safe URL detection (won't transform non-Cloudinary URLs)
 * - URL caching to avoid repeated calculations
 * - Auto format, quality, and device pixel ratio
 * - Progressive JPEG encoding
 *
 * Usage:
 *   import { getOptimizedImageUrl } from "@/lib/image-loader";
 *   <Image src={getOptimizedImageUrl(imageUrl)} width={300} height={300} alt="..." />
 */

// URL cache to avoid recalculating transformations
const urlCache = new Map<string, string>();
const MAX_CACHE_SIZE = 500;
const DEFAULT_PLACEHOLDER = "/assets/placeholder-product.svg";

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Check if URL is Cloudinary-hosted (safe check)
 * @param url - Image URL to check
 * @returns true if URL is from Cloudinary CDN
 */
function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  return url.includes("res.cloudinary.com");
}

function sanitizeSrc(src: string | undefined | null): string {
  if (!src || typeof src !== "string") return DEFAULT_PLACEHOLDER;

  const trimmed = src.trim();
  if (!trimmed) return DEFAULT_PLACEHOLDER;

  // Prevent invalid literal values that appear in some payloads
  if (trimmed === "null" || trimmed === "undefined") return DEFAULT_PLACEHOLDER;

  return trimmed;
}

/**
 * Get Cloudinary transformation params optimized for web
 * - f_auto: Select best format (WebP, AVIF, JPEG, etc.)
 * - q_<number>: Explicit quality value (1-100)
 * - dpr_auto: Adjust for device pixel ratio
 * - c_limit: Limit dimensions while preserving aspect ratio
 */
function getTransformationString(width: number, quality: number = 80): string {
  return `f_auto,q_${quality},w_${width},dpr_auto,c_limit`;
}

/**
 * Returns optimized Cloudinary URL for faster loading
 * SAFE: Only applies transformations to Cloudinary-hosted images
 *
 * @param src - Image URL (any source)
 * @param width - Desired width in pixels
 * @param quality - Optional quality (1-100). Defaults to 80 for balanced web performance
 * @returns Optimized URL if Cloudinary, original URL otherwise
 *
 * @example
 * // Cloudinary image - gets optimized
 * getOptimizedImageUrl("https://res.cloudinary.com/...", 300)
 * // Returns: "https://res.cloudinary.com/.../upload/f_auto,q_80,w_300/..."
 *
 * // Non-Cloudinary image - passes through unchanged
 * getOptimizedImageUrl("https://api.example.com/image.jpg", 300)
 * // Returns: "https://api.example.com/image.jpg"
 */
export function getOptimizedImageUrl(
  src: string | undefined | null,
  width: number = 800,
  quality: number = 80,
): string {
  const safeSrc = sanitizeSrc(src);
  const safeWidth = clamp(Number(width) || 800, 1, 4000);
  const safeQuality = clamp(Number(quality) || 80, 1, 100);

  // SAFE: Only apply transformations to Cloudinary URLs
  if (!isCloudinaryUrl(safeSrc)) return safeSrc;

  // Check cache first
  const cacheKey = `${safeSrc}|${safeWidth}|${safeQuality}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey)!;
  }

  // Cloudinary URL format:
  // https://res.cloudinary.com/<cloud_name>/image/upload/<public_id>
  // Use /image/upload/ to avoid accidental replacements.
  const marker = "/image/upload/";
  const parts = safeSrc.split(marker);
  if (parts.length !== 2) return safeSrc;

  // Avoid double-transforming when a transformation segment already exists.
  // Example existing transformed URL:
  // .../image/upload/f_auto,q_auto,w_800/v123/public-id
  const firstSegmentAfterUpload = parts[1].split("/")[0] || "";
  const transformationPrefixes = [
    "a_",
    "b_",
    "bo_",
    "c_",
    "co_",
    "dpr_",
    "e_",
    "f_",
    "g_",
    "h_",
    "q_",
    "r_",
    "w_",
    "x_",
    "y_",
    "z_",
  ];
  const hasExistingTransformations =
    (firstSegmentAfterUpload.includes(",") ||
      transformationPrefixes.some((prefix) =>
        firstSegmentAfterUpload.startsWith(prefix),
      )) &&
    !firstSegmentAfterUpload.startsWith("v");
  if (hasExistingTransformations) return safeSrc;

  const transformations = getTransformationString(safeWidth, safeQuality);
  const optimized = `${parts[0]}${marker}${transformations}/${parts[1]}`;

  // Store in cache with size limit
  if (urlCache.size >= MAX_CACHE_SIZE) {
    const firstKey = urlCache.keys().next().value;
    if (firstKey) urlCache.delete(firstKey);
  }
  urlCache.set(cacheKey, optimized);

  return optimized;
}

/**
 * Get responsive image URL with automatic sizing for Cloudinary images
 * Usage with Next.js Image sizes prop recommended
 *
 * @param src - Image URL
 * @param options - Configuration
 * @returns Optimized URL for responsive images
 */
export function getResponsiveImageUrl(
  src: string | undefined | null,
  options: {
    width?: number;
    quality?: number;
    maxWidth?: number;
  } = {},
): string {
  const { width = 800, quality = 80, maxWidth = 1920 } = options;

  const finalWidth = Math.min(width, maxWidth);
  return getOptimizedImageUrl(src, finalWidth, quality);
}

/**
 * Get image URL optimized for thumbnail/card display (faster loading)
 * Applies aggressive compression for quick preview
 */
export function getThumbnailImageUrl(
  src: string | undefined | null,
  width: number = 300,
  quality: number = 75,
): string {
  return getOptimizedImageUrl(src, width, quality);
}

/**
 * Get high-quality image URL for hero/banner sections
 * Uses premium quality for visual impact with responsive sizing
 */
export function getHeroImageUrl(
  src: string | undefined | null,
  width: number = 1200,
  quality: number = 85,
): string {
  return getOptimizedImageUrl(src, width, quality);
}

/**
 * Clear the URL cache (useful for testing or memory management)
 */
export function clearImageCache(): void {
  urlCache.clear();
}

export default getOptimizedImageUrl;
