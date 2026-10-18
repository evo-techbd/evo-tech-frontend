export type ModelUnit = "mm" | "cm" | "inch";

export interface PrintMaterial {
  name: string;
  fullName?: string;
  description?: string;
  density: number;
  pricePerGram: number;
  colors: string[];
  isActive: boolean;
}

// Shape of GET /print-pricing
export interface PrintPricing {
  materials: PrintMaterial[];
  machineRatePerHour: number;
  setupFee: number;
  minimumCharge: number;
  infillOptions: number[];
  layerHeightOptions: number[];
  wallOptions: number[];
}

// Measured from the model file, in the file's own units
export interface ModelGeometry {
  volume: number;
  surfaceArea: number;
  size: { x: number; y: number; z: number };
}

export interface PrintSettings {
  material: string;
  color: string;
  infill: number;
  layerHeight: number;
  walls: number;
  unit: ModelUnit;
  quantity: number;
}
