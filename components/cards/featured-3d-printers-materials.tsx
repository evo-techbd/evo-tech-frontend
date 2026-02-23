"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "@/utils/axios/axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  previousPrice?: number;
  preOrderPrice?: number;
  isPreOrder?: boolean;
  mainImage: string;
  inStock: boolean;
  shortDescription?: string;
}

interface CategorySection {
  categoryName: string;
  categorySlug: string;
  products: Product[];
}

export default function Featured3DPrintersMaterials() {
  const [sections, setSections] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch 3D Printers
        const printersRes = await axios.get("/api/products", {
          params: {
            category: "3d-printer",
            limit: 2,
            published: true,
          },
        });

        // Fetch Materials
        const materialsRes = await axios.get("/api/products", {
          params: {
            category: "materials",
            limit: 2,
            published: true,
          },
        });

        const sectionsData: CategorySection[] = [];

        if (printersRes.data?.data?.length > 0) {
          sectionsData.push({
            categoryName: "3D Printers",
            categorySlug: "3d-printer",
            products: printersRes.data.data,
          });
        }

        if (materialsRes.data?.data?.length > 0) {
          sectionsData.push({
            categoryName: "Materials",
            categorySlug: "materials",
            products: materialsRes.data.data,
          });
        }

        setSections(sectionsData);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-10">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-72 sm:h-80" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-6 ">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.categorySlug}
            className={sectionIndex > 0 ? "mt-8" : ""}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
              <h3 className="text-2xl font-bold text-stone-800 ">
                {section.categoryName}
              </h3>
              <div className="flex items-center gap-3 border-[1px] border-stone-400 rounded-xl">
                <Link
                  href={`/products-and-accessories?category=${section.categorySlug}`}
                  className="text-sm text-stone-500 p-2 px-4 hover:bg-brand-600 rounded-xl font-semibold hover:text-white transition-colors"
                >
                  More
                  <ExternalLink
                    size={14}
                    className="inline-block ml-1 mb-0.5"
                  />
                </Link>
              </div>
            </div>

            {/* Products Grid */}
            <Swiper
              modules={[Autoplay]}
              spaceBetween={20}
              slidesPerView={1.5}
              breakpoints={{
                480: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 2.5, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
                1280: { slidesPerView: 4, spaceBetween: 24 },
              }}
              autoplay={{
                delay: 3500,
                disableOnInteraction: true,
                pauseOnMouseEnter: true,
              }}
              loop={section.products.length > 4}
              className="products-swiper"
            >
              {section.products.map((product) => (
                <SwiperSlide key={product._id}>
                  <Link
                    href={`/items/${product.slug}`}
                    className="group block w-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100 hover:border-brand-200"
                  >
                    {/* Product Image Container - Match ProductGridCard aspect ratio */}
                    <div className="relative w-full aspect-square bg-stone-50 overflow-hidden">
                      <Image
                        src={product.mainImage || "/placeholder.png"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        sizes="(max-width: 640px) 80vw, (max-width: 768px) 45vw, (max-width: 1024px) 35vw, 28vw"
                        priority={sectionIndex === 0}
                      />

                      {/* Out of Stock Overlay */}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                          <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 bg-stone-50 border-t border-stone-100">
                      <h3 className="text-sm font-semibold text-stone-800 line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors leading-snug min-h-[2.5rem]">
                        {product.name}
                      </h3>

                      <div className="flex flex-col gap-1">
                        {(product as any).preOrderPrice && (product as any).isPreOrder && (product as any).preOrderPrice < product.price ? (
                          <>
                            <span className="text-sm font-semibold text-cyan-600">
                              BDT {(product as any).preOrderPrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-red-500 line-through">
                              BDT {product.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-semibold text-stone-800">
                              BDT {product.price.toLocaleString()}
                            </span>
                            {product.previousPrice &&
                              product.previousPrice > product.price && (
                                <span className="text-xs text-stone-400 line-through">
                                  BDT {product.previousPrice.toLocaleString()}
                                </span>
                              )}
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ))}
      </div>
    </section>
  );
}
