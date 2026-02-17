import { z } from "zod";

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

const brandNameSchema = z
  .string()
  .min(1, "Brand name is required")
  .max(255, "Brand name must not exceed 255 characters");

const brandUrlSchema = z
  .string()
  .max(255, "Brand URL must not exceed 255 characters")
  .optional()
  .or(z.literal("")); // Handle empty string as optional

const brandDescriptionSchema = z
  .string()
  .max(300, "Description must not exceed 300 characters")
  .optional()
  .or(z.literal(""));

const sortorderSchema = z
  .string()
  .min(1, "Sort order is required")
  .refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 1 && num.toString() === val;
  }, "Sort order must be a number greater than 0");

const isActiveSchema = z.boolean();

const brandLogoSchema = z
  .preprocess(
    (value) => {
      if (value instanceof FileList) {
        return value.item(0) ?? undefined;
      }
      if (Array.isArray(value) && value.length > 0) {
        return value[0];
      }
      if (Array.isArray(value) && value.length === 0) {
        return undefined;
      }
      return value;
    },
    z.any() // z.any() to handle undefined values in superRefine
  )
  .superRefine((val, ctx) => {
    // check if a file was provided.
    if (!(val instanceof File)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Brand logo is required",
      });

      return; // Exit early if no file is provided.
    }

    // validate the file type.
    if (!allowedImageTypes.includes(val.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only jpeg|png|jpg|webp file allowed",
      });
    }
  });

const optionalBrandLogoSchema = z
  .preprocess(
    (value) => {
      if (value instanceof FileList) {
        return value.item(0) ?? undefined;
      }
      if (Array.isArray(value) && value.length > 0) {
        return value[0];
      }
      if (Array.isArray(value) && value.length === 0) {
        return undefined;
      }
      return value;
    },
    z.any().optional() // z.any() to handle values in superRefine, field can be absent
  )
  .superRefine((val, ctx) => {
    // check if a file was provided.
    if (!(val instanceof File)) {
      return; // Exit early if no file is provided.
    }

    // validate the file type.
    if (!allowedImageTypes.includes(val.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only jpeg|png|jpg|webp file allowed",
      });
    }
  });

export const ourClientsAddSchema = z.object({
  brand_name: brandNameSchema,
  brand_logo: brandLogoSchema,
  brand_url: brandUrlSchema,
  brand_description: brandDescriptionSchema,
  sortorder: sortorderSchema,
  is_active: isActiveSchema,
});

export const ourClientsUpdateSchema = z.object({
  brand_name: brandNameSchema,
  brand_logo: optionalBrandLogoSchema,
  brand_url: brandUrlSchema,
  brand_description: brandDescriptionSchema,
  sortorder: sortorderSchema,
  is_active: isActiveSchema,
});

export const OurClientsSchema = z.object({
  trustedbyid: z.string(),
  brand_name: z.string(),
  brand_logosrc: z.string(),
  brand_url: z.string().nullable(),
  brand_description: z.string().nullable(),
  sortorder: z.number(),
  is_active: z.boolean(),
  last_modified_at: z.string(),
});

export type OurClientsDisplayType = z.infer<typeof OurClientsSchema>;
export type OurClientsAddFormValues = z.infer<typeof ourClientsAddSchema>;
export type OurClientsUpdateFormValues = z.infer<typeof ourClientsUpdateSchema>;
