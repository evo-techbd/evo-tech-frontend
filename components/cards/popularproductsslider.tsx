"use client";

import { useEffect, useState, useRef } from "react";
import axios from "@/utils/axios/axios";
import axiosErrorLogger from "@/components/error/axios_error";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { ExternalLink } from "lucide-react";

const PopularProductsSlider = ({
  title = "Popular In Category",
}: {
  title?: string;
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        // simpler, consistent pattern used across the app: resolve res.data first
        const resp = await axios
          .get("/products?published=true&limit=10")
          .then((r) => r.data)
          .catch((err) => {
            axiosErrorLogger({ error: err });
            return null;
          });

        // backend sometimes returns payload under `data` or `result`
        const raw = resp?.data || resp?.result || [];

        const transformed = raw.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          prevPrice: p.previousPrice || p.previous_price || 0,
          preOrderPrice: p.preOrderPrice || p.pre_order_price || null,
          image:
            p.mainImage || p.main_image || "/assets/placeholder-product.svg",
          rating: p.rating || 0,
        }));

        if (mounted) setProducts(transformed);
      } catch (error) {
        axiosErrorLogger({ error });
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    // Skeleton loader: show a row of placeholder product cards
    return (
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-stone-800">{title}</h3>
          <div className="flex items-center gap-3">
            <Link
              href="/products-and-accessories"
              className="text-sm text-stone-500 hover:text-brand-600 transition-colors"
            >
              More
            </Link>
            <div className="hidden md:flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200" />
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="animate-pulse bg-white rounded-lg p-3 shadow-sm"
            >
              <div className="w-full h-36 bg-stone-200 rounded-md mb-3" />
              <div className="h-3 bg-stone-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-2xl font-semibold text-stone-800">
          {title}
        </h3>
          <div className="flex items-center gap-3 border-[1px] border-stone-400 rounded-xl">
            <Link
              href="/products-and-accessories"
              className="text-sm text-stone-500 p-2 px-4 hover:bg-brand-600 rounded-xl font-semibold hover:text-white transition-colors"
            >
              More 
              <ExternalLink size={14} className="inline-block ml-1 mb-0.5" />
            </Link>
            
          </div>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3, spaceBetween: 18 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
          1280: { slidesPerView: 4, spaceBetween: 20 },
        }}
        onSwiper={(s) => (swiperRef.current = s)}
        autoplay={{ delay: 4000, disableOnInteraction: true }}
        navigation={true}
        loop={products.length > 6}
        className="products-swiper"
      >
        {products.map((p) => (
          <SwiperSlide key={p.id}>
            <Link
              href={`/items/${p.slug}`}
              className="group block w-full rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100 hover:border-brand-200"
            >
              {/* Image Container - Match ProductGridCard aspect ratio */}
              <div className="relative w-full aspect-square overflow-hidden bg-stone-50">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

                <div className="p-4 bg-stone-50 border-t border-stone-100">
                  <h4 className="text-sm font-semibold text-stone-800 line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors leading-snug min-h-[2.5rem]">
                    {p.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    {p.preOrderPrice && p.preOrderPrice < p.price ? (
                      <>
                        <div className="text-sm font-semibold text-cyan-600">
                          BDT {p.preOrderPrice?.toLocaleString()}
                        </div>
                        <div className="text-sm text-red-500 line-through">
                          BDT {p.price?.toLocaleString()}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm font-semibold text-stone-900">
                        BDT {p.price?.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default PopularProductsSlider;
