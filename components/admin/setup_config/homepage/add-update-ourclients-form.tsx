"use client";

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
import { Switch } from "@/components/ui/switch";

import { toast } from "sonner";
import {
  ourClientsAddSchema,
  ourClientsUpdateSchema,
  OurClientsAddFormValues,
  OurClientsUpdateFormValues,
  OurClientsDisplayType,
} from "@/schemas/admin/setupconfig/homepage/ourClientsSection/ourClientsSchema";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  addAClientItem,
  updateAClientItem,
} from "@/store/slices/ourClientsSlice";
import { AddingDialog } from "@/components/dialogs/adding-dialog";
import { EditingDialog } from "@/components/dialogs/editing-dialog";
import React from "react";
import { FileUploader } from "@/components/file_upload/file-uploader";
import Image from "next/image";
import axios from "@/utils/axios/axios";

interface OurClientsFormProps {
  mode?: "create" | "update";
  clientData?: OurClientsDisplayType;
  onSuccess?: () => void;
}

interface UpdateOurClientsFormProps
  extends Omit<OurClientsFormProps, "mode" | "clientData"> {
  clientData: OurClientsDisplayType;
}

const OurClientsForm = ({
  mode = "create",
  clientData,
  onSuccess,
}: OurClientsFormProps) => {
  const isUpdate = mode === "update";
  const dispatch = useDispatch<AppDispatch>();

  const form = useForm<OurClientsAddFormValues | OurClientsUpdateFormValues>({
    resolver: zodResolver(
      isUpdate ? ourClientsUpdateSchema : ourClientsAddSchema
    ),
    defaultValues:
      isUpdate && clientData
        ? {
            brand_name: clientData.brand_name,
            brand_url: clientData.brand_url || "",
            brand_description: clientData.brand_description || "",
            sortorder: clientData.sortorder.toString(),
            is_active: clientData.is_active,
            brand_logo: [], // to replace the old one with a new image
          }
        : {
            brand_name: "",
            brand_url: "",
            brand_description: "",
            sortorder: "",
            is_active: true,
            brand_logo: [],
          },
  });

  const parseBoolean = (value: any, fallback: boolean): boolean => {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "number") {
      return value === 1;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "on"].includes(normalized)) {
        return true;
      }
      if (["false", "0", "no", "off"].includes(normalized)) {
        return false;
      }
    }

    return fallback;
  };

  const mapClientResponse = (client: any): OurClientsDisplayType => {
    const rawSortOrder =
      typeof client?.sortOrder === "number"
        ? client.sortOrder
        : Number(client?.sortOrder ?? 0);

    const safeSortOrder = Number.isNaN(rawSortOrder) ? 0 : rawSortOrder;

    return {
      trustedbyid: client?._id ?? client?.id ?? "",
      brand_name: client?.name ?? "",
      brand_logosrc: client?.logo ?? "",
      brand_url: client?.website ?? null,
      brand_description: client?.description ?? null,
      sortorder: safeSortOrder,
      is_active: parseBoolean(client?.isActive, true),
      last_modified_at: client?.updatedAt
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(client.updatedAt))
        : new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          }).format(new Date()),
    };
  };

  const onSubmit = async (
    values: OurClientsAddFormValues | OurClientsUpdateFormValues
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", values.brand_name.trim());
      formData.append("sortOrder", values.sortorder);
      formData.append("isActive", values.is_active ? "true" : "false");

      const trimmedUrl = values.brand_url?.trim();
      if (trimmedUrl) {
        formData.append("website", trimmedUrl);
      }

      const trimmedDescription = values.brand_description?.trim();
      if (trimmedDescription) {
        formData.append("description", trimmedDescription);
      }

      if (values.brand_logo instanceof File) {
        formData.append("logo", values.brand_logo);
      }

      const endpoint = isUpdate
        ? `/clients/${clientData!.trustedbyid}`
        : `/clients`;

      const response = isUpdate
        ? await axios.patch(endpoint, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
        : await axios.post(endpoint, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

      const clientPayload = response?.data?.data;

      if (!clientPayload) {
        throw new Error("Client response payload is empty");
      }

      const mappedClient = mapClientResponse(clientPayload);

      if (isUpdate) {
        dispatch(updateAClientItem(mappedClient));
      } else {
        dispatch(addAClientItem(mappedClient));
      }

      toast.success(isUpdate ? `Client item updated` : `Client item created`);

      if (isUpdate) {
        form.reset({
          brand_name: mappedClient.brand_name,
          brand_url: mappedClient.brand_url ?? "",
          brand_description: mappedClient.brand_description ?? "",
          sortorder: mappedClient.sortorder.toString(),
          is_active: mappedClient.is_active,
          brand_logo: [],
        });
      } else {
        form.reset({
          brand_name: "",
          brand_url: "",
          brand_description: "",
          sortorder: "",
          is_active: true,
          brand_logo: [],
        });
      }

      onSuccess?.();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div className="max-h-[18.75rem] overflow-y-auto p-1.5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="brand_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Brand Name*
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter brand name"
                    {...field}
                    disabled={form.formState.isSubmitting}
                    className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Current Brand Logo (if updating) */}
          {isUpdate && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-left">
                Current Brand Logo
              </p>
              <div className={`relative w-full h-24 group`}>
                <Image
                  src={clientData!.brand_logosrc}
                  alt="current brand logo"
                  fill
                  sizes="100%"
                  className="object-contain object-center rounded-md bg-white"
                />
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="brand_logo"
            render={({ field }) => (
              <FormItem>
                <p className="block text-xs font-medium text-left cursor-default">
                  {!isUpdate
                    ? "Brand Logo*"
                    : "New Brand Logo (Replace the old one)"}
                </p>
                <FormControl>
                  <div className="mt-1 block">
                    <FileUploader
                      value={field.value}
                      onValueChange={field.onChange}
                      maxFileCount={1}
                      maxSize={10 * 1024 * 1024} // 10MB
                      className="lg:min-h-32"
                      accept={{
                        "image/jpeg": [],
                        "image/png": [],
                        "image/webp": [],
                      }}
                      disabled={form.formState.isSubmitting}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortorder"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Sorting Order*
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter order (numeric)"
                    {...field}
                    disabled={form.formState.isSubmitting}
                    className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Brand URL (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter brand website URL"
                    {...field}
                    disabled={form.formState.isSubmitting}
                    className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Brand Description (Optional)
                </FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Short description about the client"
                    {...field}
                    disabled={form.formState.isSubmitting}
                    rows={3}
                    className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs resize-y"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start justify-between rounded-lg border px-3 py-2">
                <div className="space-y-0.5">
                  <FormLabel className="text-xs font-medium">
                    Active Status
                  </FormLabel>
                  <p className="text-[0.625rem] leading-3 text-muted-foreground">
                    {`(Toggles the visibility)`}
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="pt-3 w-full flex justify-end gap-2">
            <Button
              aria-label="reset form fields"
              type="button"
              disabled={form.formState.isSubmitting}
              className="px-5 py-2 text-stone-800 rounded text-xs md:text-xs disabled:bg-stone-300 disabled:text-stone-500"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button
              aria-label={
                isUpdate ? "update client item" : "create client item"
              }
              type="submit"
              disabled={form.formState.isSubmitting}
              className="px-5 py-2 bg-stone-800 text-white rounded text-xs md:text-xs hover:bg-stone-900 disabled:bg-stone-600"
            >
              {form.formState.isSubmitting
                ? isUpdate
                  ? "Updating..."
                  : "Creating..."
                : isUpdate
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

// Add Our Clients Form
const AddOurClientsForm = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSuccess = () => {
    setIsOpen(false); // close the dialog on success
  };

  return (
    <AddingDialog
      buttonText="Add New Client"
      dialogTitle="Create New Client"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <OurClientsForm mode="create" onSuccess={handleSuccess} />
    </AddingDialog>
  );
};

// Update Our Clients Form
const UpdateOurClientsForm = ({ clientData }: UpdateOurClientsFormProps) => {
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);

  const handleSuccess = () => {
    setIsUpdateOpen(false); // close the dialog on success
  };

  return (
    <EditingDialog
      buttonText={"Update Client"}
      dialogTitle={"Update Client"}
      open={isUpdateOpen}
      onOpenChange={setIsUpdateOpen}
    >
      <OurClientsForm
        mode="update"
        clientData={clientData}
        onSuccess={handleSuccess}
      />
    </EditingDialog>
  );
};

export { AddOurClientsForm, UpdateOurClientsForm };
