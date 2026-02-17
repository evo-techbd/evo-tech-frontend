"use client";

import { memo, useMemo } from "react";
import Image from "next/image";

interface LogoCarouselProps {
  logos: {
    brand_name: string;
    brand_logosrc: string;
    brand_url?: string;
    brand_description?: string | null;
  }[];
}

const LogoCarousel = memo(({ logos }: LogoCarouselProps) => {
  // Memoize computed values to prevent re-renders
  const { shouldAnimate, containerClasses, listClasses } = useMemo(() => {
    // Always use a marquee animation when there is more than one logo
    const shouldAnimate = logos.length > 1;
    const speed = logos.length >= 9 ? 30 : logos.length >= 6 ? 20 : 12; // seconds

    return {
      shouldAnimate,
      containerClasses: `w-full inline-flex items-center ${
        shouldAnimate ? "justify-start" : "justify-center"
      } flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,_transparent_0,_black_35%,_black_65%,_transparent_100%)]`,
      listClasses: `w-fit flex items-center [&_li]:mx-8 ${
        shouldAnimate ? `animate-[hr-slide_${speed}s_linear_infinite]` : ""
      }`,
    };
  }, [logos.length]);

  // Memoize logo items to prevent re-rendering individual items
  const logoItems = useMemo(() => {
    return logos.map((logo) => {
      const key = logo.brand_logosrc || logo.brand_name;
      const label = logo.brand_name
        ? `${logo.brand_name} – ${logo.brand_description}`
        : logo.brand_name;

      const hasUrl = Boolean(logo.brand_url);
      return (
        <li
          key={key}
          className="relative text-center w-fit h-fit"
          aria-label={label}
        >
          <a
            href={logo.brand_url ?? "#"}
            target={hasUrl ? "_blank" : undefined}
            rel={hasUrl ? "noopener noreferrer" : undefined}
            className={`relative w-fit h-fit text-center focus:outline-none ${
              hasUrl ? "" : "pointer-events-none cursor-default"
            }`}
            title={logo.brand_name}
            aria-disabled={hasUrl ? "false" : "true"}
          >
            <Image
              src={logo.brand_logosrc}
              alt={logo.brand_name}
              width={100}
              height={50}
              quality={100}
              draggable="false"
              loading="lazy"
              className="object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-95 transition-[filter,_opacity] duration-100"
            />
            {logo.brand_name ? (
              <p className="text-gray-500 my-1">{logo.brand_name}</p>
            ) : null}
          </a>
        </li>
      );
    });
  }, [logos]);

  if (logos.length === 0) {
    return null;
  }

  return (
    <div className={containerClasses}>
      <ul className={listClasses}>{logoItems}</ul>
      {shouldAnimate && (
        <ul className={listClasses} aria-hidden="true">
          {logoItems}
        </ul>
      )}
    </div>
  );
});

LogoCarousel.displayName = "LogoCarousel";

export default LogoCarousel;

// client-side version for better re-render control
export { default as LogoCarouselClient } from "./logocarousel-client";
