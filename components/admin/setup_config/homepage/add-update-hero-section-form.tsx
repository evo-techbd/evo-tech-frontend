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
import { toast } from "sonner";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { getAuthCookie, getCurrentUser } from "@/utils/cookies";
import { axiosPrivate } from "@/utils/axios/axios";
import {
  heroAddSchema,
  heroUpdateSchema,
  HeroAddFormValues,
  HeroUpdateFormValues,
  HeroSectionDisplayType,
  HeroSectionListSchema,
  HeroSectionSchema,
} from "@/schemas/admin/setupconfig/homepage/heroSection/heroSchema";
import { AppDispatch } from "@/store/store";
import { setHeroSectionsList } from "@/store/slices/heroSectionSlice";
import { AddingDialog } from "@/components/dialogs/adding-dialog";
import { EditingDialog } from "@/components/dialogs/editing-dialog";
import { FileUploader } from "@/components/file_upload/file-uploader";

type HeroFormValues = HeroAddFormValues | HeroUpdateFormValues;

const buildDefaultValues = (
  section?: HeroSectionDisplayType | null
): HeroFormValues => ({
  title: section?.title ?? "",
  subtitle: section?.subtitle ?? "",
  description: section?.description ?? "",
  more_text: section?.more_text ?? "",
  button_text: section?.button_text ?? "",
  button_url: section?.button_url ?? "",
  sortOrder: section ? section.sortOrder.toString() : "",
  image: [] as unknown as File[],
});

const appendIfDefined = (
  formData: FormData,
  key: string,
  value?: string | null
) => {
  if (value === undefined || value === null) {
    return;
  }

  const sanitized = typeof value === "string" ? value.trim() : value;
  const serialized = String(sanitized);
  formData.append(key, serialized);
};

interface HeroSectionFormProps {
  mode?: "create" | "update";
  sectionData?: HeroSectionDisplayType;
  onSuccess?: () => void;
}

interface UpdateHeroSectionFormProps
  extends Omit<HeroSectionFormProps, "mode" | "sectionData"> {
  sectionData: HeroSectionDisplayType;
}

const HeroSectionForm = ({
  mode = "create",
  sectionData,
  onSuccess,
}: HeroSectionFormProps) => {
  const isUpdate = mode === "update";
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = getCurrentUser();
  const token = getAuthCookie();

  const form = useForm<HeroFormValues>({
    resolver: zodResolver(isUpdate ? heroUpdateSchema : heroAddSchema),
    defaultValues: buildDefaultValues(sectionData ?? null),
  });

  const refreshHeroSections = React.useCallback(async () => {
    try {
      const listResponse = await axiosPrivate.get("/banners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const parsedList = HeroSectionListSchema.parse(
        listResponse.data?.data ?? []
      );
      dispatch(
        setHeroSectionsList({
          data: parsedList,
          fetchedStatus: true,
        })
      );
    } catch (error) {
      console.error("Failed to refresh hero sections", error);
    }
  }, [dispatch, token]);

  const onSubmit = async (values: HeroFormValues) => {
    const formData = new FormData();

    appendIfDefined(formData, "title", values.title.trim());
    appendIfDefined(formData, "subtitle", values.subtitle ?? "");
    appendIfDefined(formData, "description", values.description ?? "");
    appendIfDefined(formData, "more_text", values.more_text ?? "");
    appendIfDefined(formData, "button_text", values.button_text ?? "");
    appendIfDefined(formData, "button_url", values.button_url ?? "");

    const numericSortOrder = Number(values.sortOrder);
    formData.append(
      "sortOrder",
      Number.isNaN(numericSortOrder) ? "0" : String(numericSortOrder)
    );

    const selectedImage =
      values.image instanceof File
        ? values.image
        : Array.isArray(values.image) && values.image.length > 0
        ? values.image[0]
        : undefined;

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const endpoint = isUpdate ? `/banners/${sectionData!._id}` : "/banners";
      const response = await (isUpdate
        ? axiosPrivate.patch(endpoint, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          })
        : axiosPrivate.post(endpoint, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }));

      const message =
        response?.data?.message ??
        (isUpdate ? "Hero section updated" : "Hero section created");
      toast.success(message);

      await refreshHeroSections();

      if (isUpdate) {
        const parsed = HeroSectionSchema.safeParse(response?.data?.data);
        const updatedSection = parsed.success
          ? parsed.data
          : sectionData ?? null;
        form.reset(buildDefaultValues(updatedSection));
      } else {
        form.reset(buildDefaultValues());
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to submit hero section", error);
      const errorMessage =
        error?.response?.data?.message ??
        error?.message ??
        "Something went wrong while saving the hero section";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-h-[18.75rem] overflow-y-auto p-1.5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Title*
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter hero section title"
                    {...field}
                    disabled={form.formState.isSubmitting}
                    className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Current Image (if updating) */}
          {isUpdate && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-left">Current Image</p>
              <div className={`relative w-full h-24 group`}>
                <Image
                  src={sectionData!.image}
                  alt="current hero section image"
                  fill
                  sizes="100%"
                  className="object-cover object-center rounded-md"
                />
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <p className="block text-xs font-medium text-left cursor-default">
                  {!isUpdate
                    ? "Hero Artwork (PNG preferred)*"
                    : "New Image (Optional)"}
                </p>
                <FormControl>
                  <div className="mt-1 block">
                    <FileUploader
                      value={
                        Array.isArray(field.value)
                          ? field.value
                          : field.value
                          ? [field.value]
                          : []
                      }
                      onValueChange={field.onChange}
                      maxFileCount={1}
                      maxSize={3 * 1024 * 1024} // 3MB
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
                <span className="text-[10px] text-stone-400">
                  Upload a transparent PNG so the overlapping effect looks clean
                  (max 3 MB).
                </span>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
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
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Subtitle (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter subtitle"
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Description (Optional)
                </FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    placeholder="Enter main hero description"
                    disabled={form.formState.isSubmitting}
                    rows={4}
                    className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs resize-y min-h-[96px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="more_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  More Text (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter additional text"
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
            name="button_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Button Text (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter button text"
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
            name="button_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Button URL (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter button URL"
                    {...field}
                    disabled={form.formState.isSubmitting}
                    className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs"
                  />
                </FormControl>
                <FormMessage />
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
              onClick={() =>
                form.reset(buildDefaultValues(sectionData ?? null))
              }
            >
              Reset
            </Button>
            <Button
              aria-label={
                isUpdate ? "update hero section" : "create hero section"
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

// Add Hero Section Form
const AddHeroSectionForm = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSuccess = () => {
    setIsOpen(false); // close the dialog on success
  };

  return (
    <AddingDialog
      buttonText="Add New Hero Item"
      dialogTitle="Create New Hero Item"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <HeroSectionForm mode="create" onSuccess={handleSuccess} />
    </AddingDialog>
  );
};

// Update Hero Section Form
const UpdateHeroSectionForm = ({ sectionData }: UpdateHeroSectionFormProps) => {
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);

  const handleSuccess = () => {
    setIsUpdateOpen(false); // close the dialog on success
  };

  return (
    <EditingDialog
      buttonText={"Update Hero Item"}
      dialogTitle={"Update Hero Item"}
      open={isUpdateOpen}
      onOpenChange={setIsUpdateOpen}
    >
      <HeroSectionForm
        mode="update"
        sectionData={sectionData}
        onSuccess={handleSuccess}
      />
    </EditingDialog>
  );
};

export { AddHeroSectionForm, UpdateHeroSectionForm };
