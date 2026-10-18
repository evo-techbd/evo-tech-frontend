// FDM cost estimation for the instant quote on the 3D printing page. Rates
// come from the "3D Print Calculator" admin settings (GET /print-pricing).
import { ModelGeometry, ModelUnit, PrintMaterial } from "./types";

export const MAX_MODEL_FILE_SIZE_MB = 50;
export const MAX_MODEL_FILES = 5;
// Largest part our printers take in one piece; bigger parts need splitting
export const MAX_BUILD_SIZE_MM = 250;

const UNIT_TO_MM: Record<ModelUnit, number> = { mm: 1, cm: 10, inch: 25.4 };

const LINE_WIDTH_MM = 0.4;
const PRINT_SPEED_MM_PER_SEC = 60;
const EXTRUSION_EFFICIENCY = 0.5;
const LAYER_CHANGE_SECONDS = 2;

export interface PrintEstimate {
  volumeCm3: number;
  dimensionsMm: { x: number; y: number; z: number };
  weightGrams: number;
  printHours: number;
  unitPrice: number;
}

export const estimatePrint = ({
  geometry,
  unit,
  material,
  infill,
  layerHeight,
  walls,
  machineRatePerHour,
}: {
  geometry: ModelGeometry;
  unit: ModelUnit;
  material: Pick<PrintMaterial, "density" | "pricePerGram">;
  infill: number;
  layerHeight: number;
  walls: number;
  machineRatePerHour: number;
}): PrintEstimate => {
  const scale = UNIT_TO_MM[unit];
  const volumeMm3 = Math.abs(geometry.volume) * scale ** 3;
  const surfaceAreaMm2 = geometry.surfaceArea * scale ** 2;
  const dimensionsMm = {
    x: geometry.size.x * scale,
    y: geometry.size.y * scale,
    z: geometry.size.z * scale,
  };

  const shellMm3 = Math.min(volumeMm3, surfaceAreaMm2 * walls * LINE_WIDTH_MM);
  const printedMm3 = shellMm3 + (volumeMm3 - shellMm3) * (infill / 100);

  const weightGrams = (printedMm3 / 1000) * material.density;

  const flowMm3PerSec =
    layerHeight * LINE_WIDTH_MM * PRINT_SPEED_MM_PER_SEC * EXTRUSION_EFFICIENCY;
  const layers = Math.ceil(dimensionsMm.z / layerHeight);
  const printHours =
    (printedMm3 / flowMm3PerSec + layers * LAYER_CHANGE_SECONDS) / 3600;

  const unitPrice = Math.ceil(
    weightGrams * material.pricePerGram + printHours * machineRatePerHour,
  );

  return {
    volumeCm3: volumeMm3 / 1000,
    dimensionsMm,
    weightGrams,
    printHours,
    unitPrice,
  };
};

export const calculateOrderTotal = (
  itemsTotal: number,
  setupFee: number,
  minimumCharge: number,
) => Math.max(itemsTotal + setupFee, minimumCharge);

export const formatPrintTime = (hours: number) => {
  const totalMinutes = Math.max(1, Math.round(hours * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const LAYER_HEIGHT_LABELS: Record<number, string> = {
  0.12: "Ultra fine",
  0.16: "Fine",
  0.2: "Standard",
  0.28: "Draft",
};
