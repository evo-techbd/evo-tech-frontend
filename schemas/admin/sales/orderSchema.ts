import { z } from "zod";

export const orderSchema = z.object({
  _id: z.string().optional(),
  orderNumber: z.string(),
  user: z.string(), // UUID
  firstname: z.string(),
  lastname: z.string(),
  phone: z.string(),
  email: z.string(),
  houseStreet: z.string(),
  city: z.string(),
  subdistrict: z.string().optional(),
  postcode: z.string(),
  country: z.string(),
  shippingType: z.string(),
  pickupPointId: z.string().optional(),
  paymentMethod: z.string(),
  transactionId: z.string().optional(),
  terms: z.boolean(),
  subtotal: z.number(),
  discount: z.number(),
  deliveryCharge: z.number(),
  additionalCharge: z.number(),
  totalPayable: z.number(),
  amountPaid: z.number().default(0),
  amountDue: z.number().default(0),
  orderStatus: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  paymentStatus: z.enum(["pending", "partial", "paid", "failed", "refunded"]),
  notes: z.string().optional(),
  trackingCode: z.string().optional(),
  viewed: z.boolean(),
  unpaidNotified: z.boolean(),
  deliveredAt: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const orderedItemSchema = z.object({
  _id: z.string().optional(),
  order: z.string(),
  product: z.string(),
  productName: z.string(),
  productPrice: z.number(),
  quantity: z.number(),
  selectedColor: z.string().optional(),
  subtotal: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const orderStatusesUpdateSchema = z.object({
  orderStatus: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .optional(),
  paymentStatus: z
    .enum(["pending", "partial", "paid", "failed", "refunded"])
    .optional(),
  trackingCode: z.string().nullable().optional(),
  subtotal: z.number().positive().optional(),
  discount: z.number().min(0).optional(),
  deliveryCharge: z.number().min(0).optional(),
  additionalCharge: z.number().min(0).optional(),
  totalPayable: z.number().positive().optional(),
  amountPaid: z.number().min(0).optional(),
});

export type OrderType = z.infer<typeof orderSchema>;
export type OrderedItemType = z.infer<typeof orderedItemSchema>;
export type OrderStatusesUpdateType = z.infer<typeof orderStatusesUpdateSchema>;

export type OrderWithItemsType = OrderType & {
  orderItems?: OrderedItemType[];
};
