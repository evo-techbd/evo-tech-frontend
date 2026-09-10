import { Metadata } from "next";
import { OrderArchiveLanding } from "@/components/admin/orders/archive/order-archive-landing";

export const metadata: Metadata = {
  title: "Order Archive",
  description: "Delivered orders grouped by month",
};

export default function OrderArchivePage() {
  return <OrderArchiveLanding />;
}
