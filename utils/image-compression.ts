/**
 * Image Compression Utility
 * Compresses images and converts them to WebP format before upload
 */

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  initialQuality?: number;
}

/**
 * Compress an image file and convert to WebP
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed WebP file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {},
): Promise<File> {
  const {
    maxSizeMB = 1, // Target 1MB after compression
    maxWidthOrHeight = 1920, // Max dimension
    initialQuality = 0.8,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.src = e.target?.result as string;

        img.onload = async () => {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;

          if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
            if (width > height) {
              height = (height / width) * maxWidthOrHeight;
              width = maxWidthOrHeight;
            } else {
              width = (width / height) * maxWidthOrHeight;
              height = maxWidthOrHeight;
            }
          }

          // Create canvas for compression
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP with quality adjustment
          let quality = initialQuality;
          let blob: Blob | null = null;

          // Iteratively reduce quality until size is acceptable
          do {
            blob = await new Promise<Blob | null>((resolveBlob) => {
              canvas.toBlob((b) => resolveBlob(b), "image/webp", quality);
            });

            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }

            const sizeMB = blob.size / (1024 * 1024);
            console.log(
              `Compression attempt: ${sizeMB.toFixed(2)}MB at quality ${quality}`,
            );

            if (sizeMB <= maxSizeMB || quality <= 0.3) {
              break;
            }

            quality -= 0.1;
          } while (quality > 0.3);

          if (!blob) {
            reject(new Error("Failed to compress image"));
            return;
          }

          // Create new File from blob
          const originalName = file.name.replace(/\.[^/.]+$/, "");
          const compressedFile = new File([blob], `${originalName}.webp`, {
            type: "image/webp",
          });

          //   console.log(`Original: ${(file.size / (1024 * 1024)).toFixed(2)}MB -> Compressed: ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`);

          resolve(compressedFile);
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images
 * @param files - Array of image files
 * @param options - Compression options
 * @param onProgress - Progress callback
 * @returns Array of compressed files
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void,
): Promise<File[]> {
  const compressedFiles: File[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const compressed = await compressImage(files[i], options);
      compressedFiles.push(compressed);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`Failed to compress ${files[i].name}:`, error);
      // If compression fails, use original file
      compressedFiles.push(files[i]);
    }
  }

  return compressedFiles;
}

/**
 * Validate file size before compression
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in MB
 * @returns Validation result
 */
export function validateFileSize(
  file: File,
  maxSizeMB: number = 10,
): {
  valid: boolean;
  message?: string;
  sizeMB: number;
} {
  const sizeMB = file.size / (1024 * 1024);

  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      message: `File size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
      sizeMB,
    };
  }

  return {
    valid: true,
    sizeMB,
  };
}
