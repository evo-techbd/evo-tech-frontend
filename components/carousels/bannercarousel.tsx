"use client";

import "swiper/css/bundle";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { HiArrowRight } from "react-icons/hi2";

type BannerSlide = {
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  more_text?: string;
};

interface BannerCarouselProps {
  uniqueid: string;
  slides: BannerSlide[];
}

const BannerCarousel = ({ uniqueid, slides }: BannerCarouselProps) => {
  const pagination = {
    clickable: true,
    el: `#${uniqueid} .sw-custom-pagination`,
    renderBullet: function (index: number, className: string) {
      return `<span class="${className}"></span>`;
    },
  };

  const navigation = {
    prevEl: `#${uniqueid} .sw-custom-prev-bttn`,
    nextEl: `#${uniqueid} .sw-custom-next-bttn`,
  };

  return (
    <>
      <div className="relative w-full group" id={uniqueid}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          slidesPerView={1}
          spaceBetween={0}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          speed={1000}
          loop={slides.length >= 2}
          grabCursor
          navigation={navigation}
          pagination={pagination}
          className="group/banner h-full w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide
              key={`slide${index}`}
              className="flex w-full justify-center"
            >
              <div className="relative w-full my-4 min-h-[200px] sm:min-h-[280px] lg:min-h-[350px] overflow-hidden rounded-[16px] bg-gradient-to-br from-[#f8fafb] via-[#f5f7f8] to-[#eef1f3]">
                {/* Desktop: row layout with text 40% left, image 60% right */}
                <div className="flex flex-col lg:flex-row items-center h-full">
                  {/* Left Content - 40% */}
                  <div className="flex flex-col justify-center w-full lg:w-[45%] px-6 sm:px-10 lg:px-12 py-8 lg:py-0 gap-3 lg:gap-5 order-2 lg:order-1">
                    {slide.more_text && (
                      <span className="inline-flex items-center gap-2 self-start rounded-full bg-brand-50 px-3 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600">
                        {slide.more_text}
                      </span>
                    )}
                    {slide.title && (
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-bold leading-[1.15] tracking-tight text-stone-800">
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="font-medium text-brand-600 text-sm sm:text-base lg:text-lg">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.description && (
                      <p className="max-w-[340px] text-xs sm:text-sm text-stone-500 leading-relaxed hidden sm:block">
                        {slide.description}
                      </p>
                    )}
                    {slide.button_text && (
                      <div className="pt-1 sm:pt-2">
                        <Link
                          href={slide.button_url || "#"}
                          className="group inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-white transition-all duration-300 shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30"
                        >
                          <span>{slide.button_text}</span>
                          <HiArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Right Image - 60% Dominant */}
                  <div className="relative flex items-center justify-center w-full lg:w-[55%] h-[180px] sm:h-[220px] lg:h-[340px] order-1 lg:order-2">
                    <div className="relative w-full h-full flex items-center justify-center px-4 lg:px-8">
                      <Image
                        src={slide.image}
                        alt={slide.title || "Hero banner"}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        priority={index === 0}
                        draggable="false"
                        className="object-contain object-center drop-shadow-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}

          {slides.length > 1 && (
            <div className="sw-custom-pagination pointer-events-none absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10"></div>
          )}
        </Swiper>

        {/* Navigation Buttons - Absolute inside wrapper */}
        <button
          type="button"
          aria-label="previous button for banner carousel"
          className="sw-custom-prev-bttn absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-stone-800 shadow-lg transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-xl opacity-0 group-hover:opacity-100"
        >
          <IoChevronBackOutline className="h-6 w-6" />
        </button>

        <button
          type="button"
          aria-label="next button for banner carousel"
          className="sw-custom-next-bttn absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-stone-800 shadow-lg transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-xl opacity-0 group-hover:opacity-100"
        >
          <IoChevronForwardOutline className="h-6 w-6" />
        </button>
      </div>
    </>
  );
};

export default BannerCarousel;
