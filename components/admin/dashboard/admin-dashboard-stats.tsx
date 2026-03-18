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
  Printer,
  Store,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";
import { DateRangeSelector, DateRangeType } from "./date-range-selector";
import Link from "next/link";

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
  revenueBreakdown?: {
    orderRevenue: number;
    printingRevenue: number;
    orderCount: number;
    printingSalesCount: number;
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
    return `৳${new Intl.NumberFormat("en-US", {
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
        return "vs yesterday";
      case "this-week":
        return "vs last week";
      case "this-month":
        return "vs last month";
      case "all-time":
        return "vs last year";
      default:
        return "vs last period";
    }
  };

  const GrowthBadge = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${isPositive
            ? "text-emerald-700 bg-emerald-50"
            : "text-red-700 bg-red-50"
          }`}
      >
        {isPositive ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {Math.abs(value)}%
      </span>
    );
  };

  // Stat card configs with unique accent colors
  const statCards = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      icon: DollarSign,
      growth: stats.revenueGrowth,
      format: "currency" as const,
      accent: "from-emerald-500/15 to-emerald-500/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Profit",
      value: stats.totalProfit,
      icon: TrendingUp,
      growth: stats.profitGrowth,
      format: "currency" as const,
      accent: "from-blue-500/15 to-blue-500/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      growth: stats.ordersGrowth,
      format: "number" as const,
      accent: "from-violet-500/15 to-violet-500/5",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
      hasTooltip: true,
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: Users,
      growth: stats.customersGrowth,
      format: "number" as const,
      accent: "from-amber-500/15 to-amber-500/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      title: "Active Products",
      value: stats.totalProducts,
      icon: Package,
      growth: stats.productsGrowth,
      format: "number" as const,
      accent: "from-rose-500/15 to-rose-500/5",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600",
    },
  ];

  const orderStatusColors: Record<string, { bg: string; text: string; dot: string }> = {
    confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    processing: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    shipped: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
    delivered: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  };

  return (
    <div className="space-y-5">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      {/* Primary Stats: Revenue & Profit side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statCards.slice(0, 2).map((card) => {
          const formattedValue =
            card.format === "currency"
              ? formatCurrency(card.value)
              : formatNumber(card.value);
          return (
            <Card
              key={card.title}
              className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.accent} pointer-events-none`}
              />
              <CardContent className="relative p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-stone-500">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-stone-900">
                      {loading ? (
                        <span className="inline-block w-32 h-8 bg-stone-100 animate-pulse rounded" />
                      ) : (
                        formattedValue
                      )}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <GrowthBadge value={card.growth} />
                      <span className="text-xs text-stone-400">
                        {getComparisonText()}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-center w-11 h-11 rounded-xl ${card.iconBg}`}
                  >
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* View Profit Details Button */}
      <div className="flex justify-end">
        <Link href="/control/dashboard/profit-breakdown">
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50">
            <TrendingUp className="h-3.5 w-3.5" />
            View Monthly Profit Details
          </button>
        </Link>
      </div>

      {/* Secondary Stats: Orders, Customers, Products */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.slice(2).map((card) => {
          const formattedValue =
            card.format === "currency"
              ? formatCurrency(card.value)
              : formatNumber(card.value);

          const cardContent = (
            <Card
              key={card.title}
              className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow cursor-default"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.accent} pointer-events-none`}
              />
              <CardContent className="relative p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-stone-900">
                      {loading ? (
                        <span className="inline-block w-16 h-7 bg-stone-100 animate-pulse rounded" />
                      ) : (
                        formattedValue
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <GrowthBadge value={card.growth} />
                      <span className="text-xs text-stone-400">
                        {getComparisonText()}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl ${card.iconBg}`}
                  >
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          // Wrap the Orders card in a tooltip with order breakdown
          if (card.hasTooltip && stats.orderBreakdown) {
            return (
              <TooltipProvider key={card.title}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>{cardContent}</div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-white border border-stone-200 shadow-xl rounded-xl p-4 text-stone-900"
                  >
                    <div className="space-y-2 min-w-[220px]">
                      <p className="font-semibold text-sm mb-3">
                        Order Status Breakdown
                      </p>
                      {Object.entries(stats.orderBreakdown).map(([status, count]) => {
                        const colors = orderStatusColors[status] || {
                          bg: "bg-stone-50",
                          text: "text-stone-700",
                          dot: "bg-stone-500",
                        };
                        return (
                          <div
                            key={status}
                            className="flex justify-between items-center"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${colors.dot}`}
                              />
                              <span className="text-xs capitalize text-stone-600">
                                {status === 'shipped' ? 'Assigned to Rider' : status}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-semibold ${colors.text} px-2 py-0.5 rounded-md ${colors.bg}`}
                            >
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return <div key={card.title}>{cardContent}</div>;
        })}
      </div>

      {/* Revenue Breakdown: Store Orders vs 3D Printing Sales */}
      {stats.revenueBreakdown && stats.totalRevenue > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-4">
              Revenue Sources
            </p>

            {/* Proportional Bar */}
            <div className="h-3 rounded-full overflow-hidden bg-stone-100 flex mb-4">
              {stats.revenueBreakdown.orderRevenue > 0 && (
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                  style={{
                    width: `${(stats.revenueBreakdown.orderRevenue / stats.totalRevenue) * 100}%`,
                  }}
                />
              )}
              {stats.revenueBreakdown.printingRevenue > 0 && (
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
                  style={{
                    width: `${(stats.revenueBreakdown.printingRevenue / stats.totalRevenue) * 100}%`,
                  }}
                />
              )}
            </div>

            {/* Source Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50/60 p-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10">
                  <Store className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 leading-none mb-1">Store Orders</p>
                  <p className="text-sm font-bold text-stone-900 leading-none">
                    {formatCurrency(stats.revenueBreakdown.orderRevenue)}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {stats.revenueBreakdown.orderCount} orders
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-violet-50/60 p-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500/10">
                  <Printer className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 leading-none mb-1">3D Printing</p>
                  <p className="text-sm font-bold text-stone-900 leading-none">
                    {formatCurrency(stats.revenueBreakdown.printingRevenue)}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {stats.revenueBreakdown.printingSalesCount} sales
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
