import { z } from "zod";

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

export const AddProductSchema = z.object({
  item_name: z
    .string()
    .min(1, { message: "Item name is required" })
    .max(255, { message: "Item name must be at most 255 characters" }),

  item_slug: z
    .string()
    .min(1, { message: "Item slug is required" })
    .max(255, { message: "Item slug must be at most 255 characters" }),

  item_price: z
    .string()
    .min(1, { message: "Price is required" })
    .refine(
      (val) => {
        const n = Number(val);
        return !Number.isNaN(n) && n >= 0;
      },
      { message: "Price must be at least 0" },
    ),

  item_buyingprice: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true; // Allow empty
        const n = Number(val);
        return !Number.isNaN(n) && n >= 0;
      },
      { message: "Buying price must be at least 0" },
    ),

  item_prevprice: z
    .string()
    .min(1, { message: "Previous price must be at least 0" })
    .refine(
      (val) => {
        const n = Number(val);
        return !Number.isNaN(n) && n >= 0;
      },
      { message: "Previous price must be at least 0" },
    ),

  item_instock: z.boolean({
    invalid_type_error: "Invalid value for instock",
  }),

  // item_features: nullable array (no strict type specified so using z.any())
  item_features: z.array(z.any()).nullable().optional(),

  item_colors: z.array(z.any()).nullable().optional(),

  item_mainimg: z
    .preprocess(
      (value) => {
        // Handle FileList
        if (value instanceof FileList) {
          return value.item(0) ?? undefined;
        }
        // Handle File array from FileUploader component
        if (Array.isArray(value) && value.length > 0) {
          return value[0];
        }
        // Handle empty array
        if (Array.isArray(value) && value.length === 0) {
          return undefined;
        }
        return value;
      },
      z.any(), // z.any() to handle undefined values in superRefine
    )
    .superRefine((val, ctx) => {
      // check if a file was provided.
      if (!(val instanceof File)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Main image is required",
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
    }),

  item_category: z.string().min(1, { message: "Item category is required" }),

  item_subcategory: z.string().nullable().optional(),

  item_brand: z.string().min(1, { message: "Item brand is required" }),

  item_weight: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined || arg === "") return null;
      return arg;
    },
    z
      .string()
      .refine(
        (val) => {
          const n = Number(val);
          return !Number.isNaN(n) && n >= 0;
        },
        { message: "Weight cannot be negative" },
      )
      .optional()
      .nullable(),
  ),

  landing_section_id: z.preprocess((arg) => {
    if (arg === null || arg === undefined || arg === "") return null;
    return arg;
  }, z.string().nullable().optional()),

  additional_images: z
    .preprocess((value) => {
      // Handle FileList
      if (value instanceof FileList) {
        const filesArray = Array.from(value);
        return filesArray;
      }
      // Handle File array from FileUploader component (already an array)
      if (Array.isArray(value)) {
        return value;
      }
      // Return empty array for undefined/null values
      return value ?? [];
    }, z.any())
    .superRefine((val, ctx) => {
      if (!Array.isArray(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid input received",
        });

        return; // exit early
      }

      if (val.length > 0) {
        val.forEach((file: unknown) => {
          if (!(file instanceof File)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid input in file field",
            });

            return; // Exit early if no file is provided.
          }

          // validate the file type.
          if (!allowedImageTypes.includes(file.type)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Only jpeg|png|jpg|webp file allowed",
            });
          }
        });
      }
    }),

  // Additional fields from backend schema
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  stock: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined || arg === "") return "0";
      return arg;
    },
    z
      .string()
      .refine(
        (val) => {
          const n = Number(val);
          return !Number.isNaN(n) && n >= 0;
        },
        { message: "Stock cannot be negative" },
      )
      .optional(),
  ),
  lowStockThreshold: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined || arg === "") return "10";
      return arg;
    },
    z
      .string()
      .refine(
        (val) => {
          const n = Number(val);
          return !Number.isNaN(n) && n >= 0;
        },
        { message: "Threshold cannot be negative" },
      )
      .optional(),
  ),
  isFeatured: z.boolean().optional(),
  published: z.boolean().optional(),
  isPreOrder: z.boolean().optional(),
  preOrderDate: z.string().optional().nullable(),
  preOrderPrice: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined || arg === "") return null;
      return arg;
    },
    z
      .string()
      .refine(
        (val) => {
          const n = Number(val);
          return !Number.isNaN(n) && n >= 0;
        },
        { message: "Pre-order price cannot be negative" },
      )
      .optional()
      .nullable(),
  ),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  item_faq: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
      }),
    )
    .optional()
    .nullable(),
});

