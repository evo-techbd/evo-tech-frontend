"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ordersColumns } from "@/app/(admins)/control/orders/order-columns";
import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { useOrdersData } from "@/hooks/use-orders-data";
import { toast } from "sonner";
import { BsArrowCounterclockwise } from "react-icons/bs";
import OrderTableRowActions from "@/components/admin/orders/comps/order-table-row-actions";
import { usePendingOrders } from "@/contexts/PendingOrdersContext";

const LoadingSpinner: React.FC = () => (
    <div className="h-full flex justify-center items-center">
        <div className="size-4 md:size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
    </div>
);

const OrdersDataTable = () => {
    const { orders, isLoading, error, refetch, serverSidePagination } = useOrdersData();
    const { refreshPendingCount } = usePendingOrders();

    // Wrap refetch to also update pending count
    const handleRefetch = React.useCallback(async () => {
        await refetch();
        await refreshPendingCount();
    }, [refetch, refreshPendingCount]);

    // Create columns with refetch function passed to row actions
    const columnsWithRefetch = React.useMemo(() => 
        ordersColumns.map(col => {
            if (col.id === 'actions') {
                return {
                    ...col,
                    cell: ({ row }: any) => (
                        <OrderTableRowActions row={row} onDataChange={handleRefetch} />
                    ),
                };
            }
            return col;
        }), [handleRefetch]
    );

    // customize the action button background of the toast
    React.useEffect(() => {
        if (error) {
            toast.error(error, {
                action: (
                    <button onClick={handleRefetch} className="text-red-500 hover:text-red-600 px-2 py-0.5 rounded-md flex items-center gap-0.5 underline underline-offset-2 ml-auto">
                        <span>Try again</span>
                        <BsArrowCounterclockwise className="size-4" />
                    </button>
                ),
            });
        }
    }, [error, handleRefetch]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full h-fit mt-5">
            <DataTable<OrderWithItemsType, any>
                columns={columnsWithRefetch}
                data={orders || []}
                enableSelectedRowsCount={false}
                serverSidePagination={serverSidePagination || undefined}
            />
        </div>
    );
}

export { OrdersDataTable };
