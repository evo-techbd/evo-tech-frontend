import { z } from "zod";

export const checkoutSchema = z
  .object({
    fullName: z
      .string()
      .nonempty("Name is required")
      .regex(
        /^[A-Za-z\s._]+$/,
        "Name cannot contain numbers or special characters"
      ),
    phone: z
      .string()
      .nonempty("Phone no is required")
      .transform((val) => {
        // Remove spaces and dashes
        let normalized = val.replace(/[\s-]/g, "");
        // Convert +880 or 880 prefix to 0
        if (normalized.startsWith("+880")) {
          normalized = "0" + normalized.slice(4);
        } else if (normalized.startsWith("880")) {
          normalized = "0" + normalized.slice(3);
        }
        return normalized;
      })
      .refine((val) => /^\d+$/.test(val), {
        message: "Phone no must contain only numeric digits",
      })
      .refine((val) => val.length === 11, {
        message:
          "Phone no must be 11 digits (use format: 01XXXXXXXXX or +8801XXXXXXXXX)",
      }),
    email: z.union([
      z.string().email("Provide a valid email address"),
      z.literal(""),
    ]), // email is optional
    address: z
      .string()
      .nonempty("Address is required")
      .max(150, "Too long, keep it under 150 characters"),
    city: z.string().nonempty("City/District is required"),
    subdistrict: z.string().optional(),
    country: z.enum(["Bangladesh"], {
      errorMap: () => ({ message: "Select an available country" }),
    }),
    notes: z.string().max(300, "Notes too long"), // notes is optional
    shippingType: z.enum(
      ["regular_delivery", "express_delivery", "pickup_point"],
      {
        errorMap: () => ({ message: "Select a valid shipping type" }),
      }
    ),
    paymentMethod: z.enum(["cop", "cod", "bkash", "bank_transfer", ""], {
      errorMap: () => ({ message: "Select a valid payment method" }),
    }),
    pickupPointId: z.string().nullable().optional(), // optional
    transactionId: z.string().nullable().optional(), // optional
    terms: z.boolean().refine((value) => value === true, {
      message: "Accept terms and conditions to proceed",
    }),
  })
  .superRefine((data, ctx) => {
    // Payment method is always required (check for empty string)
    if (data.paymentMethod === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a valid payment method",
        path: ["paymentMethod"],
      });
      return; // Skip further payment method validation if not selected
    }

    // Conditional validation for pickup point
    if (data.shippingType === "pickup_point") {
      if (!data.pickupPointId || data.pickupPointId === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A pickup point must be selected",
          path: ["pickupPointId"],
        });
      }
    }

    // Conditional validation for express delivery payment method
    if (data.shippingType === "express_delivery") {
      if (
        data.paymentMethod !== "bkash" &&
        data.paymentMethod !== "bank_transfer"
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Select bKash or Bank Transfer as payment method for express delivery",
          path: ["paymentMethod"],
        });
      }
    }

    // Conditional validation for regular delivery payment method
    if (data.shippingType === "regular_delivery") {
      if (
        data.paymentMethod !== "cod" &&
        data.paymentMethod !== "bkash" &&
        data.paymentMethod !== "bank_transfer"
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a valid payment method for regular delivery",
          path: ["paymentMethod"],
        });
      }
    }

    // Conditional validation for pickup point payment method
    if (data.shippingType === "pickup_point") {
      if (
        data.paymentMethod !== "cop" &&
        data.paymentMethod !== "bkash" &&
        data.paymentMethod !== "bank_transfer"
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a valid payment method for pickup point",
          path: ["paymentMethod"],
        });
      }
    }

    // Conditional validation for transaction ID (bKash and bank transfer require manual transaction ID)
    if (
      data.paymentMethod === "bkash" ||
      data.paymentMethod === "bank_transfer"
    ) {
      if (
        !data.transactionId ||
        data.transactionId === "" ||
        data.transactionId.trim() === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            data.paymentMethod === "bkash"
              ? "Transaction ID is required for bKash payment"
              : "Transaction ID is required for bank transfer",
          path: ["transactionId"],
        });
      }
    }
  });

export const LoginSchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().nonempty("Password is required"),
  role: z.enum(["USER", "ADMIN", "EMPLOYEE"]).optional(),
});

export const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .nonempty("First name is required")
      .regex(
        /^[A-Za-z\s._]+$/,
        "First name cannot contain numbers or special characters"
      ),
    lastName: z
      .string()
      .regex(
        /^[A-Za-z\s._]*$/,
        "Last name cannot contain numbers or special characters"
      ), // lastName is optional
    email: z.string().email("A valid email is required"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
