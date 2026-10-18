"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useDropzone, FileRejection } from "react-dropzone";
import { toast } from "sonner";
import {
  FaCloudUploadAlt,
  FaCube,
  FaExclamationTriangle,
  FaTrash,
} from "react-icons/fa";
import { cn, currencyFormatBDT } from "@/lib/all_utils";
import { loadModelFile } from "@/lib/print3d/geometry";
import {
  MAX_BUILD_SIZE_MM,
  MAX_MODEL_FILES,
  MAX_MODEL_FILE_SIZE_MB,
  PrintEstimate,
  calculateOrderTotal,
  estimatePrint,
  formatPrintTime,
} from "@/lib/print3d/pricing";
import {
  ModelGeometry,
  PrintPricing,
  PrintSettings,
} from "@/lib/print3d/types";
import { PrintSettingsPanel } from "./print-settings-panel";
import type { BufferGeometry } from "three";

// WebGL only exists in the browser
const ModelViewer = dynamic(
  () => import("./model-viewer").then((mod) => mod.ModelViewer),
  { ssr: false },
);

interface QuoteModel {
  id: string;
  file: File;
  status: "loading" | "ready" | "error";
  error?: string;
  geometry?: BufferGeometry;
  metrics?: ModelGeometry;
  settings: PrintSettings;
}

const pickDefault = (options: number[], preferred: number) =>
  options.includes(preferred) ? preferred : options[0];

const formatFileSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const formatNumber = (value: number, digits = 1) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export function PrintQuoteCalculator({ pricing }: { pricing: PrintPricing }) {
  const [models, setModels] = useState<QuoteModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Free GPU buffers for models that are gone (removed or page left)
  const modelsRef = useRef(models);
  modelsRef.current = models;
  useEffect(
    () => () => modelsRef.current.forEach((m) => m.geometry?.dispose()),
    [],
  );

  const defaultSettings = useCallback((): PrintSettings => {
    const material = pricing.materials[0];
    return {
      material: material.name,
      color: material.colors[0],
      infill: pickDefault(pricing.infillOptions, 20),
      layerHeight: pickDefault(pricing.layerHeightOptions, 0.2),
      walls: pickDefault(pricing.wallOptions, 2),
      unit: "mm",
      quantity: 1,
    };
  }, [pricing]);

  // No-op if the model was removed in the meantime (e.g. while parsing)
  const updateModel = useCallback(
    (id: string, patch: Partial<QuoteModel>) =>
      setModels((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      ),
    [],
  );

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      rejections.forEach(({ file, errors }) =>
        toast.error(
          errors[0]?.code === "file-too-large"
            ? `${file.name} is larger than ${MAX_MODEL_FILE_SIZE_MB}MB`
            : `${file.name}: ${errors[0]?.message ?? "file not accepted"}`,
        ),
      );

      const room = MAX_MODEL_FILES - modelsRef.current.length;
      if (accepted.length > room) {
        toast.error(`You can add up to ${MAX_MODEL_FILES} models per order`);
      }
      const files = accepted.slice(0, Math.max(0, room));
      if (!files.length) return;

      // Same settings as the model being edited, so batches stay consistent
      const selected = modelsRef.current.find((m) => m.id === selectedId);
      const baseSettings = selected?.settings ?? defaultSettings();

      const added: QuoteModel[] = files.map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        status: "loading",
        settings: { ...baseSettings, quantity: 1 },
      }));
      setModels((prev) => [...prev, ...added]);
      setSelectedId(added[0].id);

      added.forEach(async (model) => {
        try {
          const { geometry, metrics } = await loadModelFile(model.file);
          updateModel(model.id, { status: "ready", geometry, metrics });
        } catch (error: any) {
          updateModel(model.id, {
            status: "error",
            error: error?.message ?? "Could not read this file",
          });
        }
      });
    },
    [defaultSettings, selectedId, updateModel],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "application/octet-stream": [".stl", ".obj", ".3mf"] },
    maxSize: MAX_MODEL_FILE_SIZE_MB * 1024 * 1024,
    noClick: models.length > 0,
    noKeyboard: models.length > 0,
  });

  const removeModel = (id: string) => {
    const model = models.find((m) => m.id === id);
    model?.geometry?.dispose();
    const remaining = models.filter((m) => m.id !== id);
    setModels(remaining);
    if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
  };

  const estimates = useMemo(() => {
    const result: Record<string, PrintEstimate> = {};
    models.forEach((model) => {
      const material = pricing.materials.find(
        (m) => m.name === model.settings.material,
      );
      if (model.status !== "ready" || !model.metrics || !material) return;
      result[model.id] = estimatePrint({
        geometry: model.metrics,
        unit: model.settings.unit,
        material,
        infill: model.settings.infill,
        layerHeight: model.settings.layerHeight,
        walls: model.settings.walls,
        machineRatePerHour: pricing.machineRatePerHour,
      });
    });
    return result;
  }, [models, pricing]);

  const readyModels = models.filter((m) => m.status === "ready");
  const isLoading = models.some((m) => m.status === "loading");
  const itemsTotal = readyModels.reduce(
    (sum, m) => sum + (estimates[m.id]?.unitPrice ?? 0) * m.settings.quantity,
    0,
  );
  const orderTotal = calculateOrderTotal(
    itemsTotal,
    pricing.setupFee,
    pricing.minimumCharge,
  );
  const minimumApplied =
    readyModels.length > 0 &&
    itemsTotal + pricing.setupFee < pricing.minimumCharge;

  const selected = models.find((m) => m.id === selectedId) ?? models[0];
  const selectedEstimate = selected ? estimates[selected.id] : undefined;
  const isOversized =
    selectedEstimate &&
    Object.values(selectedEstimate.dimensionsMm).some(
      (v) => v > MAX_BUILD_SIZE_MM,
    );
  // A model this small in mm is almost certainly drawn in cm or inches
  const looksTooSmall =
    selectedEstimate &&
    selected?.settings.unit === "mm" &&
    Math.max(...Object.values(selectedEstimate.dimensionsMm)) < 5;

  const applyToAll = () => {
    if (!selected) return;
    setModels((prev) =>
      prev.map((m) => ({
        ...m,
        settings: { ...selected.settings, quantity: m.settings.quantity },
      })),
    );
    toast.success("Settings applied to all models");
  };

  if (models.length === 0) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "rounded-xl border-2 border-dashed px-6 py-14 sm:py-20 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-brand-500 bg-brand-50"
            : "border-stone-300 bg-stone-50 hover:border-stone-400",
        )}
      >
        <input {...getInputProps()} />
        <FaCloudUploadAlt className="w-8 h-8 mx-auto text-stone-400" />
        <p className="mt-4 text-base font-medium text-stone-900">
          {isDragActive ? (
            "Drop to analyse"
          ) : (
            <>
              Drop your model here, or{" "}
              <span className="text-brand-600 underline underline-offset-4">
                browse files
              </span>
            </>
          )}
        </p>
        <p className="mt-1.5 text-sm text-stone-500">
          STL, OBJ or 3MF, up to {MAX_MODEL_FILE_SIZE_MB}MB each, max{" "}
          {MAX_MODEL_FILES} files. Files stay on your device.
        </p>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-6 outline-none"
    >
      <input {...getInputProps()} />

      {/* Left: viewer + model list */}
      <div className="space-y-4 min-w-0">
        <div className="relative bg-stone-100 rounded-xl overflow-hidden border border-stone-200 h-[320px] sm:h-[440px]">
          {selected?.status === "ready" && selected.geometry ? (
            <ModelViewer
              geometry={selected.geometry}
              color={selected.settings.color}
              className="w-full h-full"
            />
          ) : selected?.status === "error" ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-6">
              <FaExclamationTriangle className="w-8 h-8 text-rose-500" />
              <p className="text-sm font-medium text-stone-800">
                {selected.error}
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="size-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
              <p className="text-sm text-stone-600">Analysing model...</p>
            </div>
          )}
          {selectedEstimate && (
            <div className="absolute left-3 bottom-3 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur text-xs font-medium text-stone-700 shadow-sm">
              {formatNumber(selectedEstimate.dimensionsMm.x)} ×{" "}
              {formatNumber(selectedEstimate.dimensionsMm.y)} ×{" "}
              {formatNumber(selectedEstimate.dimensionsMm.z)} mm
            </div>
          )}
          {selected?.status === "ready" && (
            <div className="absolute right-3 bottom-3 px-2 py-1 rounded-md bg-white/80 text-[0.65rem] text-stone-500 hidden sm:block">
              Drag to rotate · Scroll to zoom
            </div>
          )}
          {isDragActive && (
            <div className="absolute inset-0 bg-brand-600/20 border-4 border-dashed border-brand-500 rounded-xl flex items-center justify-center">
              <p className="px-4 py-2 bg-white rounded-xl font-semibold text-brand-700">
                Drop to add models
              </p>
            </div>
          )}
        </div>

        <ul className="space-y-2">
          {models.map((model) => {
            const estimate = estimates[model.id];
            const isSelected = model.id === selected?.id;
            return (
              <li key={model.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(model.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setSelectedId(model.id)
                  }
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border bg-white cursor-pointer transition-colors",
                    isSelected
                      ? "border-brand-500 ring-1 ring-brand-500"
                      : "border-stone-200 hover:border-brand-300",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      model.status === "error" ? "bg-rose-50" : "bg-brand-50",
                    )}
                  >
                    {model.status === "error" ? (
                      <FaExclamationTriangle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <FaCube className="w-4 h-4 text-brand-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-900 truncate">
                      {model.file.name}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {formatFileSize(model.file.size)}
                      {model.status === "ready" &&
                        ` · ${model.settings.material} ${model.settings.color} · ${model.settings.infill}% · ×${model.settings.quantity}`}
                      {model.status === "loading" && " · analysing..."}
                      {model.status === "error" && " · could not be read"}
                    </p>
                  </div>
                  {estimate && (
                    <span className="text-sm font-bold text-stone-900 whitespace-nowrap">
                      ৳
                      {currencyFormatBDT(
                        estimate.unitPrice * model.settings.quantity,
                      )}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${model.file.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeModel(model.id);
                    }}
                    className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {models.length < MAX_MODEL_FILES && (
          <button
            type="button"
            onClick={open}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-stone-300 text-sm font-medium text-stone-600 hover:border-stone-400 hover:text-stone-900 transition-colors"
          >
            <FaCloudUploadAlt className="w-4 h-4" />
            Add another model ({models.length}/{MAX_MODEL_FILES})
          </button>
        )}
      </div>

      {/* Right: settings, estimate, summary */}
      <aside className="space-y-4">
        {selected && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-semibold text-stone-900 truncate">
                Print settings
              </h3>
              {models.length > 1 && (
                <button
                  type="button"
                  onClick={applyToAll}
                  className="text-xs font-medium text-brand-700 hover:underline whitespace-nowrap"
                >
                  Apply to all models
                </button>
              )}
            </div>
            <PrintSettingsPanel
              pricing={pricing}
              settings={selected.settings}
              onChange={(patch) =>
                updateModel(selected.id, {
                  settings: { ...selected.settings, ...patch },
                })
              }
            />
          </div>
        )}

        {selectedEstimate && selected && (
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-stone-900 mb-1">Per piece</h3>
            <dl className="text-sm divide-y divide-stone-100">
              {[
                [
                  "Volume",
                  `${formatNumber(selectedEstimate.volumeCm3, 2)} cm³`,
                ],
                ["Material", `${formatNumber(selectedEstimate.weightGrams)} g`],
                [
                  "Print time",
                  `~${formatPrintTime(selectedEstimate.printHours)}`,
                ],
                ["Price", `৳${currencyFormatBDT(selectedEstimate.unitPrice)}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2">
                  <dt className="text-stone-500">{label}</dt>
                  <dd className="font-medium text-stone-900">{value}</dd>
                </div>
              ))}
            </dl>
            {isOversized && (
              <p className="mt-3 text-xs text-amber-800 bg-amber-50 rounded-lg p-3">
                This model is larger than our {MAX_BUILD_SIZE_MM}mm build
                volume. We can still print it in parts — mention it when you
                contact us.
              </p>
            )}
            {looksTooSmall && (
              <p className="mt-3 text-xs text-amber-800 bg-amber-50 rounded-lg p-3">
                This model is very small. If it was designed in centimetres or
                inches, change the model units above.
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h3 className="font-semibold text-stone-900 mb-3">Your quote</h3>
          <div className="space-y-1.5 text-sm">
            {readyModels.map((model) => (
              <div key={model.id} className="flex justify-between gap-3">
                <span className="text-stone-600 truncate">
                  {model.file.name} × {model.settings.quantity}
                </span>
                <span className="whitespace-nowrap text-stone-900">
                  ৳
                  {currencyFormatBDT(
                    (estimates[model.id]?.unitPrice ?? 0) *
                      model.settings.quantity,
                  )}
                </span>
              </div>
            ))}
            {pricing.setupFee > 0 && (
              <div className="flex justify-between gap-3">
                <span className="text-stone-600">Setup fee</span>
                <span className="text-stone-900">
                  ৳{currencyFormatBDT(pricing.setupFee)}
                </span>
              </div>
            )}
            {minimumApplied && (
              <div className="flex justify-between gap-3 text-amber-700">
                <span>Minimum order charge</span>
                <span>৳{currencyFormatBDT(pricing.minimumCharge)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-stone-200">
            <span className="text-sm text-stone-600">Estimated total</span>
            <span className="text-2xl font-semibold text-stone-900">
              ৳{currencyFormatBDT(readyModels.length ? orderTotal : 0)}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Estimate only, delivery not included. We confirm the final price
            after checking your file.
          </p>
          {isLoading && (
            <p className="text-xs text-stone-500 mt-2">Analysing models...</p>
          )}
          {models.length > readyModels.length && !isLoading && (
            <p className="text-xs text-amber-700 mt-2">
              Files that could not be read are left out of the quote.
            </p>
          )}
          <Link
            href="/contact-us"
            className="mt-4 block w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-medium text-center hover:bg-stone-700 transition-colors"
          >
            Contact us to order
          </Link>
        </div>
      </aside>
    </div>
  );
}
