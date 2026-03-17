import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import axios from "@/utils/axios/axios";
import axiosErrorLogger from "@/components/error/axios_error";
import { unstable_noStore as noStore } from "next/cache";

import BannerCarousel from "@/components/carousels/bannercarousel";
import LogoCarouselClient from "@/components/carousels/logocarousel-client";

import { LiaShippingFastSolid, LiaHeadsetSolid } from "react-icons/lia";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { PiMedal } from "react-icons/pi";
import { Skeleton } from "@/components/ui/skeleton";

import Architects3DModel from "@/public/assets/application_fields/3D-Hagia-Sophia-Model.png";
import Medical3DModel from "@/public/assets/application_fields/foot-anatomy-3dmodel.png";
import Collectible3DModel from "@/public/assets/application_fields/thundar-northwolf-3d-model.png";
import Gaming3DModel from "@/public/assets/application_fields/chess-pieces-3d-model.jpg";
import Designers3DModel from "@/public/assets/application_fields/minimalist-vase-3d-model.png";
import Industry3DModel from "@/public/assets/application_fields/industrial-robot-arm-clean-3d-Model.png";
import FeaturedCategories from "@/components/cards/featuredcategories";
import PopularProductsSlider from "@/components/cards/popularproductsslider";
import FeaturedSectionsRenderer from "@/components/sections/featured-sections-renderer";
import { generateOrganizationSchema, generateWebSiteSchema, StructuredData } from "@/lib/structured-data";
import { isDown } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Home | Evo-TechBD - Bangladesh's Premier Tech Store",
  description: "Shop premium 3D printers (Ender, Creality), filaments (PLA, ABS, PETG), electronics, Arduino, Raspberry Pi & more. Professional 3D printing, laser engraving services in Bangladesh.",
  keywords: [
    '3D printer Bangladesh',
    'Ender 3 V2 Bangladesh',
    'Creality 3D printer',
    'PLA filament Bangladesh',
    'ABS filament price',
    'Arduino Bangladesh',
    'Raspberry Pi Bangladesh',
    '3D printing service Dhaka',
    'laser engraving Bangladesh',
    'electronics store Bangladesh',
    'tech products online Bangladesh',
  ],
  openGraph: {
    title: 'Evo-Tech Bangladesh - 3D Printers, Electronics & Tech Services',
    description: 'Shop premium 3D printers, filaments, electronics. Professional 3D printing & laser engraving services in Bangladesh.',
    url: process.env.NEXT_PUBLIC_FEND_URL || 'https://evo-techbd.com',
    siteName: 'Evo-Tech Bangladesh',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Evo-Tech Bangladesh - 3D Printers, Electronics & Tech Services',
    description: 'Shop premium 3D printers, filaments, electronics. Professional 3D printing & laser engraving services.',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_FEND_URL || 'https://evo-techbd.com',
  },
};

interface LPFeaturedItemSectionTypes {
  title: string;
  view_more_url: string;
  items: any[];
}

// Minimal banner shape expected by BannerCarousel
type Banner = {
  image: string;
  title?: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  more_text?: string;
};

// Stable loading components to prevent re-render cascades
const CarouselLoader = () => (
  <div className="w-full flex justify-center items-center py-6">
    <div className="w-full max-w-[1200px] px-3">
      <div className="relative rounded-[24px] overflow-hidden">
        <Skeleton className="h-[160px] sm:h-[220px] md:h-[260px] w-full bg-gradient-to-r from-stone-100 to-stone-200" />

        <div className="absolute left-6 top-6 w-2/3 sm:w-1/2 md:w-1/2">
          <Skeleton className="h-6 w-[80%] mb-3" />
          <Skeleton className="h-4 w-[60%] mb-4" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CarouselFallback = () => (
  <div className="w-full h-full flex justify-center items-center text-stone-200 text-[13px] leading-6 font-[400] bg-stone-800">
    Loading...
  </div>
);

// home page components start here ----------------------------
const LandingHeaderCarousel = async () => {
  // Use native fetch with ISR caching instead of axios + noStore to save Vercel CPU limits
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL 
    const res = await fetch(`${backendUrl}/banners/active`, {
      next: { revalidate: 3600 }, // Cache on edge for 1 hour to save CPU
      headers: { "Content-Type": "application/json" }
    });
    
    if (!res.ok) throw new Error("Failed to fetch banners");
    
    const bannerData = await res.json();
    const slides: Banner[] = (bannerData?.data || []).map((banner: any) => ({
      image: banner.image,
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      button_text: banner.button_text,
      button_url: banner.button_url,
      more_text: banner.more_text,
    }));

    return (
      <>
        {slides.length > 0 ? (
          <BannerCarousel uniqueid="landingheadercarousel" slides={slides} />
        ) : (
          <CarouselLoader />
        )}
      </>
    );
  } catch (err) {
    console.error("Failed to fetch landing banners:", err);
    return <CarouselLoader />;
  }
};

