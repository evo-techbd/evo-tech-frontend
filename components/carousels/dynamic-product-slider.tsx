"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { ExternalLink } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  prevPrice?: number;
  preOrderPrice?: number;
  image: string;
  rating?: number;
  inStock?: boolean;
}

interface DynamicProductSliderProps {
  title: string;
  products: Product[];
  viewMoreUrl?: string;
}

const DynamicProductSlider = ({
  title,
  products,
  viewMoreUrl = "/products-and-accessories",
}: DynamicProductSliderProps) => {
  const swiperRef = useRef<SwiperType | null>(null);

  if (!products || products.length === 0) return null;

  return (
    <section className="w-full py-6">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <h3 className="text-2xl font-bold text-stone-800">
            {title}
          </h3>
          <div className="flex items-center gap-3 border-[1px] border-stone-400 rounded-xl">
            <Link
              href={viewMoreUrl}
              className="text-sm text-stone-500 p-2 px-4 hover:bg-brand-600 rounded-xl font-semibold hover:text-white transition-colors"
            >
              More
              <ExternalLink size={14} className="inline-block ml-1 mb-0.5" />
            </Link>
          </div>
        </div>

        {/* Products Slider */}
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1.5}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 2.5, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 24 },
          }}
          onSwiper={(s) => (swiperRef.current = s)}
          autoplay={{
            delay: 3500,
            disableOnInteraction: true,
            pauseOnMouseEnter: true,
          }}
          navigation={true}
          loop={products.length > 4}
          className="products-swiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <Link
                href={`/items/${product.slug}`}
                className="group block w-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100 hover:border-brand-200"
              >
                {/* Product Image Container - Match ProductGridCard */}
                <div className="relative w-full aspect-square bg-stone-50 overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    sizes="(max-width: 640px) 80vw, (max-width: 768px) 45vw, (max-width: 1024px) 35vw, 28vw"
                  />

                  {/* Out of Stock Overlay */}
                  {product.inStock === false && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info - Clean white background */}
                <div className="p-3 bg-stone-50 border-t border-stone-100">
                  <h3 className="text-sm sm:text-base font-semibold text-stone-800 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  <div className="flex items-baseline gap-2 flex-wrap">
                    {product.preOrderPrice && product.preOrderPrice < product.price ? (
                      <>
                        <span className="text-[13px] font-semibold text-cyan-600">
                          BDT {product.preOrderPrice.toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm text-red-500 line-through">
                          BDT {product.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[13px] font-medium text-stone-800">
                          BDT {product.price.toLocaleString()}
                        </span>
                        {product.prevPrice && product.prevPrice > product.price ? (
                          <span className="text-xs sm:text-sm text-stone-400 line-through">
                            BDT{product.prevPrice.toLocaleString()}
                          </span>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default DynamicProductSlider;
