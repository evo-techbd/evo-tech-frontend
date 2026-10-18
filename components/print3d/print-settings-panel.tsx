"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/all_utils";
import { LAYER_HEIGHT_LABELS } from "@/lib/print3d/pricing";
import { ModelUnit, PrintPricing, PrintSettings } from "@/lib/print3d/types";
import { FaMinus, FaPlus } from "react-icons/fa";

const UNITS: { value: ModelUnit; label: string }[] = [
  { value: "mm", label: "mm" },
  { value: "cm", label: "cm" },
  { value: "inch", label: "inch" },
];

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="block text-xs font-semibold text-stone-700 mb-1.5">
    {children}
  </span>
);

const segmentClass = (active: boolean) =>
  cn(
    "flex-1 px-2 py-2 rounded-lg text-xs font-medium border transition-colors",
    active
      ? "bg-brand-600 border-brand-600 text-white"
      : "bg-white border-stone-200 text-stone-700 hover:border-brand-300",
  );

interface PrintSettingsPanelProps {
  pricing: PrintPricing;
  settings: PrintSettings;
  onChange: (patch: Partial<PrintSettings>) => void;
}

export function PrintSettingsPanel({
  pricing,
  settings,
  onChange,
}: PrintSettingsPanelProps) {
  const material =
    pricing.materials.find((m) => m.name === settings.material) ??
    pricing.materials[0];

  const handleMaterialChange = (name: string) => {
    const next = pricing.materials.find((m) => m.name === name);
    if (!next) return;
    onChange({
      material: next.name,
      // Keep the color if the new material offers it
      color: next.colors.includes(settings.color)
        ? settings.color
        : next.colors[0],
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Material</FieldLabel>
        <Select value={material.name} onValueChange={handleMaterialChange}>
          <SelectTrigger className="h-10 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pricing.materials.map((m) => (
              <SelectItem key={m.name} value={m.name} className="text-sm">
                {m.name}
                {m.fullName ? ` — ${m.fullName}` : ""} (৳{m.pricePerGram}/g)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <FieldLabel>Color: {settings.color}</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {material.colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ color })}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                settings.color === color
                  ? "bg-brand-50 border-brand-500 text-brand-700"
                  : "bg-white border-stone-200 text-stone-600 hover:border-brand-300",
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>Quality (layer height)</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {pricing.layerHeightOptions.map((height) => (
            <button
              key={height}
              type="button"
              onClick={() => onChange({ layerHeight: height })}
              className={segmentClass(settings.layerHeight === height)}
            >
              {LAYER_HEIGHT_LABELS[height] ?? "Custom"} · {height}mm
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Infill density</FieldLabel>
          <Select
            value={String(settings.infill)}
            onValueChange={(v) => onChange({ infill: Number(v) })}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pricing.infillOptions.map((infill) => (
                <SelectItem
                  key={infill}
                  value={String(infill)}
                  className="text-sm"
                >
                  {infill}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FieldLabel>Wall loops</FieldLabel>
          <Select
            value={String(settings.walls)}
            onValueChange={(v) => onChange({ walls: Number(v) })}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pricing.wallOptions.map((walls) => (
                <SelectItem
                  key={walls}
                  value={String(walls)}
                  className="text-sm"
                >
                  {walls} walls
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Model units</FieldLabel>
          <div className="flex gap-1">
            {UNITS.map((unit) => (
              <button
                key={unit.value}
                type="button"
                onClick={() => onChange({ unit: unit.value })}
                className={segmentClass(settings.unit === unit.value)}
              >
                {unit.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>Quantity</FieldLabel>
          <div className="flex items-center h-[38px] border border-stone-200 rounded-lg overflow-hidden bg-white">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() =>
                onChange({ quantity: Math.max(1, settings.quantity - 1) })
              }
              className="h-full px-3 text-stone-500 hover:bg-stone-100"
            >
              <FaMinus className="w-2.5 h-2.5" />
            </button>
            <input
              type="number"
              min={1}
              max={1000}
              value={settings.quantity}
              onChange={(e) => {
                const value = Math.floor(Number(e.target.value));
                onChange({
                  quantity: Number.isFinite(value)
                    ? Math.min(1000, Math.max(1, value))
                    : 1,
                });
              }}
              className="w-full h-full text-center text-sm font-semibold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() =>
                onChange({ quantity: Math.min(1000, settings.quantity + 1) })
              }
              className="h-full px-3 text-stone-500 hover:bg-stone-100"
            >
              <FaPlus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
