"use client";

import { useEffect, useState, useRef } from "react";
import axios from "@/utils/axios/axios";
import CategoryCard from "@/components/cards/categorycard";
import axiosErrorLogger from "@/components/error/axios_error";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
// Navigation arrows are intentionally removed for autoplay; keep UI minimal
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
// navigation styles removed — autoplay-only
import "swiper/css/pagination";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
}

const FeaturedCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed manual navigation; autoplay will handle sliding

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/categories");
        const data = response?.data?.data || [];
        
        // Log each category to check for invalid slugs
        data.forEach((cat: Category, index: number) => {
          // Warn about problematic categories
          if (!cat.slug || cat.slug.trim() === '') {
            console.warn(`  ⚠️ WARNING: Category "${cat.name}" has no slug!`);
          }
        });
        
        // Sort by sortOrder
        const sortedCategories = data.sort(
          (a: Category, b: Category) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );
        setCategories(sortedCategories);
      } catch (error) {
        axiosErrorLogger({ error });
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    // Skeleton row for categories
    return (
      <section className="w-full py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-stone-800 mb-2">&nbsp;</h2>
              <p className="text-stone-600 max-w-2xl">&nbsp;</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`cat-skel-${i}`}
                className="animate-pulse bg-white rounded-[10px] overflow-hidden p-4"
              >
                <div className="w-full h-36 bg-stone-200 rounded-md mb-4" />
                <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12">
        {/* Section Header with Navigation */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              Popular Categories
            </h2>
            <p className="text-stone-600 max-w-2xl">
              Explore our wide range of products across different categories
            </p>
          </div>

          {/* Navigation is hidden to rely on autoplay - keeps UI clean */}
        </div>

        {/* Categories Slider */}
        <div className="relative">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={2}
            slidesPerGroup={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={800}
            loop={categories.length > 6}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 24,
              },
            }}
            className="category-swiper"
          >
            {categories.map((category) => (
              <SwiperSlide key={category._id}>
                <CategoryCard
                  id={category._id}
                  name={category.name}
                  slug={category.slug}
                  image={category.image}
                  description={category.description}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Mobile navigation removed. Autoplay handles movement for categories. */}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
