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
import { toast } from "sonner";
import axios from "@/utils/axios/axios";
import {
  featuredAddSchema,
  featuredUpdateSchema,
  FeaturedAddFormValues,
  FeaturedUpdateFormValues,
  FeaturedSectionDisplayType,
} from "@/schemas/admin/setupconfig/homepage/featuredSections/featuredSchema";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { AddingDialog } from "@/components/dialogs/adding-dialog";
import { EditingDialog } from "@/components/dialogs/editing-dialog";
import React from "react";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import Link from "next/link";

interface FeaturedSectionFormProps {
  mode?: "create" | "update";
  sectionData?: FeaturedSectionDisplayType;
  onSuccess?: () => void;
}

interface UpdateFeaturedSectionFormProps
  extends Omit<FeaturedSectionFormProps, "mode" | "sectionData"> {
  sectionData: FeaturedSectionDisplayType;
}

const FeaturedSectionForm = ({
  mode = "create",
  sectionData,
  onSuccess,
}: FeaturedSectionFormProps) => {
  const isUpdate = mode === "update";
  const dispatch = useDispatch<AppDispatch>();
  const { getCategoriesForSelect } = useTaxonomy();
  const categories = getCategoriesForSelect();

  const form = useForm<FeaturedAddFormValues | FeaturedUpdateFormValues>({
    resolver: zodResolver(isUpdate ? featuredUpdateSchema : featuredAddSchema),
    defaultValues:
      isUpdate && sectionData
        ? {
            title: sectionData.title,
            view_more_url: sectionData.view_more_url || "",
            sortorder: sectionData.sortorder.toString(),
          }
        : {
            title: "",
            view_more_url: "",
            sortorder: "",
          },
  });

  const onSubmit = async (
    values: FeaturedAddFormValues | FeaturedUpdateFormValues
  ) => {
    // Get category ID from slug for backend
    const selectedCategory = categories.find(
      (cat) => cat.value === values.view_more_url
    );

    const payload = {
      title: values.title,
      sortOrder: parseInt(values.sortorder, 10),
      sectionType: "custom",
      ...(selectedCategory && {
        category: selectedCategory.id,
      }),
    };

    const url = isUpdate
      ? `/products/featured-sections/${sectionData!.sectionid}`
      : `/products/featured-sections`;

    const method = isUpdate ? "PATCH" : "POST";

    const response = await axios({
      method,
      url,
      data: payload,
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
      withCredentials: true,
    })
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        if (error.response) {
          toast.error(error.response.data.message || "Something went wrong");
        } else {
          toast.error("Something went wrong");
        }
        return null;
      });

    if (response && response.data) {
      toast.success(isUpdate ? `Section updated` : `Section created`);
      // Trigger page refresh to get updated data
      form.reset();
      onSuccess?.();
      window.location.reload();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-xs font-medium text-left">
                Section Title*
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter section title"
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
          name="view_more_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-xs font-medium text-left">
                View More URL (Optional)
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={form.formState.isSubmitting}
                >
                  <SelectTrigger className="w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-300 focus:ring-stone-200">
                    <SelectValue
                      placeholder={
                        <span
                          className={field.value === "" ? "text-stone-400" : ""}
                        >
                          Select a category
                        </span>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-xs text-stone-500 py-2">
                        <p>No categories found</p>
                        <Link
                          href="/control/categories"
                          className="text-evoAdminAccent hover:underline"
                        >
                          Add a category
                        </Link>
                      </div>
                    )}
                  </SelectContent>
                </Select>
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
            aria-label={isUpdate ? "update section" : "create section"}
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
  );
};

// Add Featured Section Form
const AddFeaturedSectionForm = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSuccess = () => {
    setIsOpen(false); // close the dialog on success
  };

  return (
    <AddingDialog
      buttonText="Add New Section"
      dialogTitle="Create New Section"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <FeaturedSectionForm mode="create" onSuccess={handleSuccess} />
    </AddingDialog>
  );
};

// Update Featured Section Form
const UpdateFeaturedSectionForm = ({
  sectionData,
}: UpdateFeaturedSectionFormProps) => {
  const [isUpdateOpen, setIsUpdateOpen] = React.useState(false);

  const handleSuccess = () => {
    setIsUpdateOpen(false); // close the dialog on success
  };

  return (
    <EditingDialog
      buttonText={"Update Section"}
      dialogTitle={"Update Section"}
      open={isUpdateOpen}
      onOpenChange={setIsUpdateOpen}
    >
      <FeaturedSectionForm
        mode="update"
        sectionData={sectionData}
        onSuccess={handleSuccess}
      />
    </EditingDialog>
  );
};

export { AddFeaturedSectionForm, UpdateFeaturedSectionForm };
