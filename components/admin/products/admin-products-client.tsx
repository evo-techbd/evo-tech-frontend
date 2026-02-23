"use client";

import Link from "next/link";
import { useProductsData } from "@/hooks/use-products-data";
import { ProductsCount } from "@/components/admin/products/comps/products-count";
import { ProductHeaderClient } from "@/components/admin/products/product-header-client";
import { ProductsDataTable } from "@/components/admin/products/comps/products-data-table";

const AdminProductsClient = () => {
  const {
    products,
    isLoading,
    error,
    refetch,
    paginationData,
    serverSidePagination,
  } = useProductsData();

  const totalItems = paginationData?.total_items ?? products.length;

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
              Products
            </h2>
            <ProductsCount isLoading={isLoading} totalCount={totalItems} />
          </div>
          <Link
            href="/control/products/create"
            className="px-7 py-2 bg-stone-800 font-[500] text-white rounded text-xs md:text-sm hover:bg-stone-900"
          >
            Add New Product
          </Link>
        </div>
        <ProductHeaderClient />
      </div>

      <ProductsDataTable
        products={products}
        isLoading={isLoading}
        error={error}
        refetch={refetch}
        serverSidePagination={serverSidePagination}
      />
    </div>
  );
};

export default AdminProductsClient;