export const UpdateProductSchema = z.object({
  item_name: z
    .string()
    .min(1, "Item name is required")
    .max(255, "Item name must be less than 255 characters"),
  item_slug: z
    .string()
    .min(1, "Item slug is required")
    .max(255, "Item slug must be less than 255 characters"),
  item_price: z
    .string()
    .min(1, { message: "Price is required" })
    .refine(
      (val) => {
        const n = Number(val);
        return !Number.isNaN(n) && n >= 0;
      },
      { message: "Price must be at least 0" },
    ),

  item_buyingprice: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true; // Allow empty
        const n = Number(val);
        return !Number.isNaN(n) && n >= 0;
      },
      { message: "Buying price must be at least 0" },
    ),

  item_prevprice: z
    .string()
    .min(1, { message: "Previous price must be at least 0" })
    .refine(
      (val) => {
        const n = Number(val);
        return !Number.isNaN(n) && n >= 0;
      },
      { message: "Previous price must be at least 0" },
    ),

  item_instock: z.boolean({
    invalid_type_error: "Invalid value for instock",
  }),

  item_features: z.array(z.string()).optional().nullable(),
  item_colors: z.array(z.string()).optional().nullable(),
  item_category: z.string().min(1, "Category is required"),
  item_subcategory: z.string().optional().nullable(),
  item_brand: z.string().min(1, "Brand is required"),
  item_weight: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined || arg === "") return null;
      return arg;
    },
    z
      .string()
      .refine(
        (val) => {
          const n = Number(val);
          return !Number.isNaN(n) && n >= 0;
        },
        { message: "Weight cannot be negative" },
      )
      .optional()
      .nullable(),
  ),
  landing_section_id: z.preprocess((arg) => {
    if (arg === null || arg === undefined || arg === "") return null;
    return arg;
  }, z.string().nullable().optional()),

  item_newmainimg: z
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
      z.any().optional(), // z.any() to handle values in superRefine, field can be absent
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
    }),

  item_newmainfromexisting: z.string().optional().nullable(),

  item_featurebanner: z.string().optional().nullable(),

  additional_newimages: z
    .preprocess((value) => {
      if (value instanceof FileList) {
        const filesArray = Array.from(value);
        return filesArray;
      }
      if (Array.isArray(value)) {
        return value;
      }
      return value ?? [];
    }, z.any().optional())
    .superRefine((val, ctx) => {
      if (!Array.isArray(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid input received",
        });

        return; // exit early
      }

      if (val.length > 0) {
        val.forEach((file: unknown) => {
          if (!(file instanceof File)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Invalid input in file field",
            });

            return; // Exit early if no file is provided.
          }

          // validate the file type.
          if (!allowedImageTypes.includes(file.type)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Only jpeg|png|jpg|webp file allowed",
            });
          }
        });
      }
    }),

  remove_additional_images: z.array(z.string()).optional().nullable(),
  image_order: z.string().optional().nullable(), // additional checks can be performed using transform() method for re-ordered images

  // Additional fields from backend schema
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  stock: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined || arg === "") return "0";
      return arg;
    },
    z
      .string()
      .refine(
        (val) => {
          const n = Number(val);
          return !Number.isNaN(n) && n >= 0;
        },
        { message: "Stock cannot be negative" },
      )
      .optional(),
  ),
  lowStockThreshold: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined || arg === "") return "10";
      return arg;
    },
    z
      .string()
      .refine(
        (val) => {
          const n = Number(val);
          return !Number.isNaN(n) && n >= 0;
        },
        { message: "Threshold cannot be negative" },
      )
      .optional(),
  ),
  isFeatured: z.boolean().optional(),
  published: z.boolean().optional(),
  isPreOrder: z.boolean().optional(),
  preOrderDate: z.string().optional().nullable(),
  preOrderPrice: z.preprocess(
    (arg) => {
      if (arg === null || arg === undefined || arg === "") return null;
      return arg;
    },
    z
      .string()
      .refine(
        (val) => {
          const n = Number(val);
          return !Number.isNaN(n) && n >= 0;
        },
        { message: "Pre-order price cannot be negative" },
      )
      .optional()
      .nullable(),
  ),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  item_faq: z
    .array(
      z.object({
        question: z.string().min(1, "Question is required"),
        answer: z.string().min(1, "Answer is required"),
      }),
    )
    .optional()
    .nullable(),
});

export type AddProductFormValues = z.infer<typeof AddProductSchema>;
export type UpdateProductFormValues = z.infer<typeof UpdateProductSchema>;

export type ProductDisplayType = {
  itemid: string;
  i_name: string;
  i_slug: string;
  i_price: number;
  i_instock: boolean;
  i_stock?: number;
  i_lowstockthreshold?: number;
  i_mainimg: string;
  i_category: string;
  i_subcategory?: string;
  i_brand: string;
  i_published: boolean;
  i_faq?: { question: string; answer: string }[];
};
