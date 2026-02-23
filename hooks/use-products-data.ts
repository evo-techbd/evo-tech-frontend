"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setProductsList } from "@/store/slices/productSlice";
import { ProductDisplayType } from "@/schemas/admin/product/productschemas";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";

interface PaginationData {
  current_page: number;
  last_page: number;
  total_items: number;
  per_page: number;
}

interface UseProductsDataReturn {
  products: ProductDisplayType[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  paginationData: PaginationData | null;
  serverSidePagination: ServerSidePaginationProps | null;
}

export function useProductsData(): UseProductsDataReturn {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationData, setPaginationData] = useState<PaginationData | null>(
    null
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const products = useSelector(
    (state: RootState) => state.products.allProducts
  );
  const dispatch = useDispatch<AppDispatch>();

  const fetchProducts = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(null);

      // Build query string from search params
      const queryParams = new URLSearchParams();

      const search = searchParams.get("search");
      const category = searchParams.get("category");
      const subcategory = searchParams.get("subcategory");
      const brand = searchParams.get("brand");
      const page = searchParams.get("page");
      const limit = searchParams.get("limit");

      if (search) queryParams.set("search", search);
      if (category) queryParams.set("category", category);
      if (subcategory) queryParams.set("subcategory", subcategory);
      if (brand) queryParams.set("brand", brand);
      if (page) queryParams.set("page", page);
      if (limit) queryParams.set("limit", limit);

      const queryString = queryParams.toString();

      const response = await axios.get(
        `/products${queryString ? `?${queryString}` : ""}`
      );

      const rawData =
        response.data.data ||
        response.data.items_data ||
        response.data.products ||
        [];

      // Transform the data to match ProductDisplayType structure
      const productsData = rawData.map((product: any) => ({
        itemid: product._id || product.id,
        i_name: product.name,
        i_slug: product.slug,
        i_price: product.price,
        i_instock: product.inStock,
        i_stock: product.stock,
        i_lowstockthreshold: product.lowStockThreshold,
        i_mainimg: product.mainImage,
        i_weight: product.weight || 0,
        i_category:
          product.category?.name ||
          product.category?.slug ||
          product.category ||
          "N/A",
        i_subcategory:
          product.subcategory?.name ||
          product.subcategory?.slug ||
          product.subcategory ||
          "N/A",
        i_brand:
          product.brand?.name || product.brand?.slug || product.brand || "N/A",
        i_published: product.published,
      }));

      const pagination: PaginationData = {
        current_page:
          response.data.meta?.page || response.data.current_page || 1,
        last_page:
          response.data.meta?.totalPages || response.data.last_page || 1,
        total_items:
          response.data.meta?.total ||
          response.data.total_items ||
          productsData.length,
        per_page: response.data.meta?.limit || response.data.per_page || 10,
      };

      dispatch(setProductsList(productsData));
      setPaginationData(pagination);
    } catch (error: any) {
      setError("Failed to fetch products.");
      dispatch(setProductsList([]));
      setPaginationData(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, dispatch, currentUser]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      const params = new URLSearchParams(searchParams);
      // remove the limit for default page size
      if (pageSize === 10) {
        params.delete("limit");
      } else {
        params.set("limit", pageSize.toString());
      }
      params.set("page", "1"); // Reset to first page when changing page size
      router.push(`${pathname}?${params.toString()}`); // Changed to push to trigger refetch
    },
    [searchParams, router, pathname]
  );

  // Create server-side pagination props
  const serverSidePagination: ServerSidePaginationProps | null = paginationData
    ? {
        pageCount: paginationData.last_page,
        currentPage: paginationData.current_page,
        totalRecords: paginationData.total_items,
        pageSize: paginationData.per_page,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        isLoading: isLoading,
      }
    : null;

  // Fetch products on mount and when search params change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
    paginationData,
    serverSidePagination,
  };
}
