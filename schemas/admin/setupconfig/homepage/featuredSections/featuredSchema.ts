import { z } from 'zod';

const titleSchema = z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters');

const viewMoreUrlSchema = z
    .string()
    .max(255, 'URL must not exceed 255 characters')
    .optional()
    .or(z.literal('')); // Handle empty string as optional

const sortorderSchema = z
    .string()
    .min(1, 'Sort order is required')
    .refine((val) => {
        const num = parseInt(val, 10)
        return !isNaN(num) && num >= 1 && num.toString() === val
    }, 'Sort order must be a number greater than 0');

export const featuredAddSchema = z.object({
    title: titleSchema,
    view_more_url: viewMoreUrlSchema,
    sortorder: sortorderSchema,
});

export const featuredUpdateSchema = z.object({
    title: titleSchema,
    view_more_url: viewMoreUrlSchema,
    sortorder: sortorderSchema,
});

export const FeaturedSectionSchema = z.object({
    sectionid: z.string(),
    title: z.string(),
    view_more_url: z.string(),
    sortorder: z.number(),
    items_count: z.number(),
});

export type FeaturedSectionDisplayType = z.infer<typeof FeaturedSectionSchema>;
export type FeaturedAddFormValues = z.infer<typeof featuredAddSchema>;
export type FeaturedUpdateFormValues = z.infer<typeof featuredUpdateSchema>;
