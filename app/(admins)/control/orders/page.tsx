import { Metadata } from "next";
import { OrdersHeaderClient } from "@/components/admin/orders/orders-header-client";
import { OrdersDataTable } from "@/components/admin/orders/comps/orders-data-table";

export const metadata: Metadata = {
  title: "Orders",
  description: "View and manage orders",
};

export default function OrdersPage() {
  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">Orders</h2>
        <OrdersHeaderClient />
      </div>

      <OrdersDataTable />
    </div>
  );
}
