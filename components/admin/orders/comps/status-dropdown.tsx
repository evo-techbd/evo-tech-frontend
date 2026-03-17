"use client";

import { useState } from "react";
import { toast } from "sonner";
import axios from "@/utils/axios/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface StatusDropdownProps {
  orderId: string;
  type: "orderStatus" | "paymentStatus";
  currentStatus: string;
  onDataChange?: () => void;
}

const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Assigned to Rider" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export function StatusDropdown({
  orderId,
  type,
  currentStatus,
  onDataChange,
}: StatusDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getBadgeVariant = (status: string) => {
    if (type === "orderStatus") {
      switch (status) {
        case "pending":
          return "customdefault";
        case "confirmed":
          return "confirmed";
        case "processing":
          return "processing";
        case "shipped":
          return "shipped";
        case "delivered":
          return "delivered";
        case "cancelled":
          return "failed";
        default:
          return "customdefault";
      }
    } else {
      switch (status) {
        case "paid":
          return "success";
        case "partial":
          return "warning";
        case "pending":
          return "failed";
        case "refunded":
          return "warning";
        case "failed":
          return "failed";
        default:
          return "default";
      }
    }
  };

  const options = type === "orderStatus" ? ORDER_STATUSES : PAYMENT_STATUSES;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsLoading(true);
    try {
      const updateData = { [type]: newStatus };
      
      const response = await axios.put(`/api/admin/orders/${orderId}`, updateData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        toast.success(
          `${type === "orderStatus" ? "Order" : "Payment"} status updated to ${newStatus.replace("_", " ")}`
        );
        if (onDataChange) {
          onDataChange();
        }
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Status update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update status. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={isLoading}
      >
        <SelectTrigger className="h-7 w-fit gap-1 items-center px-1.5 py-0 border-0 focus:ring-0 shadow-none bg-transparent hover:bg-stone-100 transition-colors">
          <Badge
            variant={getBadgeVariant(currentStatus) as any}
            className="capitalize whitespace-nowrap px-1.5 py-0.5 cursor-pointer pointer-events-none"
          >
            {currentStatus === "shipped" ? "Assigned to Rider" : currentStatus?.replace("_", " ") || "N/A"}
          </Badge>
        </SelectTrigger>
        <SelectContent align="center">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-xs"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
