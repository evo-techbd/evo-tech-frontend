import { z } from "zod";

export const DeliveryChargeSettingsSchema = z.object({
  _id: z.string().optional(),
  insideDhakaCharge: z.number().min(0, "Charge cannot be negative"),
  outsideDhakaCharge: z.number().min(0, "Charge cannot be negative"),
  additionalChargePerKg: z.number().min(0, "Charge cannot be negative"),
  expressInsideDhakaCharge: z.number().min(0, "Charge cannot be negative"),
  expressOutsideDhakaCharge: z.number().min(0, "Charge cannot be negative"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type DeliveryChargeSettingsType = z.infer<
  typeof DeliveryChargeSettingsSchema
>;

export const UpdateDeliveryChargeSettingsSchema = z.object({
  insideDhakaCharge: z.coerce
    .number({ invalid_type_error: "Enter a valid amount" })
    .min(0, "Charge cannot be negative"),
  outsideDhakaCharge: z.coerce
    .number({ invalid_type_error: "Enter a valid amount" })
    .min(0, "Charge cannot be negative"),
  additionalChargePerKg: z.coerce
    .number({ invalid_type_error: "Enter a valid amount" })
    .min(0, "Charge cannot be negative"),
  expressInsideDhakaCharge: z.coerce
    .number({ invalid_type_error: "Enter a valid amount" })
    .min(0, "Charge cannot be negative"),
  expressOutsideDhakaCharge: z.coerce
    .number({ invalid_type_error: "Enter a valid amount" })
    .min(0, "Charge cannot be negative"),
});

export type UpdateDeliveryChargeSettingsType = z.infer<
  typeof UpdateDeliveryChargeSettingsSchema
>;
