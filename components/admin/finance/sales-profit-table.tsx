"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getSalesProfitColumns, SalesProfitTransactionType } from "@/app/(admins)/control/finance/sales-profit-columns";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";
import { Loader2 } from "lucide-react";

interface SalesProfitTableProps {
  data: SalesProfitTransactionType[];
  isLoading: boolean;
  serverSidePagination?: ServerSidePaginationProps;
}

export const SalesProfitTable = ({
  data,
  isLoading,
  serverSidePagination,
}: SalesProfitTableProps) => {
  const columns = useMemo(() => getSalesProfitColumns(), []);

  if (isLoading && data.length === 0) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="w-full h-fit mt-5">
      <DataTable
        columns={columns}
        data={data}
        enableSelectedRowsCount={false}
        serverSidePagination={serverSidePagination}
      />
    </div>
  );
};
