"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { DateRangeSelector, DateRangeType } from "./date-range-selector";

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
  orderBreakdown?: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export function AdminDashboardStats() {
  const currentUser = getCurrentUser();
  const [dateRange, setDateRange] = useState<DateRangeType>("all-time");
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
    orderBreakdown: {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const response = await axios.get(`/dashboard/stats?range=${dateRange}`);

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
  }, [currentUser?.id, dateRange]);

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

  const getComparisonText = () => {
    switch (dateRange) {
      case "today":
        return "from yesterday";
      case "this-week":
        return "from last week";
      case "this-month":
        return "from last month";
      case "all-time":
        return "from last year";
      default:
        return "from last period";
    }
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
            <span>{getComparisonText()}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {/* Stats Grid */}
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
          icon={TrendingUp}
          growth={stats.profitGrowth}
          format="currency"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <StatCard
                  title="Total Orders"
                  value={stats.totalOrders}
                  icon={ShoppingCart}
                  growth={stats.ordersGrowth}
                />
              </div>
            </TooltipTrigger>
            {stats.orderBreakdown && (
              <TooltipContent
                side="bottom"
                className="bg-white border border-stone-200 shadow-lg p-3 text-stone-900"
              >
                <div className="space-y-1.5 text-xs min-w-[200px]">
                  <div className="font-semibold mb-2 text-sm">
                    Order Status Breakdown
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Confirmed:</span>
                    <span className="font-semibold text-green-600">
                      {stats.orderBreakdown.confirmed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Processing:</span>
                    <span className="font-semibold text-blue-600">
                      {stats.orderBreakdown.processing}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Shipped:</span>
                    <span className="font-semibold text-purple-600">
                      {stats.orderBreakdown.shipped}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Delivered:</span>
                    <span className="font-semibold text-emerald-600">
                      {stats.orderBreakdown.delivered}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Pending:</span>
                    <span className="font-semibold text-yellow-600">
                      {stats.orderBreakdown.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-600">Cancelled:</span>
                    <span className="font-semibold text-red-600">
                      {stats.orderBreakdown.cancelled}
                    </span>
                  </div>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          growth={stats.customersGrowth}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          growth={stats.productsGrowth}
        />
      </div>
    </div>
  );
}
