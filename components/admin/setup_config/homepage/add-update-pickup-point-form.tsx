"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { getAuthCookie } from "@/utils/cookies";
import { axiosPrivate } from "@/utils/axios/axios";
import {
  CreatePickupPointSchema,
  UpdatePickupPointSchema,
  type CreatePickupPointType,
  type UpdatePickupPointType,
  PickupPointDisplayType,
  PickupPointListSchema,
} from "@/schemas/admin/setupconfig/homepage/pickupPoint/pickupPointSchema";
import { AppDispatch } from "@/store/store";
import { setPickupPointsList } from "@/store/slices/pickupPointSlice";
import { AddingDialog } from "@/components/dialogs/adding-dialog";
import { EditingDialog } from "@/components/dialogs/editing-dialog";

type PickupPointFormValues = CreatePickupPointType | UpdatePickupPointType;

const buildDefaultValues = (
  pickupPoint?: PickupPointDisplayType | null
): PickupPointFormValues => ({
  name: pickupPoint?.name ?? "",
  address: pickupPoint?.address ?? "",
  city: pickupPoint?.city ?? "",
  phone: pickupPoint?.phone ?? "",
  hours: pickupPoint?.hours ?? "10:00 AM - 6:00 PM",
  sortOrder: pickupPoint ? pickupPoint.sortOrder : 0,
  isActive: pickupPoint?.isActive ?? true,
});

interface PickupPointFormProps {
  mode?: "create" | "update";
  pickupPointData?: PickupPointDisplayType;
  onSuccess?: () => void;
}

interface UpdatePickupPointFormProps
  extends Omit<PickupPointFormProps, "mode" | "pickupPointData"> {
  pickupPointData: PickupPointDisplayType;
}

const PickupPointForm = ({
  mode = "create",
  pickupPointData,
  onSuccess,
}: PickupPointFormProps) => {
  const isUpdate = mode === "update";
  const dispatch = useDispatch<AppDispatch>();
  const token = getAuthCookie();

  const form = useForm<PickupPointFormValues>({
    resolver: zodResolver(
      isUpdate ? UpdatePickupPointSchema : CreatePickupPointSchema
    ),
    defaultValues: buildDefaultValues(pickupPointData ?? null),
  });

  const refreshPickupPoints = React.useCallback(async () => {
    try {
      const listResponse = await axiosPrivate.get("/pickup-points", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const parsedList = PickupPointListSchema.parse(
        listResponse.data?.data ?? []
      );
      dispatch(
        setPickupPointsList({
          data: parsedList,
          fetchedStatus: true,
        })
      );
    } catch (error) {
      console.error("Failed to refresh pickup points", error);
    }
  }, [dispatch, token]);

  const onSubmit = async (values: PickupPointFormValues) => {
    try {
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Type guard to ensure required fields exist
      if (!values.name || !values.address) {
        toast.error("Name and address are required");
        return;
      }

      const payload = {
        name: values.name.trim(),
        address: values.address.trim(),
        city: values.city?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        hours: values.hours?.trim() || "10:00 AM - 6:00 PM",
        sortOrder: values.sortOrder ?? 0,
        isActive: values.isActive ?? true,
      };

      const endpoint = isUpdate
        ? `/pickup-points/${pickupPointData!._id}`
        : "/pickup-points";
      const response = await (isUpdate
        ? axiosPrivate.patch(endpoint, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        : axiosPrivate.post(endpoint, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }));

      const message =
        response?.data?.message ??
        (isUpdate ? "Pickup point updated" : "Pickup point created");
      toast.success(message);

      await refreshPickupPoints();

      if (!isUpdate) {
        form.reset(buildDefaultValues());
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to submit pickup point", error);
      const errorMessage =
        error?.response?.data?.message ??
        error?.message ??
        "Something went wrong while saving the pickup point";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-h-[18.75rem] overflow-y-auto p-1.5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Pickup Point Name*
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter pickup point name"
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Address*
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter full address"
                    {...field}
                    className="text-xs min-h-[60px]"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-xs font-medium text-left">
                    City
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter city"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-xs font-medium text-left">
                    Phone
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter phone number"
                      {...field}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-xs font-medium text-left">
                    Business Hours
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 10:00 AM - 6:00 PM"
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
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-xs font-medium text-left">
                    Sort Order
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full text-xs"
          >
            {form.formState.isSubmitting
              ? isUpdate
                ? "Updating..."
                : "Creating..."
              : isUpdate
              ? "Update Pickup Point"
              : "Add Pickup Point"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export const AddPickupPointForm = () => {
  const [showDialog, setShowDialog] = React.useState(false);

  return (
    <AddingDialog
      buttonText="Add New Pickup Point"
      dialogTitle="Create New Pickup Point"
      open={showDialog}
      onOpenChange={setShowDialog}
    >
      <PickupPointForm
        mode="create"
        onSuccess={() => setShowDialog(false)}
      />
    </AddingDialog>
  );
};

export const UpdatePickupPointForm = ({
  pickupPointData,
  onSuccess,
}: UpdatePickupPointFormProps) => {
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);

  const handleSuccess = () => {
    setIsUpdateOpen(false);
    onSuccess?.();
  };

  return (
    <EditingDialog
      buttonText="Update Pickup Point"
      dialogTitle="Update Pickup Point"
      open={isUpdateOpen}
      onOpenChange={setIsUpdateOpen}
    >
      <PickupPointForm
        mode="update"
        pickupPointData={pickupPointData}
        onSuccess={handleSuccess}
      />
    </EditingDialog>
  );
};
