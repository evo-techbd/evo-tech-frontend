import ThumbnailCarousel from "@/components/carousels/thumbnailcarousel";
import { BreadCrumbItems } from "@/utils/types_interfaces/shared_interfaces";
import EvoBreadcrumbs from "@/components/ui/evo_breadcrumbs";
import ItemInteractivePart from "./item-interactive-part";
import ItemSections from "./item-sections";
import { currencyFormatBDT } from "@/lib/all_utils";
import StarRating from "@/components/star-rating";
import { Metadata } from "next";
import { currentRouteProps } from "@/utils/types_interfaces/shared_types";
import axiosErrorLogger from "@/components/error/axios_error";
import axios from "@/utils/axios/axios";
import { Suspense } from "react";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  StructuredData,
} from "@/lib/structured-data";

export const generateMetadata = async (
  props: currentRouteProps,
): Promise<Metadata> => {
  const params = await props.params;
  const itemslug = params.theitem;
  const baseUrl = process.env.NEXT_PUBLIC_FEND_URL || "https://evo-techbd.com";

  // Fetch product data for accurate metadata
  try {
    const productResponse = await axios
      .get(`/products/slug/${itemslug}`)
      .then((res) => res.data)
      .catch(() => null);

    if (productResponse?.data) {
      const product = productResponse.data;
      const productUrl = `${baseUrl}/items/${itemslug}`;
      const imageUrl =
        product.mainImage || `${baseUrl}/assets/default-product.png`;

      return {
        title: `${product.name} | Buy Online in Bangladesh`,
        description:
          product.shortDescription ||
          product.description ||
          `Buy ${product.name} online in Bangladesh. ${product.inStock ? "In stock" : "Available"} at Evo-Tech Bangladesh with warranty and fast delivery.`,
        keywords: [
          product.name,
          product.brand?.name || "tech product",
          product.category?.name || "electronics",
          "Bangladesh",
          "online shopping",
          "buy online",
        ],
        openGraph: {
          title: product.name,
          description:
            product.shortDescription ||
            product.description ||
            `Buy ${product.name} at Evo-Tech Bangladesh`,
          url: productUrl,
          siteName: "Evo-Tech Bangladesh",
          images: [
            {
              url: imageUrl,
              width: 800,
              height: 800,
              alt: product.name,
            },
          ],
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: product.name,
          description:
            product.shortDescription ||
            `Buy ${product.name} at Evo-Tech Bangladesh`,
          images: [imageUrl],
        },
        alternates: {
          canonical: productUrl,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching product metadata:", error);
  }

  // Fallback metadata
  const itemname =
    itemslug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char: string) => char.toUpperCase())
      .slice(0, 40) + (itemslug.replace(/-/g, " ").length > 40 ? "..." : "");

  return {
    title: `${itemname} | Evo-Tech Bangladesh`,
    description: `Buy ${itemname} online in Bangladesh at Evo-Tech. Quality products with warranty.`,
  };
};

const fetchItemData = async (itemSlugHere: string) => {
  // fetch item data from backend using products API
  const productResponse = await axios
    .get(`/products/slug/${itemSlugHere}`)
    .then((res) => res.data)
    .catch((error: any) => {
      axiosErrorLogger({ error });
      return null;
    });

  if (!productResponse || !productResponse.data) {
    return null;
  }

  const product = productResponse.data;

  // Fetch additional product images
  const imagesResponse = await axios
    .get(`/products/${product._id}/images`)
    .then((res) => res.data)
    .catch(() => null);

  const additionalImages = imagesResponse?.data || [];

  // Format images for ThumbnailCarousel component
  const allImageUrls = [
    product.mainImage,
    ...additionalImages.map((img: any) => img.imageUrl),
  ].filter(Boolean);

  const formattedImages = allImageUrls.map((url: string, index: number) => {
    // Find the matching image from additionalImages to get the real _id
    const matchingImage = additionalImages.find(
      (img: any) => img.imageUrl === url,
    );
    return {
      imgid: matchingImage?._id || `img-${index}`,
      imgsrc: url,
      imgtitle: `${product.name} - Image ${index + 1}`,
    };
  });

  // Transform product data to match existing frontend structure
  const normalizedStock =
    typeof product.stock === "number"
      ? product.stock
      : typeof product.stock === "string" && product.stock.trim() !== ""
        ? Number(product.stock)
        : null;

  const normalizedLowStockThreshold =
    typeof product.lowStockThreshold === "number"
      ? product.lowStockThreshold
      : typeof product.lowStockThreshold === "string" &&
        product.lowStockThreshold.trim() !== ""
        ? Number(product.lowStockThreshold)
        : null;

  const hasStockCount =
    typeof normalizedStock === "number" && Number.isFinite(normalizedStock);
  const hasLowStockThreshold =
    typeof normalizedLowStockThreshold === "number" &&
    Number.isFinite(normalizedLowStockThreshold);

  // Fetch feature headers, subsections, specifications, and color variations
  const [
    featureHeadersResponse,
    featureSubsectionsResponse,
    specificationsResponse,
    colorVariationsResponse,
  ] = await Promise.all([
    axios
      .get(`/products/${product._id}/feature-headers`)
      .then((res) => res.data)
      .catch(() => null),
    axios
      .get(`/products/${product._id}/feature-subsections`)
      .then((res) => res.data)
      .catch(() => null),
    axios
      .get(`/products/${product._id}/specifications`)
      .then((res) => res.data)
      .catch(() => null),
    axios
      .get(`/products/${product._id}/color-variations`)
      .then((res) => res.data)
      .catch(() => null),
  ]);

  const featureHeaders = featureHeadersResponse?.data || [];
  const featureSubsections = featureSubsectionsResponse?.data || [];
  const specifications = specificationsResponse?.data || [];
  const colorVariations = colorVariationsResponse?.data || [];

  const itemInfo = {
    itemid: product._id,
    i_name: product.name,
    i_slug: product.slug,
    i_price: product.price,
    i_prevprice: product.previousPrice || 0,
    i_preorderprice: product.preOrderPrice || null,
    i_stock: hasStockCount ? normalizedStock : null,
    i_lowstockthreshold: hasLowStockThreshold
      ? normalizedLowStockThreshold
      : null,
    i_instock:
      typeof product.inStock === "boolean"
        ? product.inStock
        : hasStockCount
          ? (normalizedStock as number) > 0
          : true,
    i_mainimg: product.mainImage || "",
    i_weight: product.weight || 0,
    i_images:
      formattedImages.length > 0
        ? formattedImages
        : [
          {
            imgid: "img-0",
            imgsrc: product.mainImage || "/assets/placeholder-product.svg",
            imgtitle: product.name,
          },
        ],
    i_category: product.category?.slug || product.category || "",
    i_subcategory: product.subcategory?.slug || product.subcategory || "",
    i_brand: product.brand?.slug || product.brand || "",
    i_brandName: product.brand?.name || "",
    i_rating: product.rating || 0,
    i_reviews: product.reviewCount || 0,
    i_features: product.features || [],
    i_colors: product.colors || [],
    i_colorVariations: colorVariations,
    i_faq: product.faqs || [],
    i_featurebanner: product.featureBanner || "",
    i_description: product.description || "",
    i_sectionsdata: {
      featureHeaders,
      featureSubsections,
      specifications,
    },
  };

  return itemInfo;
};

const IndividualItem = async ({ params }: currentRouteProps) => {
  const paramsObj = await params;
  const [itemInfo] = await Promise.all([fetchItemData(paramsObj.theitem)]);
  const baseUrl = process.env.NEXT_PUBLIC_FEND_URL || "https://evo-techbd.com";

  if (!itemInfo) {
    return (
      <>
        <div className="w-full min-h-[60px] sm:min-h-[68px] bg-stone-800 translate-y-[-60px] sm:translate-y-[-68px] mb-[-60px] sm:mb-[-68px]"></div>
        <div className="w-full h-[400px] flex items-center justify-center font-inter bg-gradient-to-b from-stone-800 from-10% to-transparent">
          <p className="w-full text-center text-[13px] sm:text-[16px] leading-6 font-[400] text-stone-100">
            Item not found
          </p>
        </div>
      </>
    );
  }

  const breadcrumbData: BreadCrumbItems[] = [
    {
      content: <span>Home</span>,
      href: "/",
    },
    {
      content: <span>{itemInfo.i_name}</span>,
      href: `/items/${itemInfo.i_slug}`,
    },
  ];

  // Generate structured data for SEO
  const productSchema = generateProductSchema({
    name: itemInfo.i_name,
    description:
      itemInfo.i_description || `Buy ${itemInfo.i_name} at Evo-Tech Bangladesh`,
    price: itemInfo.i_price,
    previousPrice: itemInfo.i_prevprice,
    images: itemInfo.i_images.map((img) => img.imgsrc),
    sku: itemInfo.itemid,
    brand: itemInfo.i_brand || "Evo-Tech Bangladesh",
    inStock: itemInfo.i_instock,
    url: `${baseUrl}/items/${itemInfo.i_slug}`,
    rating: itemInfo.i_rating,
    reviewCount: itemInfo.i_reviews,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: itemInfo.i_name, url: `${baseUrl}/items/${itemInfo.i_slug}` },
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={productSchema} />
      <StructuredData data={breadcrumbSchema} />

      <div className="w-full max-w-[1440px] h-fit pb-12 flex flex-col items-center font-inter">
        <div
          id="item-page-header"
          className="flex flex-col w-full min-h-[400px] px-4 sm:px-8 md:px-12 pt-3 pb-8 sm:pb-12 gap-4"
        >
          <EvoBreadcrumbs breadcrumbitemsdata={breadcrumbData} />
          <div className="flex flex-col items-center lg:flex-row lg:justify-end lg:items-start w-full h-fit px-4 gap-4">
            <ThumbnailCarousel
              imgdata={itemInfo.i_images}
              uniqueid="indiv-item-display-carousel"
            />

            <div className="flex flex-col w-full lg:max-w-[420px] min-[1100px]:max-w-[500px] min-[1250px]:max-w-[650px] h-fit gap-4 px-4 text-stone-700">
              <h1 className="w-full h-fit font-[600] text-[17px] md:text-[18px] leading-6 tracking-tight text-stone-950">
                {itemInfo.i_name}
              </h1>

              <div className="flex flex-wrap justify-between w-full h-fit gap-x-8 gap-y-2 min-[1320px]:pr-10">
                <div className="flex flex-col w-fit h-fit gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] md:text-[18px] leading-6 font-[600] tracking-tight">
                      Regular Price:
                    </span>
                    <span className="text-[16px] md:text-[18px] leading-6 font-[600] tracking-tight">{`BDT ${currencyFormatBDT(
                      itemInfo.i_price,
                    )}`}</span>
                    {currencyFormatBDT(itemInfo.i_prevprice) !==
                      currencyFormatBDT(0) && (
                        <span className="text-[13px] md:text-[14px] leading-6 font-[500] tracking-tight line-through text-[#a19d9a]">
                          {currencyFormatBDT(itemInfo.i_prevprice)}
                        </span>
                      )}
                  </div>
                  {itemInfo.i_preorderprice &&
                    itemInfo.i_preorderprice < itemInfo.i_price && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-md">
                        <span className="text-[13px] md:text-[14px] leading-5 font-[500] text-brand-700">
                          Pre-Order Price:
                        </span>
                        <span className="text-[15px] md:text-[16px] leading-5 font-[700] text-brand-600">{`BDT ${currencyFormatBDT(
                          itemInfo.i_preorderprice,
                        )}`}</span>
                      </div>
                    )}
                </div>
                <div className="flex items-center w-fit h-fit gap-1">
                  <StarRating rating={itemInfo.i_rating} />
                  <span className="text-[13px] sm:text-[14px] leading-6 font-[400] text-stone-400 hover:text-stone-500">{`(${itemInfo.i_reviews})`}</span>
                </div>
              </div>

              <div className="flex items-center w-full h-fit gap-2">
                <p className="w-fit text-[12px] md:text-[13px] leading-5 font-[500] text-stone-600">
                  {`Status: `}
                  <span
                    className={`w-fit h-fit ${itemInfo.i_instock ? "text-emerald-500" : "text-red-400"
                      }`}
                  >{`${itemInfo.i_instock ? "In Stock" : "Out of Stock"
                    }`}</span>
                </p>
              </div>

              {itemInfo.i_features && itemInfo.i_features.length > 0 && (
                <div className="flex flex-col w-full h-fit border-t border-stone-300 my-2 pt-5 pb-3">
                  <h3 className="text-sm md:text-base font-semibold text-stone-900 mb-3 px-4">
                    Key Features
                  </h3>
                  <ul className="flex flex-col w-full h-fit list-disc list-outside pl-8 pr-4 gap-0.5">
                    {itemInfo.i_features.map((feature: string, idx: number) => (
                      <li
                        key={`i_topfeature_${idx}`}
                        className="w-full h-fit text-[12px] md:text-[13px] leading-5 font-[500] text-stone-800"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="relative flex w-full h-fit my-1">
                <Suspense
                  fallback={
                    <div className="w-full min-h-[200px] flex items-center justify-center">
                      <p className="text-[13px] leading-5 font-[500] text-stone-600">
                        Loading...
                      </p>
                    </div>
                  }
                >
                  <ItemInteractivePart singleitem={itemInfo} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Always show sections - Reviews and FAQs are available for all products */}
        <ItemSections
          itemId={itemInfo.itemid}
          featuresdata={{
            header: itemInfo.i_sectionsdata?.featureHeaders || [],
            subsections: itemInfo.i_sectionsdata?.featureSubsections || [],
            banner: itemInfo.i_featurebanner
              ? itemInfo.i_images?.find(
                (img: any) => img.imgid === itemInfo.i_featurebanner,
              )
              : null,
          }}
          specsdata={itemInfo.i_sectionsdata?.specifications || []}
          faqsdata={itemInfo.i_faq || []}
        />
      </div>
    </>
  );
};

IndividualItem.displayName = "IndividualItem";

export default IndividualItem;
