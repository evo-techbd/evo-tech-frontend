import { z } from "zod";

// Schema for each spec object
const specSchema = z.object({
    label: z.string()
        .min(1, { message: "Label is required" })
        .max(255, { message: "Label must be at most 255 characters" }),
    value: z.string()
        .min(1, { message: "Value is required" })
        .max(255, { message: "Value must be at most 255 characters" }),
});


export const specsSectionSchema = z.object({
    specs: z.array(specSchema),
});
