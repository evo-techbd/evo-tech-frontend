"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import OrderTableRowActions from "@/components/admin/orders/comps/order-table-row-actions";

export const ordersColumns: ColumnDef<OrderWithItemsType>[] = [
  {
    accessorKey: "orderNumber",
    header: () => <div>Order ID</div>,
    cell: ({ row }) => {
      const orderId = row.getValue("orderNumber") as string;
      const original: any = row.original;
      const orderIdFallback = original._id || original.orderid;
      const displayId = orderId || orderIdFallback;
      const viewed = row.original.viewed as boolean;
      return (
        <div>
          <Link
            href={`/control/orders/${original._id || original.orderid}`}
            className={`text-primary text-xs hover:underline hover:underline-offset-2 flex items-center ${
              !viewed ? "font-extrabold" : "font-medium"
            }`}
          >
            {displayId}
            {!viewed && (
              <div className="ml-1.5 size-1.5 bg-emerald-500/85 rounded-full"></div>
            )}
          </Link>
        </div>
      );
    },
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const rowdata = row.original;
      const firstName = rowdata.firstname || "";
      const lastName = rowdata.lastname || "";
      const email = rowdata.email || "";

      return (
        <div className="flex flex-col">
          <span className="font-medium text-[0.625rem] leading-tight whitespace-nowrap">
            {`Name: ${firstName}${lastName ? ` ${lastName}` : ""}`}
          </span>
          {email ? (
            <span className="text-[0.625rem] text-muted-foreground whitespace-nowrap">
              Email: {email}
            </span>
          ) : (
            <span className="text-[0.625rem] text-muted-foreground">
              Email: --
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "totalPayable",
    header: () => <div>Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalPayable") as string) || 0;
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
    accessorKey: "orderStatus",
    header: "Order Status",
    cell: ({ row }) => {
      const status = row.getValue("orderStatus") as string;

      // Define badge styles based on status
      const getBadgeVariant = (status: string) => {
        switch (status) {
          case "pending":
            return "customdefault";
          case "confirmed":
            return "inprogress";
          case "processing":
            return "inprogress";
          case "shipped":
            return "warning";
          case "delivered":
            return "success";
          case "cancelled":
            return "failed";
          default:
            return "customdefault";
        }
      };

      return (
        <Badge
          variant={getBadgeVariant(status) as any}
          className={`capitalize whitespace-nowrap`}
        >
          {status?.replaceAll("_", " ") || "N/A"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => {
      const method = row.getValue("paymentMethod") as string;
      return (
        <div className="capitalize text-xs whitespace-nowrap">
          {method?.replaceAll("_", " ") || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "shippingType",
    header: () => <div>Shipping Type</div>,
    cell: ({ row }) => {
      const shippingType = row.getValue("shippingType") as string;

      return (
        <div className="text-xs capitalize whitespace-nowrap">
          {shippingType?.replaceAll("_", " ") || "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;

      // Define badge styles based on status
      const getBadgeVariant = (status: string) => {
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
      };

      return (
        <Badge
          variant={getBadgeVariant(status) as any}
          className="capitalize whitespace-nowrap"
        >
          {status?.replace("_", " ") || "N/A"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <OrderTableRowActions row={row} />;
    },
  },
];
