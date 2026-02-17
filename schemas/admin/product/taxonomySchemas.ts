import { z } from "zod";

// ==============================================
// BASE VALIDATION SCHEMAS
// ==============================================

// Allowed image types
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

// Common slug validation - lowercase, alphanumeric with hyphens
const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(100, "Slug must be less than 100 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens only (no spaces or special characters)"
  )
  .refine((val) => !val.startsWith("-") && !val.endsWith("-"), {
    message: "Slug cannot start or end with a hyphen",
  });

// Common name validation
const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(255, "Name must be less than 255 characters")
  .trim();

// Sort order validation
const sortOrderSchema = z
  .string()
  .min(1, "Sort order is required")
  .refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 1 && num.toString() === val;
  }, "Sort order must be a number greater than 0");

// Active status validation
const activeSchema = z.boolean();

// ID validation for relationships
const idSchema = z.string().nonempty({ message: "id is required" });

// ==============================================
// CATEGORY SCHEMAS
// ==============================================

// category schema for displaying in the table
export const categoryTableSchema = z.object({
  id: idSchema,
  name: nameSchema,
  slug: slugSchema,
  sortorder: z.number(),
  active: z.boolean(),
  url: z.string(), // url is a computed property in the model
  image: z.string().optional(),
  subcategories_count: z.number(),
  brands_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Create Category Schema
export const createCategorySchema = z.object({
  name: nameSchema,
  active: activeSchema,
  sortOrder: z.coerce
    .number()
    .int()
    .min(0, { message: "Sort order must be 0 or greater" })
    .default(0),
  image: z
    .preprocess((value) => {
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
    }, z.any())
    .superRefine((val, ctx) => {
      // Image is optional, so check only if provided
      if (val && val instanceof File) {
        // validate the file type.
        if (!allowedImageTypes.includes(val.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Only jpeg|png|jpg|webp file allowed",
          });
        }
      }
    })
    .optional(),
});

// Update Category Schema
export const updateCategorySchema = z.object({
  name: nameSchema,
  active: activeSchema,
  sortOrder: z.coerce
    .number()
    .int()
    .min(0, { message: "Sort order must be 0 or greater" })
    .default(0),
  image: z
    .preprocess((value) => {
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
    }, z.any())
    .superRefine((val, ctx) => {
      // Image is optional, so check only if provided
      if (val && val instanceof File) {
        // validate the file type.
        if (!allowedImageTypes.includes(val.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Only jpeg|png|jpg|webp file allowed",
          });
        }
      }
    })
    .optional(),
});

// Category ID param validation
export const categoryIdSchema = z.object({
  id: idSchema,
});

// ==============================================
// SUBCATEGORY SCHEMAS
// ==============================================

// Subcategory schema for displaying in the table
export const subcategoryTableSchema = z.object({
  id: idSchema,
  name: nameSchema,
  slug: slugSchema,
  sortorder: z.number(),
  active: z.boolean(),
  url: z.string(), // url is a computed property in the model
  category: z.object({
    id: idSchema,
    name: nameSchema,
    slug: slugSchema,
    active: z.boolean(),
  }),
  brands_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Create Subcategory Schema
export const createSubcategorySchema = z.object({
  name: nameSchema,
  category_id: idSchema,
  active: activeSchema,
  sortOrder: z.coerce
    .number()
    .int()
    .min(0, { message: "Sort order must be 0 or greater" })
    .default(0),
});

// Update Subcategory Schema
export const updateSubcategorySchema = z.object({
  name: nameSchema,
  category_id: idSchema,
  active: activeSchema,
  sortOrder: z.coerce
    .number()
    .int()
    .min(0, { message: "Sort order must be 0 or greater" })
    .default(0),
});

// Subcategory ID param validation
export const subcategoryIdSchema = z.object({
  id: idSchema,
});

// ==============================================
// BRAND SCHEMAS
// ==============================================

// Brand schema for displaying in the table
export const brandTableSchema = z.object({
  id: idSchema,
  name: nameSchema,
  slug: slugSchema,
  active: z.boolean(),
  categories_count: z.number(),
  subcategories_count: z.number(),
  categories: z.array(
    z.object({
      id: idSchema,
      name: nameSchema,
      slug: slugSchema,
      active: z.boolean(),
    })
  ),
  subcategories: z.array(
    z.object({
      id: idSchema,
      name: nameSchema,
      slug: slugSchema,
      active: z.boolean(),
    })
  ),
  total_associations: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Create Brand Schema
export const createBrandSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  active: activeSchema,
  sortOrder: z.coerce
    .number()
    .int()
    .min(0, { message: "Sort order must be 0 or greater" })
    .default(0),
  categories: z
    .array(
      z.object({
        // empty arrays will pass too
        id: idSchema,
        sortorder: z.number(),
      })
    )
    .refine(
      (categories) =>
        new Set(categories.map((c) => c.id)).size === categories.length,
      "Duplicate categories are not allowed."
    )
    .superRefine((categories, ctx) => {
      categories.forEach((c, idx) => {
        if (c.sortorder !== idx + 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Category at position ${idx + 1} should have sortorder ${
              idx + 1
            }`,
            path: ["categories", idx, "sortorder"],
          });
        }
      });
    }),
  subcategories: z
    .array(
      z.object({
        // empty arrays will pass too
        id: idSchema,
        sortorder: z.number(),
      })
    )
    .refine(
      (subcategories) =>
        new Set(subcategories.map((sc) => sc.id)).size === subcategories.length,
      "Duplicate subcategories are not allowed."
    )
    .superRefine((subcategories, ctx) => {
      subcategories.forEach((sc, idx) => {
        if (sc.sortorder !== idx + 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Subcategory at position ${
              idx + 1
            } should have sortorder ${idx + 1}`,
            path: ["subcategories", idx, "sortorder"],
          });
        }
      });
    }),
});

