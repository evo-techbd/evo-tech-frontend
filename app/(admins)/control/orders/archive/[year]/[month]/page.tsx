import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OrdersHeaderClient } from "@/components/admin/orders/orders-header-client";
import { OrdersDataTable } from "@/components/admin/orders/comps/orders-data-table";

export const metadata: Metadata = {
  title: "Order Archive",
  description: "Delivered orders for the selected month",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface ArchiveMonthPageProps {
  params: Promise<{ year: string; month: string }>;
}

export default async function ArchiveMonthPage({
  params,
}: ArchiveMonthPageProps) {
  const { year, month } = await params;
  const yearNum = Number(year);
  const monthNum = Number(month);

  if (
    !Number.isInteger(yearNum) ||
    !Number.isInteger(monthNum) ||
    monthNum < 1 ||
    monthNum > 12 ||
    yearNum < 2000 ||
    yearNum > 2100
  ) {
    notFound();
  }

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/control/orders/archive"
            className="text-stone-400 hover:text-stone-600 transition"
            aria-label="Back to archive"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
            Order Archive — {MONTH_NAMES[monthNum - 1]} {yearNum}
          </h2>
        </div>
        <OrdersHeaderClient
          basePath={`/control/orders/archive/${yearNum}/${monthNum}`}
          archiveContext={{ year: yearNum, month: monthNum }}
        />
      </div>

      <OrdersDataTable archiveMode year={yearNum} month={monthNum} />
    </div>
  );
}
