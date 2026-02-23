"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { currencyFormatBDT } from "@/lib/all_utils";

export type SalesProfitTransactionType = {
  _id: string;
  date: string;
  productName: string;
  sellingPrice: number;
  buyingPrice: number;
  quantity: number;
  profit: number;
};

export const getSalesProfitColumns = (): ColumnDef<SalesProfitTransactionType>[] => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.date), "dd MMM yyyy"),
  },
  {
    accessorKey: "productName",
    header: "Product Name",
    cell: ({ row }) => (
      <span className="font-medium max-w-[200px] truncate block" title={row.original.productName}>
        {row.original.productName}
      </span>
    ),
  },
  {
    accessorKey: "sellingPrice",
    header: "Selling Price",
    cell: ({ row }) => currencyFormatBDT(row.original.sellingPrice),
  },
  {
    accessorKey: "buyingPrice",
    header: "Buying Price",
    cell: ({ row }) => currencyFormatBDT(row.original.buyingPrice),
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => row.original.quantity,
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => (
      <span className={`font-bold ${row.original.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
        {currencyFormatBDT(row.original.profit)}
      </span>
    ),
  },
];
