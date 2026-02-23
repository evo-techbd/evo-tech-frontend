"use client";

import 'swiper/css/bundle';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from '@/components/cards/productcard';



const ScrollProductsAlongX = ({ uniqueid, productsdata }: { uniqueid: string; productsdata: any[]; }) => {

    return (
        <div className="mycustom-swiper mycustom-swiperwrapper-h-fit relative w-full h-fit">
            <Swiper
                modules={[Navigation]}
                slidesPerView={1}
                spaceBetween={20}
                navigation={{
                    prevEl: `#${uniqueid} .sw-custom-prev-bttn`,
                    nextEl: `#${uniqueid} .sw-custom-next-bttn`,
                }}
                threshold={0}
                grabCursor
                preventClicks
                preventClicksPropagation
                updateOnWindowResize
                breakpoints={{
                    350: { slidesPerView: 1.25, spaceBetween: 20 },
                    400: { slidesPerView: 1.5, spaceBetween: 20 },
                    500: { slidesPerView: 1.75, spaceBetween: 20 },
                    600: { slidesPerView: 2, spaceBetween: 20 },
                    700: { slidesPerView: 2.5, spaceBetween: 20 },
                    800: { slidesPerView: 2.75, spaceBetween: 20 },
                    875: { slidesPerView: 3, spaceBetween: 20 },
                    950: { slidesPerView: 3.5, spaceBetween: 20 },
                    1024: { slidesPerView: 4, spaceBetween: 20 },
                    1300: { slidesPerView: 4.5, spaceBetween: 20 },
                    1400: { slidesPerView: 5, spaceBetween: 20 },
                }}
                onSwiper={(swiper) => {
                    if (swiper.isBeginning) { swiper.navigation.prevEl?.classList.replace('flex', 'hidden'); }
                    else { swiper.navigation.prevEl?.classList.replace('hidden', 'flex'); }
                    if (swiper.isEnd) { swiper.navigation.nextEl?.classList.replace('flex', 'hidden'); }
                    else { swiper.navigation.nextEl?.classList.replace('hidden', 'flex'); }
                }}
                onResize={(swiper) => {
                    if (swiper.isBeginning) { swiper.navigation.prevEl?.classList.replace('flex', 'hidden'); }
                    else { swiper.navigation.prevEl?.classList.replace('hidden', 'flex'); }
                    if (swiper.isEnd) { swiper.navigation.nextEl?.classList.replace('flex', 'hidden'); }
                    else { swiper.navigation.nextEl?.classList.replace('hidden', 'flex'); }
                }}
                onSlideChangeTransitionEnd={(swiper) => {
                    if (swiper.isBeginning) { swiper.navigation.prevEl?.classList.replace('flex', 'hidden'); }
                    else { swiper.navigation.prevEl?.classList.replace('hidden', 'flex'); }
                    if (swiper.isEnd) { swiper.navigation.nextEl?.classList.replace('flex', 'hidden'); }
                    else { swiper.navigation.nextEl?.classList.replace('hidden', 'flex'); }
                }}
                id={uniqueid}
                className="w-full h-fit group/swiperbttn"
            >
                {
                    productsdata.map((product: any, idx: number) => (
                        <SwiperSlide key={`product_${idx}`} className="relative h-fit">
                            <ProductCard imgsrc={product.i_mainimg} prodname={product.i_name} prodslug={product.i_slug} prodprice={product.i_price} prodprevprice={product.i_prevprice} instock={product.i_instock} />
                        </SwiperSlide>
                    ))
                }

                <button type="button" aria-label="previous button" className="sw-custom-prev-bttn z-10 absolute top-[50%] translate-y-[-50%] left-0 md:translate-x-[-50%] flex w-fit h-fit opacity-0 group-hover/swiperbttn:opacity-80 rounded-full overflow-hidden bg-white/50 hover:bg-white/80 shadow-md shadow-black/15 transition-[background-color,_opacity] ease-in-out [transition-duration:200ms,_500ms]">
                    <FiChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 text-stone-900 py-1 pr-0.5" />
                </button>

                <button type="button" aria-label="next button" className="sw-custom-next-bttn z-10 absolute top-[50%] translate-y-[-50%] right-0 md:translate-x-[50%] flex w-fit h-fit opacity-0 group-hover/swiperbttn:opacity-80 rounded-full overflow-hidden bg-white/50 hover:bg-white/80 shadow-md shadow-black/15 transition-[background-color,_opacity] ease-in-out [transition-duration:200ms,_500ms]">
                    <FiChevronRight className="w-7 h-7 sm:w-8 sm:h-8 text-stone-900 py-1 pl-0.5" />
                </button>
            </Swiper>
        </div>
    );
}

export default ScrollProductsAlongX;
