"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParamsState } from "@/hooks/use-search-params-state";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthSummary {
  month: number;
  monthName: string;
  orderCount: number;
  totalAmountPaid: number;
  totalPayable: number;
}

interface ArchiveSummary {
  year: number;
  months: MonthSummary[];
  totals: { orderCount: number; totalAmountPaid: number; totalPayable: number };
}

const formatCurrency = (amount: number) =>
  `BDT ${new Intl.NumberFormat("en-US", {
    minimumIntegerDigits: 1,
    maximumFractionDigits: 0,
  }).format(amount || 0)}`;

const OrderArchiveLanding = () => {
  const { updateSearchParams, getParam } = useSearchParamsState({
    basePath: "/control/orders/archive",
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

  // Fetch the list of years that actually have delivered orders, once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/orders/archive/years", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load years");
        const payload = await res.json();
        const list: number[] = Array.isArray(payload.data) ? payload.data : [];
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
        const res = await fetch(
          `/api/admin/orders/archive/summary?year=${effectiveYear}`,
          { method: "GET", credentials: "include" },
        );
        if (!res.ok) throw new Error("Failed to load archive summary");
        const payload = await res.json();
        if (!cancelled) setSummary(payload.data ?? null);
      } catch {
        if (!cancelled) {
          setSummary(null);
          setError("Failed to load the order archive.");
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
    set.add(currentYear); // always selectable, even with 0 orders so far
    return Array.from(set).sort((a, b) => b - a);
  }, [years, currentYear]);

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Link
              href="/control/orders"
              className="text-stone-400 hover:text-stone-600 transition"
              aria-label="Back to orders"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
                Order Archive
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Delivered orders, grouped by the month they were ordered
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
              const hasOrders = m.orderCount > 0;
              return (
                <Link
                  key={m.month}
                  href={`/control/orders/archive/${effectiveYear}/${m.month}`}
                  className="block"
                >
                  <Card
                    className={`border-0 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 ${hasOrders ? "" : "opacity-60"}`}
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
                        <PackageCheck className="size-3.5" />
                        {m.orderCount} order{m.orderCount === 1 ? "" : "s"}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-stone-900">
                          {formatCurrency(m.totalAmountPaid)}
                        </p>
                        <p className="text-[11px] text-stone-400">Amount Paid</p>
                      </div>
                      <div className="mt-1.5">
                        <p className="text-xs font-medium text-stone-600">
                          {formatCurrency(m.totalPayable)}
                        </p>
                        <p className="text-[11px] text-stone-400">Total Payable</p>
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
                    {effectiveYear} Total Orders
                  </p>
                  <p className="text-base font-bold text-stone-900">
                    {summary.totals.orderCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">
                    {effectiveYear} Amount Paid
                  </p>
                  <p className="text-base font-bold text-stone-900">
                    {formatCurrency(summary.totals.totalAmountPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">
                    {effectiveYear} Total Payable
                  </p>
                  <p className="text-base font-bold text-stone-900">
                    {formatCurrency(summary.totals.totalPayable)}
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

export { OrderArchiveLanding };
