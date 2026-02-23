import { z } from "zod";

const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

// Schema for each header object
const headerSchema = z.object({
    title: z.string()
        .min(1, { message: "Header title is required" })
        .max(255, { message: "Header title must be at most 255 characters" }),
    image: z.preprocess(
            (value) => {
                if (value instanceof FileList) {
                    return value.item(0) ?? undefined;
                }
                if (Array.isArray(value)) {
                    return value[0] ?? undefined;
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
                        message: 'Header image is required',
                    });
    
                    return; // Exit early if no file is provided.
                }
    
                // validate the file type.
                if (!allowedImageTypes.includes(val.type)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Only jpeg|png|jpg|webp file allowed',
                    });
                }
            }),
});

// Schema for each subsection object
const subsectionSchema = z.object({
    title: z.string()
        .min(1, { message: "Subsection title is required" })
        .max(255, { message: "Subsection title must be at most 255 characters" }),
    content: z.string()
        .min(1, { message: "Subsection content is required" }),
    image: z.preprocess(
        (value) => {
            if (value instanceof FileList) {
                return value.item(0) ?? undefined;
            }
            if (Array.isArray(value)) {
                return value[0] ?? undefined;
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
                    message: 'Subsection image is required',
                });

                return; // Exit early if no file is provided.
            }

            // validate the file type.
            if (!allowedImageTypes.includes(val.type)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Only jpeg|png|jpg|webp file allowed',
                });
            }
        }),
});


export const featuresSectionSchema = z.object({
    // "headers" is optional(can be empty array), but if provided it must be an array with at least one element.
    headers: z.array(headerSchema),
        // .min(1, { message: "At least one header is required" })

    // "subsections" is optional(can be empty array), but if provided it must be an array with at least one element.
    subsections: z.array(subsectionSchema),
        // .min(1, { message: "At least one subsection is required" })
});