const ApplicationFields = () => {
  const applicationFields = [
    {
      af_imgsrc: Architects3DModel,
      af_name: "Architects",
      af_model_creator: "",
    },
    {
      af_imgsrc: Designers3DModel,
      af_name: "Designers",
      af_model_creator: "",
    },
    {
      af_imgsrc: Collectible3DModel,
      af_name: "Collectibles",
      af_model_creator: "",
    },
    {
      af_imgsrc: Gaming3DModel,
      af_name: "Gaming",
      af_model_creator: "",
    },
    {
      af_imgsrc: Medical3DModel,
      af_name: "Medical",
      af_model_creator: "",
    },
    {
      af_imgsrc: Industry3DModel,
      af_name: "Industry",
      af_model_creator: "",
    },
  ];

  return (
    <div className="grid justify-items-center w-full h-fit grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {applicationFields.map((field, idx) => (
        <div
          key={`app_field_${idx}`}
          className={`relative flex flex-col items-center min-w-[200px] w-full ${idx === 0 || idx === 5 ? "lg:col-span-2" : ""
            } h-[170px] sm:h-[220px] lg:h-[275px] bg-[#ffffff] rounded-[10px] overflow-hidden`}
        >
          <div
            className="relative w-full h-full overflow-hidden"
            aria-label={field.af_name}
          >
            <Image
              src={field.af_imgsrc}
              alt={`3D Model-${field.af_name}`}
              fill
              quality={90}
              draggable="false"
              sizes="100%"
              loading="lazy"
              className="object-contain pointer-events-none"
            />
          </div>
          {field.af_model_creator && (
            <div className="flex justify-center w-full h-fit text-[10px] leading-5 tracking-[-0.015em] font-[400] text-stone-400 bg-[#e4e4e4] select-none">
              Model from{" "}
              <span className="ml-1 text-stone-700">
                {field.af_model_creator}
              </span>
            </div>
          )}
          <div className="z-[5] absolute inset-0 px-3 py-2 sm:px-5 sm:py-4 font-[600] text-[16px] sm:text-[20px] leading-6 tracking-tight text-stone-700 bg-gradient-to-br from-white from-5% via-transparent via-35% to-transparent">
            {field.af_name}
          </div>
        </div>
      ))}
    </div>
  );
};

const WhyShopWithUs = () => {
  const specialties = [
    {
      s_icon: PiMedal,
      s_title: "Quality Products",
      s_desc: "We provide imported products from top brands.",
    },
    {
      s_icon: LiaShippingFastSolid,
      s_title: "Fast Delivery",
      s_desc: "We deliver your products as fast as possible.",
    },
    {
      s_icon: IoShieldCheckmarkOutline,
      s_title: "Secure Payment",
      s_desc: "Convenient and secure payment methods.",
    },
    {
      s_icon: LiaHeadsetSolid,
      s_title: "24/7 Support",
      s_desc: "Reach out to us anytime for any queries.",
    },
  ];

  return (
    <div className="grid justify-items-center w-full h-fit grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-12">
      {specialties.map((specialty, idx) => (
        <div
          key={`specialty_${idx}`}
          className="flex flex-col items-center w-full h-[220px] px-3 py-5 gap-3 bg-[#fafafa] rounded-[10px] overflow-hidden"
        >
          <div className="flex justify-center items-center w-[55px] h-[55px] rounded-[12px] bg-sky-500">
            <specialty.s_icon
              className="inline w-7 h-7 text-white"
              aria-labelledby={`sp-${specialty.s_title}`}
            />
          </div>
          <h3
            id={`sp-${specialty.s_title}`}
            className="w-full h-fit font-[600] text-[13px] sm:text-[16px] leading-5 sm:leading-6 tracking-tight text-stone-800 text-center"
          >
            {specialty.s_title}
          </h3>
          <p className="w-full h-fit font-[400] text-[11px] sm:text-[14px] leading-5 sm:leading-6 text-stone-600 text-center">
            {specialty.s_desc}
          </p>
        </div>
      ))}
    </div>
  );
};
// home page components end here ----------------------------

