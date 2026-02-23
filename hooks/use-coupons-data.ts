"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";

export interface ICoupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount?: number;
  validFrom: string;
  validUntil: string;
  maxUsageCount: number;
  currentUsageCount: number;
  isReusable: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  total_items: number;
  per_page: number;
}

interface UseCouponsDataReturn {
  coupons: ICoupon[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  paginationData: PaginationData | null;
  serverSidePagination: ServerSidePaginationProps | null;
}

export function useCouponsData(): UseCouponsDataReturn {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationData, setPaginationData] = useState<PaginationData | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const fetchCoupons = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      const page = searchParams.get("page");
      const limit = searchParams.get("limit");
      const search = searchParams.get("search");

      if (page) queryParams.set("page", page);
      if (limit) queryParams.set("limit", limit);
      if (search) queryParams.set("search", search);

      const queryString = queryParams.toString();
      const response = await axios.get(`/coupons${queryString ? `?${queryString}` : ""}`);

      const rawData = response.data.data || response.data.coupons || [];
      setCoupons(rawData);

      const pagination: PaginationData = {
        current_page: response.data.meta?.page || response.data.current_page || 1,
        last_page: response.data.meta?.totalPages || response.data.last_page || 1,
        total_items: response.data.meta?.total || response.data.total_items || rawData.length,
        per_page: response.data.meta?.limit || response.data.per_page || 10,
      };

      setPaginationData(pagination);
    } catch (error: any) {
      setError("Failed to fetch coupons.");
      setCoupons([]);
      setPaginationData(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, currentUser]);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      const params = new URLSearchParams(searchParams);
      if (pageSize === 10) {
        params.delete("limit");
      } else {
        params.set("limit", pageSize.toString());
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

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

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return {
    coupons,
    isLoading,
    error,
    refetch: fetchCoupons,
    paginationData,
    serverSidePagination,
  };
}
