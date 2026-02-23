"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "@/utils/axios/axios";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";
import { FinanceTransactionType } from "@/app/(admins)/control/finance/finance-columns";
import { SalesProfitTransactionType } from "@/app/(admins)/control/finance/sales-profit-columns";

interface FinanceStats {
  totalInvestment: number;
  totalWithdraw: number;
  totalExpense: number;
  totalSalesProfit: number;
  currentBalance: number;
}

export const useFinanceData = () => {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransactionType[]>([]);
  const [salesProfitData, setSalesProfitData] = useState<SalesProfitTransactionType[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Transaction Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Sales Profit Pagination
  const [spPageIndex, setSpPageIndex] = useState(0);
  const [spPageSize, setSpPageSize] = useState(10);
  const [spTotalItems, setSpTotalItems] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get("/admin/finance/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      // setLoading(true); // Don't trigger global loading for background refresh
      const res = await axios.get("/admin/finance/transactions", {
        params: {
          page: pageIndex + 1,
          limit: pageSize,
        },
      });
      setTransactions(res.data.data);
      setTotalItems(res.data.meta.total);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch transactions");
    }
  }, [pageIndex, pageSize]);

  const fetchSalesProfit = useCallback(async () => {
    try {
      const res = await axios.get("/admin/finance/sales-profit", {
        params: {
          page: spPageIndex + 1,
          limit: spPageSize,
        },
      });
      setSalesProfitData(res.data.data);
      setSpTotalItems(res.data.meta.total);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch sales profit data");
    }
  }, [spPageIndex, spPageSize]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchTransactions(), fetchSalesProfit()]);
    setLoading(false);
  }, [fetchStats, fetchTransactions, fetchSalesProfit]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Transaction Pagination Props
  const serverSidePagination: ServerSidePaginationProps = {
    totalRecords: totalItems,
    currentPage: pageIndex + 1,
    pageSize: pageSize,
    pageCount: Math.ceil(totalItems / pageSize) || 1,
    onPageChange: (page) => setPageIndex(page - 1),
    onPageSizeChange: (size) => {
        setPageSize(size);
        setPageIndex(0);
    },
    isLoading: loading,
  };

  // Sales Profit Pagination Props
  const spServerSidePagination: ServerSidePaginationProps = {
    totalRecords: spTotalItems,
    currentPage: spPageIndex + 1,
    pageSize: spPageSize,
    pageCount: Math.ceil(spTotalItems / spPageSize) || 1,
    onPageChange: (page) => setSpPageIndex(page - 1),
    onPageSizeChange: (size) => {
        setSpPageSize(size);
        setSpPageIndex(0);
    },
    isLoading: loading,
  };

  return {
    stats,
    transactions,
    salesProfitData,
    loading,
    error,
    refreshData,
    serverSidePagination,
    spServerSidePagination,
  };
};
