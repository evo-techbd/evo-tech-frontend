import { Metadata } from "next";
import { PrintingSaleArchiveLanding } from "@/components/admin/printing-sales/printing-sale-archive-landing";

export const metadata: Metadata = {
  title: "3D Printing Sales Archive",
  description: "Paid 3D printing sales grouped by month",
};

export default function PrintingSaleArchivePage() {
  return <PrintingSaleArchiveLanding />;
}
