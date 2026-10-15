import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PrintingSalesList } from "@/components/admin/printing-sales/printing-sales-list";

export const metadata: Metadata = {
  title: "3D Printing Sales Archive",
  description: "Paid 3D printing sales for the selected month",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface ArchiveMonthPageProps {
  params: Promise<{ year: string; month: string }>;
}

export default async function PrintingSaleArchiveMonthPage({
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
      <div className="flex items-center gap-2">
        <Link
          href={`/control/printing-sales/archive?year=${yearNum}`}
          className="text-stone-400 hover:text-stone-600 transition"
          aria-label="Back to archive"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
          3D Printing Sales Archive — {MONTH_NAMES[monthNum - 1]} {yearNum}
        </h2>
      </div>

      <PrintingSalesList archive={{ year: yearNum, month: monthNum }} />
    </div>
  );
}
