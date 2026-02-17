"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFormatBDT } from "@/lib/all_utils";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

interface FinanceStatsProps {
  stats: {
    totalInvestment: number;
    totalWithdraw: number;
    totalExpense: number;
    totalSalesProfit: number;
    currentBalance: number;
  } | null;
  isLoading: boolean;
}

export const FinanceStatsCards = ({ stats, isLoading }: FinanceStatsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white/50 animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-stone-200 h-8 w-24 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-stone-500">
            Total Investment
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            BDT {currencyFormatBDT(stats?.totalInvestment || 0)}
          </div>
          <p className="text-xs text-stone-500">Capital Added</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-stone-500">
            Total Sales Profit
          </CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            BDT {currencyFormatBDT(stats?.totalSalesProfit || 0)}
          </div>
          <p className="text-xs text-stone-500">From Product Sales</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-stone-500">
            Total Money Out
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            BDT {currencyFormatBDT((stats?.totalWithdraw || 0) + (stats?.totalExpense || 0))}
          </div>
          <p className="text-xs text-stone-500">Includes Expenses & Withdraws</p>
        </CardContent>
      </Card>

      <Card className="bg-stone-900 text-stone-50 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-stone-300">
            Current Balance
          </CardTitle>
          <Wallet className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-400">
            BDT {currencyFormatBDT(stats?.currentBalance || 0)}
          </div>
          <p className="text-xs text-stone-400">Available Funds</p>
        </CardContent>
      </Card>
    </div>
  );
};
