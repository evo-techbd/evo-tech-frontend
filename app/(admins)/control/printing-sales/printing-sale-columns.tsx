"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export interface PrintingSaleType {
    _id: string;
    saleNumber: string;
    customerName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    country: string;
    notes?: string;
    items: {
        productName: string;
        unitPrice: number;
        quantity: number;
        price: number;
    }[];
    totalPrice: number;
    paymentStatus: "pending" | "paid" | "cancelled";
    createdBy?: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export const printingSaleColumns: ColumnDef<PrintingSaleType>[] = [
    {
        accessorKey: "saleNumber",
        header: () => <div>Sale ID</div>,
        cell: ({ row }) => {
            const saleNumber = row.getValue("saleNumber") as string;
            const id = row.original._id;
            return (
                <Link
                    href={`/control/printing-sales/${id}`}
                    className="text-primary text-xs font-medium hover:underline hover:underline-offset-2"
                >
                    {saleNumber}
                </Link>
            );
        },
    },
    {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
            const { customerName, phone } = row.original;
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-[0.625rem] leading-tight whitespace-nowrap">
                        {customerName}
                    </span>
                    <span className="text-[0.625rem] text-muted-foreground whitespace-nowrap">
                        {phone}
                    </span>
                </div>
            );
        },
    },
    {
        id: "items",
        header: "Items",
        cell: ({ row }) => {
            const count = row.original.items?.length || 0;
            return (
                <div className="text-xs whitespace-nowrap">
                    {count} item{count !== 1 ? "s" : ""}
                </div>
            );
        },
    },
    {
        accessorKey: "totalPrice",
        header: () => <div>Amount</div>,
        cell: ({ row }) => {
            const amount = row.getValue("totalPrice") as number;
            const formatted = `BDT ${new Intl.NumberFormat("en-US", {
                minimumIntegerDigits: 1,
                maximumFractionDigits: 0,
            }).format(amount)}`;

            return (
                <div className="text-xs font-medium whitespace-nowrap">{formatted}</div>
            );
        },
    },
    {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => {
            const status = row.getValue("paymentStatus") as string;

            const getBadgeVariant = (status: string) => {
                switch (status) {
                    case "paid":
                        return "success";
                    case "pending":
                        return "warning";
                    case "cancelled":
                        return "failed";
                    default:
                        return "default";
                }
            };

            return (
                <Badge
                    variant={getBadgeVariant(status) as any}
                    className="capitalize whitespace-nowrap"
                >
                    {status || "N/A"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as string;
            return (
                <div className="text-xs whitespace-nowrap">
                    {date ? format(new Date(date), "dd MMM yyyy") : "N/A"}
                </div>
            );
        },
    },
];
