"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { getAuthCookie } from "@/utils/cookies";
import { axiosPrivate } from "@/utils/axios/axios";
import {
  DeliveryChargeSettingsType,
  UpdateDeliveryChargeSettingsSchema,
  UpdateDeliveryChargeSettingsType,
} from "@/schemas/admin/setupconfig/deliveryCharge/deliveryChargeSchema";

interface DeliveryChargeFormProps {
  settings: DeliveryChargeSettingsType;
}

export const DeliveryChargeForm = ({ settings }: DeliveryChargeFormProps) => {
  const token = getAuthCookie();

  const form = useForm<UpdateDeliveryChargeSettingsType>({
    resolver: zodResolver(UpdateDeliveryChargeSettingsSchema),
    defaultValues: {
      insideDhakaCharge: settings.insideDhakaCharge,
      outsideDhakaCharge: settings.outsideDhakaCharge,
      additionalChargePerKg: settings.additionalChargePerKg,
      expressInsideDhakaCharge: settings.expressInsideDhakaCharge,
      expressOutsideDhakaCharge: settings.expressOutsideDhakaCharge,
    },
  });

  const onSubmit = async (values: UpdateDeliveryChargeSettingsType) => {
    try {
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axiosPrivate.patch(
        "/settings/delivery-charge",
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        response?.data?.message ?? "Delivery charge settings updated"
      );
      form.reset(values);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ??
        error?.message ??
        "Something went wrong while saving delivery charge settings";
      toast.error(errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 max-w-xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Weight-Based Delivery Charge
            </CardTitle>
            <CardDescription>
              This charge is calculated automatically at checkout based on the
              customer&apos;s delivery city and total order weight, and is
              applied to Regular Delivery orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="insideDhakaCharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Base Charge — Inside Dhaka (BDT)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Applied for orders up to 1kg total weight.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outsideDhakaCharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Base Charge — Outside Dhaka (BDT)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Applied for orders up to 1kg total weight.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalChargePerKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Additional Charge Per Extra Kg (BDT)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Added on top of the base charge for every additional kg
                    beyond the first.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Express Delivery Charge</CardTitle>
            <CardDescription>
              A flat fee applied automatically when a customer selects Express
              Delivery at checkout, based on the delivery zone (regardless of
              order weight).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="expressInsideDhakaCharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Express Charge — Inside Dhaka (BDT)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expressOutsideDhakaCharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Express Charge — Outside Dhaka (BDT)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="text-xs w-fit"
        >
          {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};
