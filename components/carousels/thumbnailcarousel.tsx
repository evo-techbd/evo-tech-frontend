"use client";

import "swiper/css/bundle";
import Image from "next/image";
import { useState, useEffect, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import {
  m,
  AnimatePresence,
  usePresence,
  LazyMotion,
  domAnimation,
  Variants,
} from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ZoomLens from "@/components/ui/zoomlens";

const ImageFrame = memo(({ selectedImage }: { selectedImage: any }) => {
  const [isPresent, safeToRemove] = usePresence();

  useEffect(() => {
    !isPresent && safeToRemove();
  }, [isPresent, safeToRemove]);

  const controlVariants: Variants = {
    enter: {
      scale: 0.98,
      opacity: 0.5,
    },
    visible: {
      zIndex: 1,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      zIndex: 0,
      scale: 1,
      opacity: 0.5,
      transition: {
        duration: 0.01,
      },
    },
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        variants={controlVariants}
        initial="enter"
        animate="visible"
        exit="exit"
        className="relative w-full h-full rounded-[8px] overflow-hidden"
      >
        <Image
          src={selectedImage.imgsrc}
          alt={selectedImage.imgtitle}
          fill
          quality={100}
          draggable="false"
          sizes="100%"
          priority
          className="object-contain object-center"
        />
      </m.div>
    </LazyMotion>
  );
});

const ThumbnailCarousel = ({
  imgdata,
  uniqueid,
}: {
  imgdata: any[];
  uniqueid: string;
}) => {
  const [selectedImg, setSelectedImg] = useState<any>(imgdata[0]);
  const [hovering, setHovering] = useState<boolean>(false);
  const [myCursorPosition, setMyCursorPosition] = useState({
    x: -100,
    y: -100,
  });

  const handleThumbnailClick = (image: any) => {
    if (selectedImg.imgid === image.imgid) return;
    setSelectedImg(image);
  };

  const handleHoverOverImage = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setMyCursorPosition({ x, y });
    if (!hovering) {
      setHovering(true);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[550px] h-fit gap-4 sm:gap-5 pb-3 sm:pb-5">
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={handleHoverOverImage}
        className="relative z-20 flex aspect-square w-full max-h-[550px] rounded-[8px] overflow-hidden shadow-md shadow-black/10 cursor-crosshair"
      >
        <AnimatePresence initial={false} mode="wait">
          <ImageFrame key={selectedImg.imgid} selectedImage={selectedImg} />
        </AnimatePresence>
        {hovering && (
          <ZoomLens
            cursorPosition={myCursorPosition}
            zoomFactor={1.4}
            lensSize={360}
          >
            <Image
              src={selectedImg.imgsrc}
              alt={selectedImg.imgtitle}
              fill
              quality={100}
              draggable="false"
              sizes="100%"
              priority
              className="object-contain object-center"
            />
          </ZoomLens>
        )}
      </div>

      <div className="mycustom-swiper relative flex w-full max-w-[216px] sm:max-w-[284px] h-[40px] sm:h-[60px] px-7 sm:px-8">
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: `#${uniqueid} .sw-thumbnail-custom-prev`,
            nextEl: `#${uniqueid} .sw-thumbnail-custom-next`,
          }}
          slidesPerView="auto"
          spaceBetween={20}
          threshold={4}
          centerInsufficientSlides
          updateOnWindowResize
          slideToClickedSlide
          observer
          id={uniqueid}
          className="w-full h-full"
        >
          {imgdata.map((image: any, index: number) => (
            <SwiperSlide
              key={`thumbnail_img${index}`}
              className="relative !w-[40px] sm:!w-[60px] h-full"
            >
              <div
                className={`relative w-full h-full rounded-[6px] overflow-hidden focus:outline-none cursor-pointer bg-white border-2 ${
                  selectedImg.imgid === image.imgid
                    ? "border-stone-500 brightness-100"
                    : "border-stone-100 brightness-[0.8]"
                }`}
                onClick={() => handleThumbnailClick(image)}
              >
                <Image
                  src={image.imgsrc}
                  alt={image.imgtitle}
                  fill
                  quality={90}
                  draggable="false"
                  sizes="100%"
                  priority
                  className="object-contain object-center"
                />
              </div>
            </SwiperSlide>
          ))}

          <button
            type="button"
            aria-label="previous button for thumbnail carousel"
            className="sw-thumbnail-custom-prev z-10 absolute top-[50%] translate-y-[-50%] left-0 flex w-fit h-fit text-stone-400 hover:text-stone-600 rounded-full overflow-hidden"
          >
            <FiChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 py-1 pr-0.5" />
          </button>

          <button
            type="button"
            aria-label="next button for thumbnail carousel"
            className="sw-thumbnail-custom-next z-10 absolute top-[50%] translate-y-[-50%] right-0 flex w-fit h-fit text-stone-400 hover:text-stone-600 rounded-full overflow-hidden"
          >
            <FiChevronRight className="w-7 h-7 sm:w-8 sm:h-8 py-1 pl-0.5" />
          </button>
        </Swiper>
      </div>
    </div>
  );
};

ImageFrame.displayName = "ImageFrame";
ThumbnailCarousel.displayName = "ThumbnailCarousel";

export default ThumbnailCarousel;
