"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "@/utils/axios/axios";
import { useSearchParamsState } from "@/hooks/use-search-params-state";

interface MonthSummary {
  month: number;
  monthName: string;
  saleCount: number;
  totalAmount: number;
}

interface ArchiveSummary {
  year: number;
  months: MonthSummary[];
  totals: { saleCount: number; totalAmount: number };
}

const formatCurrency = (amount: number) =>
  `BDT ${new Intl.NumberFormat("en-US", {
    minimumIntegerDigits: 1,
    maximumFractionDigits: 0,
  }).format(amount || 0)}`;

const PrintingSaleArchiveLanding = () => {
  const { updateSearchParams, getParam } = useSearchParamsState({
    basePath: "/control/printing-sales/archive",
  });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [years, setYears] = useState<number[]>([]);
  const [yearsLoaded, setYearsLoaded] = useState(false);
  const [summary, setSummary] = useState<ArchiveSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const yearParam = getParam("year");
  const selectedYear = yearParam ? Number(yearParam) : undefined;
  const effectiveYear = selectedYear ?? years[0] ?? currentYear;

  // Fetch the list of years that actually have paid sales, once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/admin/printing-sales/archive/years");
        const list: number[] = Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        if (!cancelled) setYears(list);
      } catch {
        if (!cancelled) setYears([]);
      } finally {
        if (!cancelled) setYearsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch the 12-month summary once the effective year is known.
  useEffect(() => {
    if (!yearsLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await axios.get("/admin/printing-sales/archive/summary", {
          params: { year: effectiveYear },
        });
        if (!cancelled) setSummary(res.data?.data ?? null);
      } catch {
        if (!cancelled) {
          setSummary(null);
          setError("Failed to load the sales archive.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveYear, yearsLoaded]);

  const yearOptions = useMemo(() => {
    const set = new Set<number>(years);
    set.add(currentYear); // always selectable, even with 0 sales so far
    return Array.from(set).sort((a, b) => b - a);
  }, [years, currentYear]);

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/control/printing-sales"
            className="text-stone-400 hover:text-stone-600 transition"
            aria-label="Back to 3D printing sales"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
              3D Printing Sales Archive
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Paid sales, grouped by the month they were created
            </p>
          </div>
        </div>

        <Select
          value={String(effectiveYear)}
          onValueChange={(v) => updateSearchParams({ year: v })}
        >
          <SelectTrigger className="w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((yr) => (
              <SelectItem key={yr} value={String(yr)}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300 rounded-full" />
        </div>
      ) : error ? (
        <div className="h-40 flex items-center justify-center text-sm text-stone-400">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(summary?.months || []).map((m) => {
              const isCurrent =
                effectiveYear === currentYear && m.month === currentMonth;
              const hasSales = m.saleCount > 0;
              return (
                <Link
                  key={m.month}
                  href={`/control/printing-sales/archive/${effectiveYear}/${m.month}`}
                  className="block"
                >
                  <Card
                    className={`border-0 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 ${hasSales ? "" : "opacity-60"}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-stone-900">
                          {m.monthName}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-3">
                        <Printer className="size-3.5" />
                        {m.saleCount} sale{m.saleCount === 1 ? "" : "s"}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-stone-900">
                          {formatCurrency(m.totalAmount)}
                        </p>
                        <p className="text-[11px] text-stone-400">Amount Paid</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {summary && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-stone-400">
                    {effectiveYear} Total Sales
                  </p>
                  <p className="text-base font-bold text-stone-900">
                    {summary.totals.saleCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">
                    {effectiveYear} Amount Paid
                  </p>
                  <p className="text-base font-bold text-stone-900">
                    {formatCurrency(summary.totals.totalAmount)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export { PrintingSaleArchiveLanding };
