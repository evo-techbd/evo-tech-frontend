"use client";

import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ProductsCountProps = {
  isLoading: boolean;
  totalCount: number;
};

export function ProductsCount({ isLoading, totalCount }: ProductsCountProps) {
  if (isLoading) {
    return (
      <Badge variant="outline" className="text-xs px-3 py-1 animate-pulse">
        <Package className="w-3 h-3 mr-1.5" />
        <span>Loading...</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 font-medium"
    >
      <Package className="w-3 h-3 mr-1.5" />
      <span>
        {totalCount.toLocaleString()}{" "}
        {totalCount === 1 ? "Product" : "Products"}
      </span>
    </Badge>
  );
}