const MaintenancePage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 font-inter px-4">
      <div className="w-full max-w-lg flex flex-col items-center gap-8 text-center">

        {/* Logo / Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <h1 className="text-[28px] sm:text-[34px] font-bold text-white leading-tight tracking-tight">
            Evo-Tech Bangladesh
          </h1>
          <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase">
            Under Maintenance
          </p>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-3">
          <p className="text-stone-300 text-[15px] sm:text-[17px] leading-7">
            Our website is currently under maintenance. We&apos;ll be back shortly!
          </p>
          <p className="text-stone-400 text-[13px] sm:text-[14px] leading-6">
            In the meantime, you can still place orders directly via our social handles below. We&apos;re fully operational!
          </p>
        </div>

        {/* Contact Cards */}
        <div className="w-full flex flex-col sm:flex-row gap-4">

          {/* Facebook */}
          <a
            href="https://www.facebook.com/evotechbd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center gap-4 p-4 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/30 hover:bg-[#1877F2]/20 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1877F2] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-[14px]">Facebook</p>
              <p className="text-stone-400 text-[12px]">Message us for orders</p>
              <p className="text-[#1877F2] text-[12px] font-medium">Evo-Tech Bangladesh</p>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/8801799424854"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center gap-4 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-[14px]">WhatsApp</p>
              <p className="text-stone-400 text-[12px]">Place your order instantly</p>
              <p className="text-[#25D366] text-[12px] font-medium">+880 1799-424854</p>
            </div>
          </a>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-stone-700/50 border border-stone-600/50">
          <svg className="w-4 h-4 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
          </svg>
          <p className="text-stone-300 text-[13px]">Call us: <span className="text-white font-semibold">+880 1799-424854</span></p>
        </div>

        <p className="text-stone-500 text-[12px]">
          © {new Date().getFullYear()} Evo-Tech Bangladesh · All Rights Reserved
        </p>
      </div>
    </div>
  );
};

const Home = () => {
  // 🚧 Early exit — render maintenance page when isDown is true
  if (isDown) return <MaintenancePage />;

  const baseUrl = process.env.NEXT_PUBLIC_FEND_URL || 'https://evo-techbd.com';

  // Generate structured data for homepage
  const organizationSchema = generateOrganizationSchema({
    name: 'Evo-Tech Bangladesh',
    url: baseUrl,
    logo: `${baseUrl}/assets/EvoTechBD-logo-white.png`,
    contactPoint: {
      telephone: '+880 1799 424854',
      contactType: 'customer service',
      email: 'evotech.bd22@gmail.com',
    },
    sameAs: [
      // Add your social media profiles
      // 'https://www.facebook.com/evotechbd',
      // 'https://www.instagram.com/evotechbd',
    ],
  });

  const websiteSchema = generateWebSiteSchema(baseUrl, 'Evo-Tech Bangladesh');

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />

      <div className="flex w-full justify-center">
        <div className="w-full max-w-[1400px] px-3 sm:px-6">
          <div id="carousel1" className="w-full">
            <Suspense fallback={<CarouselFallback />}>
              <LandingHeaderCarousel />
            </Suspense>
          </div>
        </div>
      </div>
      <FeaturedCategories />
      <Suspense fallback={<div className="w-full py-8 text-center text-stone-400">Loading featured sections...</div>}>
        <FeaturedSectionsRenderer />
      </Suspense>
      {/* <Featured3DPrintersMaterials /> */}
      <PopularProductsSlider title="Popular Products" />

      <div className="w-full max-w-[1440px] h-fit pb-8 flex flex-col items-center font-inter">
        <div
          id="application_fields"
          className="hidden md:flex flex-col items-center w-full min-h-[400px] px-4 sm:px-8 py-6 gap-5 bg-[radial-gradient(at_center,_var(--tw-gradient-stops))] from-[#f0f7fc] to-[#eeeeee] to-40%"
        >
          <h2 className="flex justify-center w-full h-fit px-3 py-1 font-bold text-[20px] sm:text-[24px] leading-8 text-stone-700 text-center">
            Application Fields
          </h2>
          <div className="flex justify-center w-full h-fit max-sm:px-5">
            <ApplicationFields />
          </div>
        </div>

        <div
          id="our_clients"
          className="flex flex-col items-center w-full min-h-[250px] bg-gradient-to-r from-[#eeeeee] via-[#e8eae8] to-[#eeeeee] gap-5 px-3 sm:px-8 md:px-12 "
        >
          <h2 className="flex justify-center w-full h-fit mt-4 px-3 py-1 font-[600] text-[20px] sm:text-[24px] leading-8 text-stone-700 text-center">
            We Proudly Served
          </h2>
          <LogoCarouselClient />
        </div>

        <div
          id="why_shop_with_us"
          className="flex flex-col items-center w-full min-h-[350px] px-4 sm:px-8 md:px-12 py-6 gap-10 bg-[radial-gradient(at_center,_var(--tw-gradient-stops))] from-[#f0f7fc] to-[#eeeeee] to-40%"
        >
          <h2 className="flex justify-center w-full h-fit mt-4 px-3 py-1 font-[600] text-[20px] sm:text-[24px] leading-8 text-stone-700 text-center">
            Why Shop on Evo-TechBD
          </h2>
          <div className="flex justify-center w-full h-fit">
            <WhyShopWithUs />
          </div>
        </div>
      </div>
    </>
  );
};

Home.displayName = "LandingHome";

export default Home;
