"use client";

import { FinanceStatsCards } from "@/components/admin/finance/finance-stats-cards";
import { AddTransactionModal } from "@/components/admin/finance/add-transaction-modal";
import { FinanceTransactionTable } from "@/components/admin/finance/finance-transaction-table";
import { SalesProfitTable } from "@/components/admin/finance/sales-profit-table";
import { useFinanceData } from "@/hooks/use-finance-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminFinanceClient = () => {
  const {
    stats,
    transactions,
    salesProfitData,
    loading,
    refreshData,
    serverSidePagination,
    spServerSidePagination,
  } = useFinanceData();

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-stone-900">
            Finance Management
          </h2>
          <AddTransactionModal onSuccess={refreshData} />
        </div>
        
        <FinanceStatsCards stats={stats} isLoading={loading} />

        <div className="flex flex-col gap-4">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList>
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
              <TabsTrigger value="sales-profit">Sales Profit History</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions">
              <h3 className="text-lg font-semibold text-stone-800 mt-4 h-hidden">Recent Transactions</h3>
              <FinanceTransactionTable 
                transactions={transactions} 
                isLoading={loading}
                serverSidePagination={serverSidePagination}
              />
            </TabsContent>
            <TabsContent value="sales-profit">
              <h3 className="text-lg font-semibold text-stone-800 mt-4 h-hidden">Sales Profit Items</h3>
              <SalesProfitTable 
                data={salesProfitData}
                isLoading={loading}
                serverSidePagination={spServerSidePagination}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminFinanceClient;
