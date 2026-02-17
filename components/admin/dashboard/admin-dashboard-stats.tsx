"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";

interface DashboardStats {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  profitGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

export function AdminDashboardStats() {
  const currentUser = getCurrentUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    profitGrowth: 0,
    ordersGrowth: 0,
    customersGrowth: 0,
    productsGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!currentUser) return;

    try {
      const response = await axios.get("/dashboard/stats");

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Keep stats at 0 if there's an error
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStats]);

  const formatCurrency = (amount: number) => {
    return `BDT ${new Intl.NumberFormat("en-US", {
      minimumIntegerDigits: 1,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    growth,
    format = "number",
  }: {
    title: string;
    value: number;
    icon: any;
    growth: number;
    format?: "number" | "currency";
  }) => {
    const formattedValue =
      format === "currency" ? formatCurrency(value) : formatNumber(value);
    const isPositive = growth >= 0;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-stone-600">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-stone-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-stone-900">
            {loading ? "..." : formattedValue}
          </div>
          <div className="flex items-center space-x-1 text-xs text-stone-600 mt-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={isPositive ? "text-green-600" : "text-red-600"}>
              {Math.abs(growth)}%
            </span>
            <span>from last month</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={stats.totalRevenue}
        icon={DollarSign}
        growth={stats.revenueGrowth}
        format="currency"
      />
      <StatCard
        title="Total Profit"
        value={stats.totalProfit}
        icon={TrendingUp} // Or Banknote/Wallet if available, using TrendingUp as placeholder or check imports
        growth={stats.profitGrowth}
        format="currency"
      />
      <StatCard
        title="Total Orders"
        value={stats.totalOrders}
        icon={ShoppingCart}
        growth={stats.ordersGrowth}
      />
      <StatCard
        title="Total Customers"
        value={stats.totalCustomers}
        icon={Users}
        growth={stats.customersGrowth}
      />
      {/* Added a 5th card row or adjust grid if needed, currently 4 cols. User likely wants it visible. 
                Original had 4 cards. Now 5. Adjust grid to fit or just appending.
                Actually grid-cols-4 might break layout. Let's keep 4 cols but maybe 5 items wrap?
                Or maybe remove Products to make room?
                User asked "show some more details of profit/total profit". 
                I'll add it as the 2nd item. 
                Total Products will wrap or I can remove it if space is issue, but better to keep. 
            */}
      <StatCard
        title="Total Products"
        value={stats.totalProducts}
        icon={Package}
        growth={stats.productsGrowth}
      />
    </div>
  );
}
