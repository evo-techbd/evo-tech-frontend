"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/evo_dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { currencyFormatBDT } from "@/lib/all_utils";
import { Loader2, Package, Tag, Palette, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductImage {
  _id: string;
  imageUrl: string;
  altText?: string;
}

interface ProductDetailsType {
  _id: string;
  name: string;
  slug: string;
  price: number;
  previousPrice?: number;
  preOrderPrice?: number;
  inStock: boolean;
  mainImage: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  stock?: number;
  lowStockThreshold?: number;
  weight?: number;
  features?: string[];
  colors?: string[];
  isFeatured?: boolean;
  published?: boolean;
  isPreOrder?: boolean;
  preOrderDate?: string;
  rating?: number;
  reviewCount?: number;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    _id: string;
    name: string;
    slug: string;
  };
  brand?: {
    _id: string;
    name: string;
    slug: string;
  };
  additionalImages?: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProductDetailsModalProps {
  productSlug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailsModal({ productSlug, open, onOpenChange }: ProductDetailsModalProps) {
  const [product, setProduct] = React.useState<ProductDetailsType | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<string>("");

  React.useEffect(() => {
    if (open && productSlug) {
      fetchProductDetails(productSlug);
    } else {
      setProduct(null);
      setSelectedImage("");
      setError(null);
    }
  }, [open, productSlug]);

  const fetchProductDetails = async (slug: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch product details using relative path for Next.js API routes
      const productResponse = await fetch(`/api/products/slug/${slug}`);
      
      if (!productResponse.ok) {
        throw new Error('Failed to fetch product details');
      }

      const productData = await productResponse.json();

      if (!productData.success || !productData.data) {
        throw new Error('Product not found');
      }

      const productInfo = productData.data;

      // Fetch additional images from backend API
      const baseURL = process.env.NEXT_PUBLIC_API_URL;
      const imagesResponse = await fetch(
        `${baseURL}/products/${productInfo._id}/images`
      );

      let additionalImages: ProductImage[] = [];
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        additionalImages = imagesData.data || [];
      }

      setProduct({ ...productInfo, additionalImages });
      setSelectedImage(productInfo.mainImage);
    } catch (err: any) {
      setError(err.message || 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const allImages = product
    ? [
        product.mainImage,
        ...(product.additionalImages?.map((img) => img.imageUrl) || []),
      ].filter(Boolean)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 border-b bg-white">
          <DialogTitle className="text-xl font-semibold">Product Details</DialogTitle>
          <DialogDescription className="sr-only">
            View detailed information about the product including images, description, and specifications
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : product ? (
          <ScrollArea className="max-h-[calc(90vh-80px)] bg-white">
            <div className="p-6 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Images */}
                <div className="space-y-4">
                  {/* Main Image Display */}
                  <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                    {selectedImage ? (
                      <Image
                        src={selectedImage}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {allImages.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                      {allImages.map((img, idx) => (
                        <button
                          key={`thumb-${idx}`}
                          onClick={() => setSelectedImage(img)}
                          className={`relative aspect-square bg-gray-100 rounded-md overflow-hidden border-2 transition-all ${
                            selectedImage === img
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <Image
                            src={img}
                            alt={`${product.name} - ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="100px"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Product Info */}
                <div className="space-y-4">
                  {/* Product Name & SKU */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                    {product.sku && (
                      <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={product.published ? "success" : "failed"}>
                      {product.published ? "Published" : "Unpublished"}
                    </Badge>
                    <Badge variant={product.inStock ? "success" : "failed"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                    {product.isFeatured && (
                      <Badge variant="warning">Featured</Badge>
                    )}
                    {product.isPreOrder && (
                      <Badge variant="inprogress">Pre-Order</Badge>
                    )}
                  </div>

                  {/* Pricing */}
                  <Card className="bg-gray-50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold text-gray-900">
                            BDT {currencyFormatBDT(product.price)}
                          </span>
                          {product.previousPrice && product.previousPrice > product.price && (
                            <span className="text-lg line-through text-gray-400">
                              BDT {currencyFormatBDT(product.previousPrice)}
                            </span>
                          )}
                        </div>
                        {product.preOrderPrice && product.isPreOrder && (
                          <div className="text-sm text-blue-600 font-medium">
                            Pre-order Price: BDT {currencyFormatBDT(product.preOrderPrice)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stock & Weight */}
                  <div className="grid grid-cols-2 gap-4">
                    {product.stock !== undefined && (
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-500">Stock</p>
                              <p className="font-semibold text-gray-900">{product.stock}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {product.weight && (
                      <Card>
                        <CardContent className="pt-4">
                          <div>
                            <p className="text-xs text-gray-500">Weight</p>
                            <p className="font-semibold text-gray-900">{product.weight}g</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Category, Brand, Subcategory */}
                  <div className="space-y-2">
                    {product.category && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Category:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {product.category.name}
                        </span>
                      </div>
                    )}
                    {product.subcategory && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Subcategory:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {product.subcategory.name}
                        </span>
                      </div>
                    )}
                    {product.brand && (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-500">Brand:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {product.brand.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Palette className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Available Colors:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((color, idx) => (
                          <Badge key={`color-${idx}`} variant="outline">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Full Width Sections */}
              <div className="space-y-4 pt-4 border-t">
                {/* Short Description */}
                {product.shortDescription && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Short Description</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {product.shortDescription}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                      <ul className="list-disc list-inside space-y-1.5">
                        {product.features.map((feature, idx) => (
                          <li key={`feature-${idx}`} className="text-sm text-gray-600">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Full Description */}
                {product.description && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Full Description</h3>
                      <div
                        className="text-sm text-gray-600 whitespace-pre-line prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
