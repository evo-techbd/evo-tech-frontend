/**
 * Cloudinary Image URL Optimizer Utility
 *
 * Use this function to get an optimized Cloudinary URL instead of the raw upload URL.
 * Apply it wherever you pass a remote Cloudinary image src to <Image /> or <img />.
 *
 * Usage:
 *   import { getOptimizedImageUrl } from "@/lib/image-loader";
 *   <Image src={getOptimizedImageUrl(product.mainImage, 800)} ... />
 *
 * This approach avoids Next.js global loader issues and gives Cloudinary's CDN
 * auto-format (WebP/AVIF), auto-quality, and width-based resizing.
 */

/**
 * Returns a Cloudinary-optimized image URL with auto format, auto quality,
 * and the specified width. Falls back to the original URL if not a Cloudinary image.
 *
 * @param src - The original image URL (can be Cloudinary or any other URL)
 * @param width - The desired display width in pixels (used for Cloudinary w_ param)
 * @param quality - Optional quality number (1-100). Defaults to Cloudinary auto.
 */
export function getOptimizedImageUrl(
  src: string | undefined | null,
  width: number = 800,
  quality?: number
): string {
  if (!src || typeof src !== "string") return src || "";

  // Only apply transformations to Cloudinary URLs
  if (!src.includes("res.cloudinary.com")) return src;

  // Avoid double-transforming if already has f_auto/q_auto
  if (src.includes("f_auto") || src.includes("q_auto")) return src;

  // Cloudinary URL format:
  // https://res.cloudinary.com/<cloud_name>/image/upload/<optional_version>/<public_id>
  // We insert transformations right after /upload/
  const parts = src.split("/upload/");
  if (parts.length !== 2) return src;

  const q = quality ? quality : "auto";
  const transformations = `f_auto,q_${q},w_${width}`;

  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}

export default getOptimizedImageUrl;
