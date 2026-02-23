"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { getCouponsColumns } from "@/app/(admins)/control/coupons/coupon-columns";
import { toast } from "sonner";
import { BsArrowCounterclockwise } from "react-icons/bs";
import { ICoupon } from "@/hooks/use-coupons-data";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";

const LoadingSpinner: React.FC = () => (
    <div className="h-full flex justify-center items-center">
        <div className="size-4 md:size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
    </div>
);

interface CouponsDataTableProps {
    coupons: ICoupon[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    serverSidePagination: ServerSidePaginationProps | null;
}

const CouponsDataTable = ({ coupons, isLoading, error, refetch, serverSidePagination }: CouponsDataTableProps) => {
    const couponsColumns = React.useMemo(() => getCouponsColumns(refetch), [refetch]);

    // Show error toast when error occurs
    React.useEffect(() => {
        if (error) {
            toast.error(error, {
                action: (
                    <button onClick={refetch} className="text-red-500 hover:text-red-600 px-2 py-0.5 rounded-md flex items-center gap-0.5 underline underline-offset-2 ml-auto">
                        <span>Try again</span>
                        <BsArrowCounterclockwise className="size-4" />
                    </button>
                ),
            });
        }
    }, [error, refetch]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full h-fit mt-5">
            <DataTable
                columns={couponsColumns}
                data={coupons}
                enableSelectedRowsCount={false}
                serverSidePagination={serverSidePagination || undefined}
            />
        </div>
    );
}

export { CouponsDataTable };