// Update Brand Schema
export const updateBrandSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  active: activeSchema,
  sortOrder: z.coerce
    .number()
    .int()
    .min(0, { message: "Sort order must be 0 or greater" })
    .default(0),
  categories: z
    .array(
      z.object({
        // empty arrays will pass too
        id: idSchema,
        sortorder: z.number(),
      })
    )
    .refine(
      (categories) =>
        new Set(categories.map((c) => c.id)).size === categories.length,
      "Duplicate categories are not allowed."
    )
    .superRefine((categories, ctx) => {
      categories.forEach((c, idx) => {
        if (c.sortorder !== idx + 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Category at position ${idx + 1} should have sortorder ${
              idx + 1
            }`,
            path: ["categories", idx, "sortorder"],
          });
        }
      });
    }),
  subcategories: z
    .array(
      z.object({
        // empty arrays will pass too
        id: idSchema,
        sortorder: z.number(),
      })
    )
    .refine(
      (subcategories) =>
        new Set(subcategories.map((sc) => sc.id)).size === subcategories.length,
      "Duplicate subcategories are not allowed."
    )
    .superRefine((subcategories, ctx) => {
      subcategories.forEach((sc, idx) => {
        if (sc.sortorder !== idx + 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Subcategory at position ${
              idx + 1
            } should have sortorder ${idx + 1}`,
            path: ["subcategories", idx, "sortorder"],
          });
        }
      });
    }),
});

// Brand ID param validation
export const brandIdSchema = z.object({
  id: idSchema,
});

// ==============================================
// RELATIONSHIP SCHEMAS
// ==============================================

// Bulk attach/detach brands to category
export const bulkCategoryBrandSchema = z.object({
  category_id: idSchema,
  brand_ids: z
    .array(idSchema)
    .min(1, "At least one brand must be selected")
    .max(100, "Maximum 100 brands can be attached at once"),
});

// Bulk attach/detach brands to subcategory
export const bulkSubcategoryBrandSchema = z.object({
  subcategory_id: idSchema,
  brand_ids: z
    .array(idSchema)
    .min(1, "At least one brand must be selected")
    .max(100, "Maximum 100 brands can be attached at once"),
});

// ==============================================
// QUERY/FILTER SCHEMAS
// ==============================================

// Pagination schema
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: "Page must be greater than 0" }),
  per_page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, {
      message: "Per page must be between 1 and 100",
    }),
});

// Search/Filter schema for categories
export const categoryFilterSchema = z
  .object({
    search: z.string().optional(),
    active: z
      .string()
      .optional()
      .transform((val) =>
        val === "true" ? true : val === "false" ? false : undefined
      ),
    sort_by: z
      .enum(["name", "sortorder", "created_at"])
      .optional()
      .default("sortorder"),
    sortorder: z.enum(["asc", "desc"]).optional().default("asc"),
  })
  .merge(paginationSchema);

// Search/Filter schema for subcategories
export const subcategoryFilterSchema = z
  .object({
    search: z.string().optional(),
    category_id: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    active: z
      .string()
      .optional()
      .transform((val) =>
        val === "true" ? true : val === "false" ? false : undefined
      ),
    sort_by: z
      .enum(["name", "sortorder", "created_at"])
      .optional()
      .default("sortorder"),
    sortorder: z.enum(["asc", "desc"]).optional().default("asc"),
  })
  .merge(paginationSchema);

// Search/Filter schema for brands
export const brandFilterSchema = z
  .object({
    search: z.string().optional(),
    active: z
      .string()
      .optional()
      .transform((val) =>
        val === "true" ? true : val === "false" ? false : undefined
      ),
    sort_by: z.enum(["name", "created_at"]).optional().default("name"),
    sortorder: z.enum(["asc", "desc"]).optional().default("asc"),
  })
  .merge(paginationSchema);

// ==============================================
// TYPE EXPORTS
// ==============================================

// Infer types from schemas for TypeScript usage
export type CategoryTableType = z.infer<typeof categoryTableSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type SubcategoryTableType = z.infer<typeof subcategoryTableSchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;

export type BrandTableType = z.infer<typeof brandTableSchema>;
export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

export type BulkCategoryBrand = z.infer<typeof bulkCategoryBrandSchema>;
export type BulkSubcategoryBrand = z.infer<typeof bulkSubcategoryBrandSchema>;

export type CategoryFilter = z.infer<typeof categoryFilterSchema>;
export type SubcategoryFilter = z.infer<typeof subcategoryFilterSchema>;
export type BrandFilter = z.infer<typeof brandFilterSchema>;
