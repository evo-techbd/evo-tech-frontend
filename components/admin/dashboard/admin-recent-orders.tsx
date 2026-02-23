"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";
import { Eye } from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: string;
}

export function AdminRecentOrders() {
  const currentUser = getCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchRecentOrders = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/dashboard/recent-orders");

      if (response.data.success) {
        const apiOrders = response.data.data || [];

        // Transform backend data to match frontend interface
        const transformedOrders = apiOrders.map((order: any) => ({
          id: order.id || order._id,
          customerName: order.customer || "Unknown",
          customerEmail: order.customerEmail || "",
          total: order.total || 0,
          status: order.status || "pending",
          createdAt: order.createdAt,
        }));

        setOrders(transformedOrders);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (error: any) {
      console.error(
        "❌ Error fetching orders:",
        error.response?.data?.message || error.message
      );
      setError(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

    useEffect(() => {
    fetchRecentOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchRecentOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "processing":
        return "bg-cyan-100 text-cyan-600 border-cyan-200";
      case "shipped":
        return "bg-purple-100 text-purple-600 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-600 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return `BDT ${new Intl.NumberFormat("en-US", {
      minimumIntegerDigits: 1,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
        <Link
          href="/control/orders"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={fetchRecentOrders}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No recent orders found</p>
            <p className="text-xs mt-1">
              Orders will appear here once customers place them
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{order.id}</span>
                    <Badge
                      className={`text-xs ${getStatusColor(order.status)}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.customerName} • {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">
                    {formatCurrency(order.total)}
                  </span>
                  <Link
                    href={`/control/orders/${order.id}`}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
