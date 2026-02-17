"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export function AdminSalesChart() {
  const currentUser = getCurrentUser();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);

  const fetchSalesData = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const response = await axios.get(
        `/dashboard/sales-data?period=${timeRange}`
      );

      if (response.data.success) {
        const apiData = response.data.data || [];
        setSalesData(apiData);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]); // Add timeRange, rely on stable currentUser check from closure

  useEffect(() => {
    if (!currentUser) return;
    
    fetchSalesData();

    // Auto-refresh every 10 minutes (sales data doesn't need frequent updates)
    const interval = setInterval(fetchSalesData, 600000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSalesData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, fetchSalesData]);

  const totalSales = salesData.reduce(
    (sum: number, data: SalesData) => sum + data.sales,
    0
  );
  const totalOrders = salesData.reduce(
    (sum: number, data: SalesData) => sum + data.orders,
    0
  );

  const renderChart = () => {
    if (chartType === "line") {
      return (
        <LineChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="sales" orientation="left" />
          <YAxis yAxisId="orders" orientation="right" />
          <Tooltip
            formatter={(value: number, name: string) => [
              name === "sales" ? `BDT ${value.toLocaleString()}` : value,
              name === "sales" ? "Sales" : "Orders",
            ]}
          />
          <Line
            yAxisId="sales"
            type="monotone"
            dataKey="sales"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="orders"
            type="monotone"
            dataKey="orders"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      );
    } else {
      return (
        <BarChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="sales" orientation="left" />
          <YAxis yAxisId="orders" orientation="right" />
          <Tooltip
            formatter={(value: number, name: string) => [
              name === "sales" ? `BDT ${value.toLocaleString()}` : value,
              name === "sales" ? "Sales" : "Orders",
            ]}
          />
          <Bar yAxisId="sales" dataKey="sales" fill="#8884d8" />
          <Bar yAxisId="orders" dataKey="orders" fill="#82ca9d" />
        </BarChart>
      );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sales Analytics</CardTitle>
          <div className="flex gap-2">
            <Select
              value={chartType}
              onValueChange={(value: "line" | "bar") => setChartType(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={timeRange}
              onValueChange={(value: "7d" | "30d" | "90d") =>
                setTimeRange(value)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">BDT {totalSales.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
