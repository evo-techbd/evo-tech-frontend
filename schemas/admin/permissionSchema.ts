import { z } from "zod";

export const permissionSchema = z.object({
  _id: z.string(),
  name: z.string(),
  code: z.string(),
  route: z.string(),
  category: z.string(),
  description: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const staffPermissionSchema = z.object({
  user: z.string(),
  permissions: z.array(z.string()),
  grantedBy: z.string().optional(),
});

export const assignPermissionsSchema = z.object({
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

export type Permission = z.infer<typeof permissionSchema>;
export type StaffPermission = z.infer<typeof staffPermissionSchema>;
export type AssignPermissionsInput = z.infer<typeof assignPermissionsSchema>;
