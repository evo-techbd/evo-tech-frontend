"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '@/store/store';
import { setOrdersList } from "@/store/slices/orderSlice";
import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";

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
    const [paginationData, setPaginationData] = useState<OrdersPaginationData | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const orders = useSelector((state: RootState) => state.orders.allOrders) || [];
    const dispatch = useDispatch<AppDispatch>();

    const fetchOrders = useCallback(async () => {
        if (!currentUser) return;

        try {
            setIsLoading(true);
            setError(null);

            // Build query string from search params
            const queryParams = new URLSearchParams();

            const search = searchParams.get('search');
            const order_status = searchParams.get('order_status');
            const payment_status = searchParams.get('payment_status');
            const page = searchParams.get('page');
            const limit = searchParams.get('limit');

            const requestedPage = page ? parseInt(page) : 1;

            if (search) queryParams.set('search', search);
            if (order_status) queryParams.set('order_status', order_status);
            if (payment_status) queryParams.set('payment_status', payment_status);
            if (page) queryParams.set('page', page);
            if (limit) queryParams.set('limit', limit);

            const queryString = queryParams.toString();

            const response = await axios.get(
                `/api/admin/orders${queryString ? `?${queryString}` : ""}`,
            );

            // console.log('✅ useOrdersData - Response:', {
            //     success: response.data.success,
            //     hasData: !!response.data.data,
            //     dataIsArray: Array.isArray(response.data.data),
            //     dataLength: Array.isArray(response.data.data) ? response.data.data.length : 'N/A',
            //     hasResult: !!response.data.data?.result,
            //     resultLength: response.data.data?.result?.length || 'N/A',
            //     hasMeta: !!response.data.meta,
            //     keys: Object.keys(response.data),
            //     firstItem: Array.isArray(response.data.data) ? response.data.data[0] : null
            // });

            // Backend returns: { success: true, data: [...orders...] or { result: [...], meta: {...} }, meta: {...} }
            let ordersData;
            
            if (Array.isArray(response.data.data)) {
                // Direct array
                ordersData = response.data.data;
            } else if (response.data.data?.result) {
                // Nested in result
                ordersData = response.data.data.result;
            } else if (response.data.orders_data) {
                // Old format
                ordersData = response.data.orders_data;
            } else {
                ordersData = [];
            }
            
            const meta = response.data.meta || response.data.data?.meta;
            
            const pagination: OrdersPaginationData = {
                current_page: meta?.page || response.data.current_page || 1,
                last_page: meta?.totalPages || response.data.last_page || 1,
                total_orders: meta?.total || response.data.total_orders || 0,
                per_page: meta?.limit || response.data.per_page || 10,
            };

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
                params.set('page', pagination.last_page.toString());
                router.replace(`${pathname}?${params.toString()}`);
            }
        } catch (error: any) {
            console.error('❌ useOrdersData - Error:', error.response?.data || error.message);
            setError('Failed to fetch orders.');
            dispatch(setOrdersList([]));
            setPaginationData(null);
        } finally {
            setIsLoading(false);
        }
    }, [searchParams, dispatch, router, pathname, currentUser]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    // Handle page size change
    const handlePageSizeChange = useCallback((pageSize: number) => {
        const params = new URLSearchParams(searchParams);
        // remove the limit for default page size
        if (pageSize === 10) {
            params.delete('limit');
        } else {
            params.set('limit', pageSize.toString());
        }
        params.set('page', '1'); // Reset to first page when changing page size
        router.replace(`${pathname}?${params.toString()}`); // use replace instead of push for page size change
    }, [searchParams, router, pathname]);

    // Create server-side pagination props
    const serverSidePagination: ServerSidePaginationProps | null = paginationData ? {
        pageCount: paginationData.last_page,
        currentPage: paginationData.current_page,
        totalRecords: paginationData.total_orders,
        pageSize: paginationData.per_page,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        isLoading: isLoading,
    } : null;

    // Fetch orders on mount and when search params change
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return {
        orders,
        isLoading,
        error,
        refetch: fetchOrders,
        paginationData,
        serverSidePagination,
    };
}
