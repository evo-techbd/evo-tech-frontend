"use client";

import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";

interface CouponsCountProps {
    serverSidePagination: ServerSidePaginationProps | null;
    isLoading: boolean;
}

export const CouponsCount = ({ serverSidePagination, isLoading }: CouponsCountProps) => {
    const totalCoupons = serverSidePagination?.totalRecords || 0;

    if (isLoading) {
        return (
            <Badge variant="secondary" className="h-6 px-2.5 animate-pulse">
                <Package className="size-3.5 mr-1.5" />
                <span className="text-xs">Loading...</span>
            </Badge>
        );
    }

    return (
        <Badge variant="secondary" className="h-6 px-2.5">
            <Package className="size-3.5 mr-1.5" />
            <span className="text-xs font-medium">{totalCoupons} {totalCoupons === 1 ? 'coupon' : 'coupons'}</span>
        </Badge>
    );
};
