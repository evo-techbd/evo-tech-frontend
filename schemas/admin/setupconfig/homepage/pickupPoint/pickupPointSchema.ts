import { z } from "zod";

export const PickupPointSchema = z.object({
  _id: z.string(),
  name: z.string().min(1, "Pickup point name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  phone: z.string().optional(),
  hours: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const PickupPointListSchema = z.array(PickupPointSchema);

export type PickupPointDisplayType = z.infer<typeof PickupPointSchema>;

export const CreatePickupPointSchema = z.object({
  name: z.string().min(1, "Pickup point name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  phone: z.string().optional(),
  hours: z.string().optional().default("10:00 AM - 6:00 PM"),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export type CreatePickupPointType = z.infer<typeof CreatePickupPointSchema>;

export const UpdatePickupPointSchema = CreatePickupPointSchema.partial();

export type UpdatePickupPointType = z.infer<typeof UpdatePickupPointSchema>;
