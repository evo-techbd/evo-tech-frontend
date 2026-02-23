import { z } from 'zod';

export const DiscountSchema = z.object({
    id: z.string(),
    code: z.string().nonempty(), // code to redeem
    description: z.string().optional(),

    // Discount mechanics
    type: z.enum(['percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping']),
    value: z.number().positive(), // percentage (0-100) or fixed amount

    // Application rules
    appliesTo: z.enum(['product', 'category', 'order', 'shipping']),
    targetIds: z.array(z.string()).optional(), // product/category IDs
    minCartAmount: z.number().optional(),

    // Validity period
    validFrom: z.date(),
    validTo: z.date().optional(),

    // Usage constraints
    usageLimit: z.number(),
    usageCount: z.number(),
    perCustomerLimit: z.number(),

    // Business rules
    stackable: z.boolean(), // for combining multiple
    active: z.boolean(),
    priority: z.number(), // for stacking conflicts

}).refine(
    (data) => !data.validTo || data.validFrom < data.validTo,
    { message: "Start date must be before expiry date" }
);


export const DiscountUsageSchema = z.object({
    id: z.string(), // usage record ID
    discountId: z.string(), // FK to discount table
    customerId: z.string(), // your customer identifier
    customerEmail: z.string().email().optional(),

    // Usage context
    orderId: z.string(), // which order this was applied to
    usedAt: z.date(),

    // Applied discount details
    discountCode: z.string(), // code that was used
    appliedValue: z.number(), // actual discount amount applied
    discountType: z.enum(['percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping']),

    // Order context at time of usage
    orderTotal: z.number().positive(),
    discountedTotal: z.number().positive(),

    // Status tracking
    status: z.enum(['active', 'refunded', 'cancelled']),
    refundedAt: z.date().optional(),
});

export type DiscountType = z.infer<typeof DiscountSchema>;
export type DiscountUsage = z.infer<typeof DiscountUsageSchema>;
