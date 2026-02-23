import { currentRouteProps } from "@/utils/types_interfaces/shared_types";
import axios from "@/utils/axios/axios";
import axiosErrorLogger from "@/components/error/axios_error";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import { ModernProductsContainer } from "@/components/products/modern-products-container";

export const metadata: Metadata = {
  title: "Products & Accessories",
};

const ProductsAndAccessories = async ({ searchParams }: currentRouteProps) => {
  // Await searchParams in Next.js 15
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedSearchParams.category as string | undefined;
  const pageno = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page as string)
    : 1;
  const perpage = resolvedSearchParams.perpage
    ? parseInt(resolvedSearchParams.perpage as string)
    : 12;
  const instockfilter = resolvedSearchParams.instock
    ? (resolvedSearchParams.instock as string)
    : null;
  const sortBy = resolvedSearchParams.sortBy as string | undefined;
  const sortOrder = resolvedSearchParams.sortOrder as string | undefined;
  const minPrice = resolvedSearchParams.minPrice as string | undefined;
  const maxPrice = resolvedSearchParams.maxPrice as string | undefined;
  const brand = resolvedSearchParams.brand as string | undefined;
  const subcategory = resolvedSearchParams.subcategory as string | undefined;

  noStore(); // equivalent to cache: 'no-store' in fetch API

  // Get category by slug first to get its ObjectId (if category filter is applied)
  let categoryData = null;
  let categoryId = null;

  if (categorySlug) {
    // console.log(`[ProductsAndAccessories] Fetching category with slug: "${categorySlug}"`);

    const categoryResponse = await axios
      .get(`/categories/slug/${categorySlug}`)
      .then((res) => {
        // console.log(`[ProductsAndAccessories] ✅ Category found for slug: "${categorySlug}"`);
        return res.data;
      })
      .catch((error: any) => {
        console.error(`[ProductsAndAccessories] ❌ Failed to fetch category with slug: "${categorySlug}"`);
        console.error(`[ProductsAndAccessories] Error details:`, error.response?.data || error.message);
        axiosErrorLogger({ error });
        return null;
      });

    categoryData = categoryResponse?.data;
    categoryId = categoryData?._id;

    if (!categoryData) {
      console.warn(`[ProductsAndAccessories] Category data is null for slug: "${categorySlug}"`);
    }
  }

  // Build query parameters for products
  const queryParams = new URLSearchParams();
  queryParams.set("page", pageno.toString());
  queryParams.set("limit", perpage.toString());
  queryParams.set("published", "true"); // Only show published products

  // Add category ObjectId as filter if available
  if (categoryId) {
    queryParams.set("category", categoryId);
  }

  if (instockfilter) {
    queryParams.set("inStock", instockfilter);
  }

  if (sortBy) {
    queryParams.set("sortBy", sortBy);
  }

  if (sortOrder) {
    queryParams.set("sortOrder", sortOrder);
  }

  if (minPrice) {
    queryParams.set("minPrice", minPrice);
  }

  if (maxPrice) {
    queryParams.set("maxPrice", maxPrice);
  }

  if (brand) {
    queryParams.set("brand", brand);
  }

  if (subcategory) {
    queryParams.set("subcategory", subcategory);
  }

  const productslist = await axios
    .get(`/products?${queryParams.toString()}`)
    .then((res) => res.data)
    .catch((error: any) => {
      axiosErrorLogger({ error });
      return null;
    });

  // Transform backend product data to match frontend expectations
  const rawProducts = productslist?.data || [];
  const productsData = rawProducts.map((product: any) => ({
    itemid: product._id || product.id,
    i_name: product.name,
    i_slug: product.slug,
    i_price: product.price,
    i_prevprice: product.previousPrice || 0,
    i_preorderprice: product.preOrderPrice || null,
    i_ispreorder: product.isPreOrder || false,
    i_instock: product.inStock !== undefined ? product.inStock : true,
    i_mainimg: product.mainImage || "",
    i_weight: product.weight || 0,
    i_category: product.category?.slug || product.category || "",
    i_subcategory: product.subcategory?.slug || product.subcategory || "",
    i_brand: product.brand?.slug || product.brand || "",
    i_brandName: product.brand?.name || "",
    i_rating: product.rating || 0,
    i_reviewCount: product.reviewCount || 0,
    i_features: product.features || [],
    i_description: product.shortDescription || product.description || "",
  }));

  const productsMeta = {
    currentPage: productslist?.meta?.page || pageno,
    lastPage:
      productslist?.meta?.totalPages ||
      Math.ceil((productslist?.meta?.total || 0) / perpage),
    totalItems: productslist?.meta?.total || 0,
    itemsPerPage: perpage,
  };

  // Fetch brands and subcategories for filters
  let availableBrands: any[] = [];
  let availableSubcategories: any[] = [];
  let availableCategories: any[] = [];

  // Fetch all active brands (always show all brands in filter)
  const brandsResponse = await axios
    .get(`/brands?isActive=true&limit=1000`)
    .then((res) => res.data)
    .catch(() => null);
  availableBrands = brandsResponse?.data || [];

  if (categoryId) {
    // Get subcategories for this category
    const subcategoriesResponse = await axios
      .get(`/subcategories?category=${categoryId}`)
      .then((res) => res.data)
      .catch(() => null);
    availableSubcategories = subcategoriesResponse?.data || [];
  }

  // Fetch all active categories for the filter sidebar
  const categoriesResponse = await axios
    .get(`/categories?isActive=true&limit=1000`)
    .then((res) => res.data)
    .catch(() => null);
  availableCategories = categoriesResponse?.data || [];

  return (
    <section className="flex flex-col w-full min-h-screen py-4 sm:py-8">
      <div className="flex flex-col max-w-[1440px] w-full h-fit mx-auto px-4 sm:px-8 md:px-12">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">
            {categoryData ? categoryData.name : "All Products"}
          </h1>
          {categoryData?.description && (
            <p className="text-stone-600 mt-2">{categoryData.description}</p>
          )}
        </div>

        {/* Products Container with Filters */}
        <ModernProductsContainer
          fetchedProductsData={productsData}
          paginationMetaForData={productsMeta}
          categoryData={categoryData}
          availableBrands={availableBrands}
          availableSubcategories={availableSubcategories}
          availableCategories={availableCategories}
        />
      </div>
    </section>
  );
};

export default ProductsAndAccessories;
