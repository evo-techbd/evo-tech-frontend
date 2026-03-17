"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setOrdersList } from "@/store/slices/orderSlice";
import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";
import { getCurrentUser } from "@/utils/cookies";

const ORDERS_CACHE_TTL_MS = 120000;

interface OrdersApiResponse {
  ordersData: OrderWithItemsType[];
  pagination: OrdersPaginationData;
}

const inFlightOrderRequests = new Map<string, Promise<OrdersApiResponse>>();
const ordersResponseCache = new Map<
  string,
  { timestamp: number; response: OrdersApiResponse }
>();

const getQueryStringFromSearchParams = (searchParams: URLSearchParams) => {
  const queryParams = new URLSearchParams();

  const search = searchParams.get("search");
  const order_status = searchParams.get("order_status");
  const payment_status = searchParams.get("payment_status");
  const category = searchParams.get("category");
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  if (search) queryParams.set("search", search);
  if (order_status) queryParams.set("order_status", order_status);
  if (payment_status) queryParams.set("payment_status", payment_status);
  if (category) queryParams.set("category", category);
  if (page) queryParams.set("page", page);
  if (limit) queryParams.set("limit", limit);

  return queryParams.toString();
};

const fetchOrdersFromApi = async (
  queryString: string,
): Promise<OrdersApiResponse> => {
  const now = Date.now();
  const cacheKey = queryString || "__default__";
  const cached = ordersResponseCache.get(cacheKey);

  if (cached && now - cached.timestamp < ORDERS_CACHE_TTL_MS) {
    return cached.response;
  }

  const activeRequest = inFlightOrderRequests.get(cacheKey);
  if (activeRequest) {
    return activeRequest;
  }

  const requestPromise = (async () => {
    const response = await fetch(
      `/api/admin/orders${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch orders (${response.status})`);
    }

    const payload = await response.json();

    let ordersData: OrderWithItemsType[];

    if (Array.isArray(payload.data)) {
      ordersData = payload.data;
    } else if (payload.data?.result) {
      ordersData = payload.data.result;
    } else if (payload.orders_data) {
      ordersData = payload.orders_data;
    } else {
      ordersData = [];
    }

    const meta = payload.meta || payload.data?.meta;

    const pagination: OrdersPaginationData = {
      current_page: meta?.page || payload.current_page || 1,
      last_page: meta?.totalPages || payload.last_page || 1,
      total_orders: meta?.total || payload.total_orders || 0,
      per_page: meta?.limit || payload.per_page || 10,
    };

    const parsedResponse = { ordersData, pagination };
    ordersResponseCache.set(cacheKey, {
      timestamp: Date.now(),
      response: parsedResponse,
    });

    return parsedResponse;
  })();

  inFlightOrderRequests.set(cacheKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    inFlightOrderRequests.delete(cacheKey);
  }
};

interface OrdersPaginationData {
  current_page: number;
  last_page: number;
  total_orders: number;
  per_page: number;
}

interface UseOrdersDataReturn {
  orders: OrderWithItemsType[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  paginationData: OrdersPaginationData | null;
  serverSidePagination: ServerSidePaginationProps | null;
}

export function useOrdersData(): UseOrdersDataReturn {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationData, setPaginationData] =
    useState<OrdersPaginationData | null>(null);

  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const router = useRouter();
  const pathname = usePathname();
  const orders =
    useSelector((state: RootState) => state.orders.allOrders) || [];
  const dispatch = useDispatch<AppDispatch>();

  const fetchOrders = useCallback(async () => {
    if (!currentUser) return;

    try {
      if (orders.length === 0) {
        setIsLoading(true);
      }
      setError(null);

      const stableSearchParams = new URLSearchParams(searchParamsString);
      const queryString = getQueryStringFromSearchParams(stableSearchParams);
      const page = stableSearchParams.get("page");

      const requestedPage = page ? parseInt(page) : 1;

      const { ordersData, pagination } = await fetchOrdersFromApi(queryString);

      // console.log('📊 useOrdersData - Extracted:', {
      //     ordersCount: ordersData?.length || 0,
      //     pagination,
      //     sampleOrder: ordersData?.[0],
      //     sampleOrderKeys: ordersData?.[0] ? Object.keys(ordersData[0]) : [],
      //     allOrderFields: ordersData?.[0] ? {
      //         orderNumber: ordersData[0]?.orderNumber,
      //         orderStatus: ordersData[0]?.orderStatus,
      //         paymentStatus: ordersData[0]?.paymentStatus,
      //         paymentMethod: ordersData[0]?.paymentMethod,
      //         shippingType: ordersData[0]?.shippingType,
      //         totalPayable: ordersData[0]?.totalPayable,
      //         firstname: ordersData[0]?.firstname,
      //         lastname: ordersData[0]?.lastname,
      //         email: ordersData[0]?.email,
      //     } : null
      // });

      dispatch(setOrdersList(ordersData));
      setPaginationData(pagination);

      // Handle edge case: redirect if requested page > available pages
      // Only redirect if we have valid data and the requested page is invalid
      if (pagination.last_page > 0 && requestedPage > pagination.last_page) {
        const params = new URLSearchParams(searchParams);
        params.set("page", pagination.last_page.toString());
        router.replace(`${pathname}?${params.toString()}`);
      }
    } catch (error: any) {
      console.error(
        "❌ useOrdersData - Error:",
        error.response?.data || error.message,
      );
      setError("Failed to fetch orders.");
      dispatch(setOrdersList([]));
      setPaginationData(null);
      ordersResponseCache.clear();
    } finally {
      setIsLoading(false);
    }
  }, [
    searchParamsString,
    dispatch,
    router,
    pathname,
    currentUser,
    orders.length,
  ]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      ordersResponseCache.clear();
      const params = new URLSearchParams(searchParamsString);
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParamsString, router, pathname],
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      ordersResponseCache.clear();
      const params = new URLSearchParams(searchParamsString);
      // remove the limit for default page size
      if (pageSize === 10) {
        params.delete("limit");
      } else {
        params.set("limit", pageSize.toString());
      }
      params.set("page", "1"); // Reset to first page when changing page size
      router.replace(`${pathname}?${params.toString()}`); // use replace instead of push for page size change
    },
    [searchParamsString, router, pathname],
  );

  // Create server-side pagination props
  const serverSidePagination: ServerSidePaginationProps | null = paginationData
    ? {
        pageCount: paginationData.last_page,
        currentPage: paginationData.current_page,
        totalRecords: paginationData.total_orders,
        pageSize: paginationData.per_page,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        isLoading: isLoading,
      }
    : null;

  // Fetch orders on mount and when search params change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: async () => {
      ordersResponseCache.clear();
      await fetchOrders();
    },
    paginationData,
    serverSidePagination,
  };
}
