"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getFinanceColumns, FinanceTransactionType } from "@/app/(admins)/control/finance/finance-columns";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";
import { Loader2 } from "lucide-react";
import { TransactionDetailsModal } from "./transaction-details-modal";

interface FinanceTransactionTableProps {
  transactions: FinanceTransactionType[];
  isLoading: boolean;
  serverSidePagination?: ServerSidePaginationProps;
}

export const FinanceTransactionTable = ({
  transactions,
  isLoading,
  serverSidePagination,
}: FinanceTransactionTableProps) => {
  const [selectedTransaction, setSelectedTransaction] = useState<FinanceTransactionType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (transaction: FinanceTransactionType) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const columns = useMemo(() => getFinanceColumns(handleViewDetails), []);

  if (isLoading && transactions.length === 0) {
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
        data={transactions}
        enableSelectedRowsCount={false}
        serverSidePagination={serverSidePagination}
      />
      
      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
};
