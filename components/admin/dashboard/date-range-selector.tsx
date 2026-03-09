"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

export type DateRangeType = "today" | "this-week" | "this-month" | "all-time";

interface DateRangeSelectorProps {
  value: DateRangeType;
  onChange: (value: DateRangeType) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const ranges = [
    {
      value: "today" as DateRangeType,
      label: "Today",
      description: "vs Yesterday",
    },
    {
      value: "this-week" as DateRangeType,
      label: "This Week",
      description: "vs Last Week",
    },
    {
      value: "this-month" as DateRangeType,
      label: "This Month",
      description: "vs Last Month",
    },
    {
      value: "all-time" as DateRangeType,
      label: "All Time",
      description: "Total Stats",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-stone-600" />
      <Select
        value={value}
        onValueChange={(val) => onChange(val as DateRangeType)}
      >
        <SelectTrigger className="w-[180px] bg-white border-stone-200">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {ranges.map((range) => (
            <SelectItem key={range.value} value={range.value}>
              <div className="flex flex-col">
                <span className="font-medium">{range.label}</span>
                <span className="text-xs text-stone-500">
                  {range.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
