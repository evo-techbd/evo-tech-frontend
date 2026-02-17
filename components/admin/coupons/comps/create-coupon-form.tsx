"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createCoupon, CreateCouponData } from "@/actions/admin/coupons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const couponFormSchema = z.object({
  code: z.string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, and underscores"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("Discount value must be positive"),
  minimumOrderAmount: z.coerce.number().nonnegative("Minimum order amount must be non-negative").optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  maxUsageCount: z.coerce.number().int().positive("Max usage count must be a positive integer"),
  isReusable: z.boolean(),
}).refine((data) => new Date(data.validUntil) > new Date(data.validFrom), {
  message: "Valid until date must be after valid from date",
  path: ["validUntil"],
}).refine((data) => {
  if (data.discountType === "percentage") {
    return data.discountValue <= 100;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountValue"],
});

type CouponFormValues = z.infer<typeof couponFormSchema>;

export const CreateCouponForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: 0,
      minimumOrderAmount: 0,
      validFrom: today,
      validUntil: thirtyDaysLater,
      maxUsageCount: 100,
      isReusable: false,
    },
  });

  const onSubmit = (values: CouponFormValues) => {
    startTransition(async () => {
      const data: CreateCouponData = {
        code: values.code.toUpperCase(),
        discountType: values.discountType,
        discountValue: values.discountValue,
        minimumOrderAmount: values.minimumOrderAmount || undefined,
        validFrom: new Date(values.validFrom).toISOString(),
        validUntil: new Date(values.validUntil).toISOString(),
        maxUsageCount: values.maxUsageCount,
        isReusable: values.isReusable,
      };

      const result = await createCoupon(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Coupon created successfully");
      router.push("/control/coupons");
    });
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Coupon Details</CardTitle>
        <CardDescription>
          Create a new discount coupon for your customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SUMMER2024"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                  </FormControl>
                  <FormDescription>
                    Must be unique. Only uppercase letters, numbers, hyphens, and underscores.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      {form.watch("discountType") === "percentage" ? "Percentage (0-100)" : "Amount in Tk"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="minimumOrderAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Amount (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Minimum order amount required to use this coupon (in Tk). Leave 0 for no minimum.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={today} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} min={form.watch("validFrom") || today} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maxUsageCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Usage Count</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                  </FormControl>
                  <FormDescription>
                    Total number of times this coupon can be used across all users
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isReusable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Reusable by Same User</FormLabel>
                    <FormDescription>
                      Allow users to use this coupon multiple times until the maximum usage is reached
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-stone-900 text-white"
              >
                {isPending ? "Creating..." : "Create Coupon"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/control/coupons")}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
