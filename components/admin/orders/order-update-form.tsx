"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  orderStatusesUpdateSchema,
  OrderStatusesUpdateType,
  OrderWithItemsType,
} from "@/schemas/admin/sales/orderSchema";
import axios from "@/utils/axios/axios";

interface OrderUpdateFormProps {
  orderData: OrderWithItemsType;
  onSuccess?: (orderData: OrderWithItemsType) => void;
}

const OrderUpdateForm = ({ orderData, onSuccess }: OrderUpdateFormProps) => {
  const router = useRouter();
  const [payAmount, setPayAmount] = useState<number>(0);

  const form = useForm<OrderStatusesUpdateType>({
    resolver: zodResolver(orderStatusesUpdateSchema),
    defaultValues: {
      orderStatus: orderData.orderStatus,
      paymentStatus: orderData.paymentStatus,
      trackingCode: orderData.trackingCode || "",
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      deliveryCharge: orderData.deliveryCharge,
      additionalCharge: orderData.additionalCharge,
      totalPayable: orderData.totalPayable,
      amountPaid: orderData.amountPaid || 0,
    },
  });

  // Watch for changes in totalPayable and amountPaid
  const totalPayable = form.watch("totalPayable") ?? 0;
  const amountPaid = form.watch("amountPaid") ?? 0;

  // Calculate due amount (accounting for the pay amount that will be added)
  const amountDue = totalPayable - amountPaid - payAmount;

  const onSubmit = async (data: OrderStatusesUpdateType) => {
    try {
      // Filter out undefined values and empty strings for trackingCode
      const updateData: any = {};
      if (data.orderStatus !== undefined)
        updateData.orderStatus = data.orderStatus;
      if (data.paymentStatus !== undefined)
        updateData.paymentStatus = data.paymentStatus;
      if (data.trackingCode !== undefined) {
        updateData.trackingCode = data.trackingCode || null;
      }
      if (data.subtotal !== undefined) updateData.subtotal = data.subtotal;
      if (data.discount !== undefined) updateData.discount = data.discount;
      if (data.deliveryCharge !== undefined)
        updateData.deliveryCharge = data.deliveryCharge;
      if (data.additionalCharge !== undefined)
        updateData.additionalCharge = data.additionalCharge;
      if (data.totalPayable !== undefined)
        updateData.totalPayable = data.totalPayable;
      if (data.amountPaid !== undefined) {
        // Add the pay amount to the current paid amount
        const finalAmountPaid = data.amountPaid + (payAmount || 0);
        updateData.amountPaid = finalAmountPaid;

        // Auto-calculate payment status based on amount paid
        const total = data.totalPayable || orderData.totalPayable;
        const paid = finalAmountPaid;

        if (paid >= total) {
          updateData.paymentStatus = "paid";
        } else if (paid > 0) {
          updateData.paymentStatus = "partial";
        } else {
          updateData.paymentStatus = "pending";
        }
      }

      const orderId = orderData._id || orderData.orderNumber;

      // Use relative URL for API route (works in both dev and production)
      const response = await axios.put(
        `/api/admin/orders/${orderId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );


      if (response.data.success) {
        toast.success(response.data.message || "Order updated successfully");

        // Reset pay amount field
        setPayAmount(0);

        // Refresh the page data
        router.refresh();

        // Call onSuccess if provided
        if (onSuccess && response.data.data) {
          onSuccess(response.data.data);
        }
      } else {
        toast.error(response.data.message || "Failed to update order");
      }
    } catch (error: any) {
      console.error("❌ Update error:", error.response?.data || error.message);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update order. Please try again later.");
      }
    }
  };

  return (
    <div className="w-full bg-stone-50 rounded-lg border p-6 mb-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <FormField
              control={form.control}
              name="orderStatus"
              render={({ field }) => (
                <FormItem>
                  <p className="text-xs font-medium whitespace-nowrap">
                    Order Status
                  </p>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="text-xs bg-white">
                        <SelectValue placeholder="Select order status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
                  <p className="text-xs font-medium whitespace-nowrap">
                    Payment Status
                  </p>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="text-xs bg-white">
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trackingCode"
              render={({ field }) => (
                <FormItem>
                  <p className="text-xs font-medium whitespace-nowrap">
                    Tracking Code
                  </p>
                  <FormControl>
                    <Input
                      placeholder="Enter tracking code"
                      {...field}
                      value={field.value || ""}
                      disabled={form.formState.isSubmitting}
                      className="text-xs bg-white placeholder:text-stone-400 placeholder:text-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-3">Payment Details</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <FormField
                control={form.control}
                name="totalPayable"
                render={({ field }) => (
                  <FormItem>
                    <p className="text-xs font-medium whitespace-nowrap">
                      Total (BDT )
                    </p>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        value={field.value || 0}
                        disabled={form.formState.isSubmitting}
                        className="text-xs bg-white placeholder:text-stone-400 placeholder:text-xs font-semibold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountPaid"
                render={({ field }) => (
                  <FormItem>
                    <p className="text-xs font-medium whitespace-nowrap text-green-700">
                      Paid (BDT )
                    </p>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        value={field.value || 0}
                        disabled={form.formState.isSubmitting}
                        className="text-xs bg-white placeholder:text-stone-400 placeholder:text-xs font-medium text-green-700 border-green-300 focus-visible:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <p className="text-xs font-medium whitespace-nowrap text-red-700 mb-2">
                  Due (BDT )
                </p>
                <div className="h-9 px-3 py-2 border border-red-300 rounded-md bg-red-50 flex items-center">
                  <span className="text-xs font-medium text-red-700">
                    {amountDue >= 0 ? amountDue.toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium whitespace-nowrap text-blue-700 mb-2">
                  Pay (BDT )
                </p>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={payAmount || ""}
                  onChange={(e) =>
                    setPayAmount(parseFloat(e.target.value) || 0)
                  }
                  disabled={form.formState.isSubmitting}
                  className="text-xs bg-white placeholder:text-stone-400 placeholder:text-xs font-medium text-blue-700 border-blue-300 focus-visible:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="subtotal"
                render={({ field }) => (
                  <FormItem>
                    <p className="text-xs font-medium whitespace-nowrap">
                      Subtotal (BDT )
                    </p>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        value={field.value || 0}
                        disabled={form.formState.isSubmitting}
                        className="text-xs bg-white placeholder:text-stone-400 placeholder:text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <p className="text-xs font-medium whitespace-nowrap">
                      Discount (BDT )
                    </p>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        value={field.value || 0}
                        disabled={form.formState.isSubmitting}
                        className="text-xs bg-white placeholder:text-stone-400 placeholder:text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryCharge"
                render={({ field }) => (
                  <FormItem>
                    <p className="text-xs font-medium whitespace-nowrap">
                      Delivery (BDT )
                    </p>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        value={field.value || 0}
                        disabled={form.formState.isSubmitting}
                        className="text-xs bg-white placeholder:text-stone-400 placeholder:text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalCharge"
                render={({ field }) => (
                  <FormItem>
                    <p className="text-xs font-medium whitespace-nowrap">
                      Additional (BDT )
                    </p>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        value={field.value || 0}
                        disabled={form.formState.isSubmitting}
                        className="text-xs bg-white placeholder:text-stone-400 placeholder:text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex gap-2 items-center justify-end py-0.5">
            <Button
              type="submit"
              size="sm"
              variant="default"
              className="min-w-32"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export { OrderUpdateForm };
