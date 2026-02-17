import { currentRouteProps } from "@/utils/types_interfaces/shared_types";
import axios from "@/utils/axios/axios";
import axiosErrorLogger from "@/components/error/axios_error";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import { ModernProductsContainer } from "@/components/products/modern-products-container";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: currentRouteProps): Promise<Metadata> {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.category;
  
  return {
    title: `${categorySlug} - Products & Accessories`,
  };
}

const CategoryPage = async ({ params, searchParams }: currentRouteProps) => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categorySlug = resolvedParams.category;
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

  noStore();

  // Get category by slug
  const categoryResponse = await axios
    .get(`/categories/slug/${categorySlug}`)
    .then((res) => res.data)
    .catch((error: any) => {
      axiosErrorLogger({ error });
      return null;
    });

  if (!categoryResponse?.data) {
    notFound();
  }

  const categoryData = categoryResponse.data;
  const categoryId = categoryData._id;

  // Build query parameters for products
  const queryParams = new URLSearchParams();
  queryParams.set("page", pageno.toString());
  queryParams.set("limit", perpage.toString());
  queryParams.set("published", "true");
  queryParams.set("category", categoryId);

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
    i_instock: product.inStock !== undefined ? product.inStock : true,
    i_mainimg: product.mainImage || "",
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

  // Fetch brands for filters
  let availableBrands: any[] = [];
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
  const availableSubcategories = subcategoriesResponse?.data || [];

  // Fetch all active categories
  const categoriesResponse = await axios
    .get(`/categories?isActive=true&limit=1000`)
    .then((res) => res.data)
    .catch(() => null);
  const availableCategories = categoriesResponse?.data || [];

  return (
    <div className="w-full min-h-screen h-fit flex flex-col items-center font-inter bg-stone-50">
      <div className="w-full max-w-[1440px] py-8 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800 capitalize">
            {categoryData.name}
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Browse all products in {categoryData.name}
          </p>
        </div>

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
  );
};

export default CategoryPage;
