"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Package } from "lucide-react";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";

interface TopProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  sales: number;
  revenue: number;
  category: string;
  inStock: number;
}

export function AdminTopProducts() {
  const currentUser = getCurrentUser();
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopProducts = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const response = await axios.get("/dashboard/top-products");

      if (response.data.success) {
        const apiProducts = response.data.data || [];
        setProducts(apiProducts);
      }
    } catch (error) {
      console.error("Error fetching top products:", error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

    useEffect(() => {
    fetchTopProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTopProducts]);

  const formatCurrency = (amount: number) => {
    return `BDT ${new Intl.NumberFormat("en-US", {
      minimumIntegerDigits: 1,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
        <Link
          href="/control/products"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                  {index + 1}
                </div>

                <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
                  <Package className="w-6 h-6 text-gray-400 absolute inset-0 m-auto" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/control/products/${product.id}`}
                      className="font-medium text-sm hover:text-blue-600 truncate"
                    >
                      {product.name}
                    </Link>
                    {product.inStock < 10 && (
                      <Badge variant="destructive" className="text-xs">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {product.category} • {product.inStock} in stock
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    {product.sales} sold
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
