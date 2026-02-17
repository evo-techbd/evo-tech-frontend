"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/utils/cookies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, PackageSearch } from "lucide-react";
import axiosErrorLogger from "@/components/error/axios_error";
import axios from "@/utils/axios/axios";

export type StockNotification = {
  _id: string;
  title: string;
  message: string;
  type: "low_stock" | "out_of_stock";
  severity: "info" | "warning" | "critical";
  product?: string;
  productName?: string;
  productSlug?: string;
  currentStock?: number;
  threshold?: number;
  status: "open" | "resolved";
  isRead: boolean;
  createdAt: string;
};

const severityStyles: Record<StockNotification["severity"], string> = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

export const AdminStockAlerts = () => {
  const currentUser = getCurrentUser();
  const [notifications, setNotifications] = useState<StockNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get("/notifications/stock", {
        params: {
          status: "open",
          limit: 5,
        },
      });

      if (response.data?.success) {
        setNotifications(response.data.data ?? []);
      }
    } catch (error) {
      axiosErrorLogger({ error });
      setNotifications([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove currentUser from dependencies to prevent infinite loop

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNotifications]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      if (!currentUser) return;
      try {
        await axios.patch(`/notifications/${id}/read`);
        setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      } catch (error) {
        axiosErrorLogger({ error });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((skeleton) => (
            <div
              key={`notification-skeleton-${skeleton}`}
              className="h-16 animate-pulse rounded-md bg-stone-200"
            ></div>
          ))}
        </div>
      );
    }

    if (!notifications.length) {
      return (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-stone-500">
          <PackageSearch className="h-10 w-10 text-stone-400" />
          <p>No low stock alerts right now.</p>
          <p className="text-xs">
            You’ll see alerts here when items dip below their thresholds.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`rounded-md border px-4 py-3 ${
              severityStyles[notification.severity]
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{notification.title}</p>
                <p className="text-xs mt-1 leading-5">{notification.message}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {notification.productSlug && (
                    <Link
                      href={`/items/${notification.productSlug}`}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      View product page
                    </Link>
                  )}
                  {typeof notification.currentStock === "number" && (
                    <span className="text-stone-600">
                      Current stock: {notification.currentStock}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-stone-700 hover:text-stone-900"
                onClick={() => handleMarkRead(notification._id)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border border-red-100 bg-white/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-stone-900">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>{renderBody()}</CardContent>
    </Card>
  );
};
