import { z } from "zod";

// ============================================
// FIELD SCHEMAS
// ============================================

const firstNameSchema = z.string().min(1, "First name is required").max(50, "First name must be at most 50 characters");
const lastNameSchema = z.string().min(1, "Last name is required").max(50, "Last name must be at most 50 characters");
const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(1, "Password is required");
const phoneSchema = z.string().optional();
const userTypeSchema = z.enum(["admin", "employee"], {
    errorMap: () => ({ message: "User type must be either 'admin' or 'employee'" }),
});
const activeSchema = z.boolean().default(true);

// ============================================
// TABLE SCHEMAS
// ============================================

export const staffTableSchema = z.object({
    id: z.string(),
    uuid: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    userType: z.enum(["admin", "employee"]),
    isActive: z.boolean(),
    emailVerifiedAt: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    lastActiveAt: z.string().optional(),
});

// ============================================
// CREATE/UPDATE SCHEMAS
// ============================================

export const createStaffSchema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema,
    userType: userTypeSchema,
    isActive: activeSchema,
});

export const updateStaffSchema = z.object({
    firstName: firstNameSchema.optional(),
    lastName: lastNameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    phone: phoneSchema,
    userType: userTypeSchema.optional(),
    isActive: z.boolean().optional(),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type StaffTableType = z.infer<typeof staffTableSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
