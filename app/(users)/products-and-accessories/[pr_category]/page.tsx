import { currentRouteProps } from "@/utils/types_interfaces/shared_types";
import axios from "@/utils/axios/axios";
import axiosErrorLogger from "@/components/error/axios_error";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import { ModernProductsContainer } from "@/components/products/modern-products-container";
import DynamicTextBySlug from "./dynamic-text-by-slug";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Products & Accessories",
};

const ProductCategory = async ({ params, searchParams }: currentRouteProps) => {
  // Await params and searchParams in Next.js 15
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.pr_category;

  // Redirect path-based category URLs to query-based URLs for consistent filtering
  // e.g., /products-and-accessories/materials -> /products-and-accessories?category=materials
  if (categorySlug && categorySlug !== "all") {
    const existingParams = new URLSearchParams();

    // Copy all existing search params
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
      if (value) {
        existingParams.set(key, value as string);
      }
    });

    // Add category if not already present
    if (!existingParams.has("category")) {
      existingParams.set("category", categorySlug);
    }

    const queryString = existingParams.toString();
    redirect(
      `/products-and-accessories${queryString ? `?${queryString}` : ""}`
    );
  }

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

  // Get category by slug first to get its ObjectId (unless "all")
  let categoryData = null;
  let categoryId = null;

  if (categorySlug && categorySlug !== "all") {
    const categoryResponse = await axios
      .get(`/categories/slug/${categorySlug}`)
      .then((res) => res.data)
      .catch((error: any) => {
        axiosErrorLogger({ error });
        return null;
      });

    categoryData = categoryResponse?.data;
    categoryId = categoryData?._id;
  }

  // Build query parameters for products
  const queryParams = new URLSearchParams();
  queryParams.set("page", pageno.toString());
  queryParams.set("limit", perpage.toString());
  queryParams.set("published", "true"); // Only show published products

  // If category is not "all", add category ObjectId as filter
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

  // If product listing is on `all` category route and the filter adds a category by slug
  // (e.g. ?category=materials), include that in the query for the server.
  if (!categoryId && resolvedSearchParams?.category) {
    // backend product service accepts slug or id — pass through as-is
    queryParams.set("category", resolvedSearchParams.category as string);
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

  // Fetch brands and subcategories for filters (only if category is specific)
  let availableBrands: any[] = [];
  let availableSubcategories: any[] = [];
  let availableCategories: any[] = [];

  if (categoryId) {
    // Derive brands used in the fetched products (prefer relevant subset over fetching all brands)
    try {
      const derivedBrandsMap: Record<string, any> = {};
      rawProducts.forEach((p: any) => {
        const b = p.brand;
        if (b && typeof b === "object") {
          const id = b._id || b.id || b.slug || JSON.stringify(b);
          if (!derivedBrandsMap[id]) {
            derivedBrandsMap[id] = {
              _id: b._id || id,
              name: b.name || "",
              slug: b.slug || "",
            };
          }
        }
      });
      availableBrands = Object.values(derivedBrandsMap);
    } catch (e) {
      // fallback: fetch all brands if derivation failed
      const brandsResponse = await axios
        .get(`/brands`)
        .then((res) => res.data)
        .catch(() => null);
      availableBrands = brandsResponse?.data || [];
    }

    // Get subcategories for this category
    const subcategoriesResponse = await axios
      .get(`/subcategories?category=${categoryId}`)
      .then((res) => res.data)
      .catch(() => null);
    const fetchedSubcats = subcategoriesResponse?.data || [];

    // Use fetched subcategories as-is (no per-subcategory counts)
    availableSubcategories = fetchedSubcats;
  }

  // If there is no category context (e.g. 'all' listing) — fetch all active brands
  // so the Brand filter remains available for 'all' listings.
  if (!categoryId) {
    const brandsResponse = await axios
      .get(`/brands?isActive=true&limit=1000`)
      .then((res) => res.data)
      .catch(() => null);
    availableBrands = brandsResponse?.data || [];
  }

  // Fetch all active categories (for right-side related categories / 3D paintings section)
  const categoriesResponse = await axios
    .get(`/categories?isActive=true&limit=1000`)
    .then((res) => res.data)
    .catch(() => null);
  availableCategories = categoriesResponse?.data || [];

  return (
    <div className="w-full min-h-screen h-fit flex flex-col items-center font-inter bg-stone-50">
      <DynamicTextBySlug slug={categorySlug} />

      <div className="w-full max-w-[1440px] h-fit pb-12 flex flex-col items-center">
        <div className="flex flex-col w-full px-4 sm:px-8 md:px-12 pt-8 pb-8 gap-6">
          <ModernProductsContainer
            fetchedProductsData={productsData}
            paginationMetaForData={productsMeta}
            categoryData={categoryData}
            availableBrands={availableBrands}
            availableSubcategories={availableSubcategories}
            availableCategories={availableCategories}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCategory;
