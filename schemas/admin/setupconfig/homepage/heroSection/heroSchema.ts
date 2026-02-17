import { z } from "zod";

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

const titleSchema = z
  .string()
  .min(1, "Title is required")
  .max(255, "Title must not exceed 255 characters");

const subtitleSchema = z
  .string()
  .max(255, "Subtitle must not exceed 255 characters")
  .optional()
  .or(z.literal(""));

const descriptionSchema = z
  .string()
  .max(600, "Description must not exceed 600 characters")
  .optional()
  .or(z.literal(""));

const moreTextSchema = z.string().optional().or(z.literal(""));

const buttonTextSchema = z
  .string()
  .max(255, "Button text must not exceed 255 characters")
  .optional()
  .or(z.literal("")); // Handle empty string as optional

const buttonUrlSchema = z
  .string()
  .max(255, "Button URL must not exceed 255 characters")
  .optional()
  .or(z.literal("")); // Handle empty string as optional

const sortOrderSchema = z
  .string()
  .min(1, "Sort order is required")
  .refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 1 && num.toString() === val;
  }, "Sort order must be a number greater than 0");

const imageSchema = z
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
        message: "Image is required",
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

const optionalImageSchema = z
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

const baseHeroSchema = {
  title: titleSchema,
  subtitle: subtitleSchema,
  description: descriptionSchema,
  more_text: moreTextSchema,
  button_text: buttonTextSchema,
  button_url: buttonUrlSchema,
  sortOrder: sortOrderSchema,
};

export const heroAddSchema = z.object({
  ...baseHeroSchema,
  image: imageSchema,
});

export const heroUpdateSchema = z.object({
  ...baseHeroSchema,
  image: optionalImageSchema,
});

export const HeroSectionSchema = z.object({
  _id: z.string(),
  title: z.string(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  more_text: z.string().optional().nullable(),
  button_text: z.string().optional().nullable(),
  button_url: z.string().optional().nullable(),
  image: z.string(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const HeroSectionListSchema = z.array(HeroSectionSchema);

export type HeroSectionDisplayType = z.infer<typeof HeroSectionSchema>;
export type HeroAddFormValues = z.infer<typeof heroAddSchema>;
export type HeroUpdateFormValues = z.infer<typeof heroUpdateSchema>;
