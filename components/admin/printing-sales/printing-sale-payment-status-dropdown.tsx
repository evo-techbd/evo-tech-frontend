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
import { getPaymentStatusVariant } from "@/utils/payment-status";

const PAYMENT_STATUSES = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "cancelled", label: "Cancelled" },
];

interface PrintingSalePaymentStatusDropdownProps {
    saleId: string;
    currentStatus: string;
    onDataChange?: () => void | Promise<void>;
}

export function PrintingSalePaymentStatusDropdown({
    saleId,
    currentStatus,
    onDataChange,
}: PrintingSalePaymentStatusDropdownProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) return;

        setIsLoading(true);
        try {
            await axios.patch(`/admin/printing-sales/${saleId}/payment-status`, {
                paymentStatus: newStatus,
            });
            toast.success(`Payment status updated to ${newStatus}`);
            if (onDataChange) {
                await onDataChange();
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Failed to update payment status",
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
                        variant={getPaymentStatusVariant(currentStatus)}
                        className="capitalize whitespace-nowrap px-1.5 py-0.5 cursor-pointer pointer-events-none"
                    >
                        {currentStatus || "N/A"}
                    </Badge>
                </SelectTrigger>
                <SelectContent align="center">
                    {PAYMENT_STATUSES.map((option) => (
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
