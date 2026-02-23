"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import {
  createBrandSchema,
  updateBrandSchema,
  CreateBrandInput,
  UpdateBrandInput,
  BrandTableType,
  CategoryTableType,
  SubcategoryTableType,
} from "@/schemas/admin/product/taxonomySchemas";
import { AddingDialog } from "@/components/dialogs/adding-dialog";
import { EditingDialog } from "@/components/dialogs/editing-dialog";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { addABrand, updateABrand } from "@/store/slices/brandSlice";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import axios from "@/utils/axios/axios";

interface BrandFormProps {
  mode?: "create" | "update";
  brandData?: BrandTableType;
  onSuccess?: () => void;
}

interface UpdateBrandFormProps
  extends Omit<BrandFormProps, "mode" | "brandData"> {
  brandData: BrandTableType;
}

// Extended types for field arrays to include the actual entity ID
interface CategoryFieldType {
  categoryId: string; // The actual category ID from API
  sortorder: number;
}

interface SubcategoryFieldType {
  subcategoryId: string; // The actual subcategory ID from API
  sortorder: number;
}

// Extended form types that use custom field structure
interface ExtendedCreateBrandInput
  extends Omit<CreateBrandInput, "categories" | "subcategories"> {
  categories: CategoryFieldType[];
  subcategories: SubcategoryFieldType[];
}

interface ExtendedUpdateBrandInput
  extends Omit<UpdateBrandInput, "categories" | "subcategories"> {
  categories: CategoryFieldType[];
  subcategories: SubcategoryFieldType[];
}

// Extended Zod schemas that match the field array structure for form validation
const extendedCreateBrandSchema = createBrandSchema.extend({
  categories: z
    .array(
      z.object({
        categoryId: z.string().nonempty({ message: "Category ID is required" }),
        sortorder: z.number(),
      })
    )
    .refine(
      (categories: { categoryId: string; sortorder: number }[]) =>
        new Set(categories.map((c) => c.categoryId)).size === categories.length,
      "Duplicate categories are not allowed."
    )
    .superRefine(
      (
        categories: { categoryId: string; sortorder: number }[],
        ctx: z.RefinementCtx
      ) => {
        categories.forEach((c, idx) => {
          if (c.sortorder !== idx + 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Category at position ${idx + 1} should have sortorder ${
                idx + 1
              }`,
              path: ["categories", idx, "sortorder"],
            });
          }
        });
      }
    ),
  subcategories: z
    .array(
      z.object({
        subcategoryId: z
          .string()
          .nonempty({ message: "Subcategory ID is required" }),
        sortorder: z.number(),
      })
    )
    .refine(
      (subcategories: { subcategoryId: string; sortorder: number }[]) =>
        new Set(subcategories.map((sc) => sc.subcategoryId)).size ===
        subcategories.length,
      "Duplicate subcategories are not allowed."
    )
    .superRefine(
      (
        subcategories: { subcategoryId: string; sortorder: number }[],
        ctx: z.RefinementCtx
      ) => {
        subcategories.forEach((sc, idx) => {
          if (sc.sortorder !== idx + 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Subcategory at position ${
                idx + 1
              } should have sortorder ${idx + 1}`,
              path: ["subcategories", idx, "sortorder"],
            });
          }
        });
      }
    ),
});

const extendedUpdateBrandSchema = updateBrandSchema.extend({
  categories: z
    .array(
      z.object({
        categoryId: z.string().nonempty({ message: "Category ID is required" }),
        sortorder: z.number(),
      })
    )
    .refine(
      (categories: { categoryId: string; sortorder: number }[]) =>
        new Set(categories.map((c) => c.categoryId)).size === categories.length,
      "Duplicate categories are not allowed."
    )
    .superRefine(
      (
        categories: { categoryId: string; sortorder: number }[],
        ctx: z.RefinementCtx
      ) => {
        categories.forEach((c, idx) => {
          if (c.sortorder !== idx + 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Category at position ${idx + 1} should have sortorder ${
                idx + 1
              }`,
              path: ["categories", idx, "sortorder"],
            });
          }
        });
      }
    ),
  subcategories: z
    .array(
      z.object({
        subcategoryId: z
          .string()
          .nonempty({ message: "Subcategory ID is required" }),
        sortorder: z.number(),
      })
    )
    .refine(
      (subcategories: { subcategoryId: string; sortorder: number }[]) =>
        new Set(subcategories.map((sc) => sc.subcategoryId)).size ===
        subcategories.length,
      "Duplicate subcategories are not allowed."
    )
    .superRefine(
      (
        subcategories: { subcategoryId: string; sortorder: number }[],
        ctx: z.RefinementCtx
      ) => {
        subcategories.forEach((sc, idx) => {
          if (sc.sortorder !== idx + 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Subcategory at position ${
                idx + 1
              } should have sortorder ${idx + 1}`,
              path: ["subcategories", idx, "sortorder"],
            });
          }
        });
      }
    ),
});

// Sortable item component for drag and drop
const SortableItem = ({
  id,
  index,
  name,
  type,
  onRemove,
}: {
  id: string;
  index: number;
  name: string;
  type: "category" | "subcategory";
  onRemove: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <Badge variant="inprogress" className="text-xs">
        {index + 1}
      </Badge>
      <span className="flex-1 text-sm">{name}</span>
      <Badge variant="outline" className="text-[0.625rem] leading-none py-1">
        {type}
      </Badge>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

const BrandForm = ({
  mode = "create",
  brandData,
  onSuccess,
}: BrandFormProps) => {
  const isUpdate = mode === "update";
  const dispatch = useDispatch<AppDispatch>();

  // State for available categories and subcategories
  const [availableCategories, setAvailableCategories] = useState<
    CategoryTableType[]
  >([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<
    SubcategoryTableType[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Form setup with extended types
  const form = useForm<ExtendedCreateBrandInput | ExtendedUpdateBrandInput>({
    resolver: zodResolver(
      isUpdate ? extendedUpdateBrandSchema : extendedCreateBrandSchema
    ),
    defaultValues:
      isUpdate && brandData
        ? {
            name: brandData.name,
            slug: brandData.slug,
            active: brandData.active,
            categories: [],
            subcategories: [],
          }
        : {
            name: "",
            slug: "",
            active: true,
            categories: [],
            subcategories: [],
          },
  });

  // Field arrays for categories and subcategories with proper typing
  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
    move: moveCategory,
  } = useFieldArray({
    control: form.control,
    name: "categories",
  });

  const {
    fields: subcategoryFields,
    append: appendSubcategory,
    remove: removeSubcategory,
    move: moveSubcategory,
  } = useFieldArray({
    control: form.control,
    name: "subcategories",
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch categories and subcategories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [categoriesRes, subcategoriesRes] = await Promise.all([
          axios.get(`/categories`),
          axios.get(`/subcategories`),
        ]);

        // Transform backend data to frontend format (map _id to id, isActive to active)
        const categories = (categoriesRes.data.data || []).map(
          (category: any) => ({
            id: category._id,
            name: category.name,
            slug: category.slug,
            sortorder: category.sortOrder || 0,
            active: category.isActive,
            url: category.url || `/${category.slug}`,
            image: category.image,
            subcategories_count: category.subcategories_count || 0,
            brands_count: category.brands_count || 0,
            created_at: category.createdAt,
            updated_at: category.updatedAt,
          })
        );

        const subcategories = (subcategoriesRes.data.data || [])
          .filter((subcategory: any) => subcategory.category != null)
          .map((subcategory: any) => ({
            id: subcategory._id,
            name: subcategory.name,
            slug: subcategory.slug,
            sortorder: subcategory.sortOrder || 0,
            active: subcategory.isActive,
            category: {
              id:
                typeof subcategory.category === "object"
                  ? subcategory.category._id
                  : subcategory.category,
              name:
                typeof subcategory.category === "object"
                  ? subcategory.category.name
                  : "",
              slug:
                typeof subcategory.category === "object"
                  ? subcategory.category.slug
                  : "",
              active:
                typeof subcategory.category === "object"
                  ? subcategory.category.isActive
                  : true,
            },
            url: subcategory.url || `/${subcategory.slug}`,
            brands_count: subcategory.brands_count || 0,
            created_at: subcategory.createdAt,
            updated_at: subcategory.updatedAt,
          }));

        setAvailableCategories(categories);
        setAvailableSubcategories(subcategories);
      } catch (error: any) {
        toast.error("Failed to load categories and subcategories");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Populate form with existing brand data when in update mode
  useEffect(() => {
    if (
      isUpdate &&
      brandData &&
      availableCategories.length > 0 &&
      availableSubcategories.length > 0
    ) {
      // Build the complete form data including field arrays
      const existingCategories = (brandData.categories || []).map(
        (cat, index) => ({
          categoryId: cat.id,
          sortorder: index + 1,
        })
      );

      const existingSubcategories = (brandData.subcategories || []).map(
        (subcat, index) => ({
          subcategoryId: subcat.id,
          sortorder: index + 1,
        })
      );

      // Reset form with complete data including field arrays
      form.reset({
        name: brandData.name,
        slug: brandData.slug,
        active: brandData.active,
        categories: existingCategories,
        subcategories: existingSubcategories,
      });
    }
  }, [isUpdate, brandData, availableCategories, availableSubcategories, form]);

  // selected category/subcategory IDs for checkbox state
  const selectedCategoryIds = categoryFields
    .map((field: any) => field.categoryId)
    .filter((id) => id !== undefined && id !== null);
  const selectedSubcategoryIds = subcategoryFields
    .map((field: any) => field.subcategoryId)
    .filter((id) => id !== undefined && id !== null);

  // Filter subcategories to only show those belonging to selected categories
  const filteredSubcategories =
    selectedCategoryIds.length > 0
      ? availableSubcategories.filter((subcategory) =>
          selectedCategoryIds.includes(subcategory.category.id)
        )
      : [];

  // Update sortorder to match array indices - SYNCHRONOUS
  const updateCategorySortOrder = () => {
    // Use the current field array directly instead of relying on stale closures
    const currentFields = form.getValues("categories") || [];
    currentFields.forEach((_, index) => {
      form.setValue(`categories.${index}.sortorder`, index + 1);
    });
  };

  const updateSubcategorySortOrder = () => {
    // Use the current field array directly instead of relying on stale closures
    const currentFields = form.getValues("subcategories") || [];
    currentFields.forEach((_, index) => {
      form.setValue(`subcategories.${index}.sortorder`, index + 1);
    });
  };

  // Handle category selection - synchronous updates
  const handleCategoryToggle = (
    category: CategoryTableType,
    checked: boolean | string
  ) => {
    const isChecked = checked === true;

    if (isChecked) {
      const isAlreadySelected = selectedCategoryIds.includes(category.id);

      if (!isAlreadySelected) {
        if (!category.id || category.id.trim() === "") {
          return;
        }

        appendCategory({
          categoryId: category.id, // Store actual category ID
          sortorder: categoryFields.length + 1,
        } as any);
      }
    } else {
      const index = categoryFields.findIndex(
        (field: any) => field.categoryId === category.id
      );

      if (index !== -1) {
        removeCategory(index);
        updateCategorySortOrder(); // Update sortorder for remaining items - SYNCHRONOUS
      }
    }
  };

  // Handle subcategory selection - synchronous updates
  const handleSubcategoryToggle = (
    subcategory: SubcategoryTableType,
    checked: boolean | string
  ) => {
    const isChecked = checked === true;

    if (isChecked) {
      const isAlreadySelected = selectedSubcategoryIds.includes(subcategory.id);

      if (!isAlreadySelected) {
        if (!subcategory.id || subcategory.id.trim() === "") {
          return;
        }

        appendSubcategory({
          subcategoryId: subcategory.id, // Store actual subcategory ID
          sortorder: subcategoryFields.length + 1,
        } as any);
      }
    } else {
      const index = subcategoryFields.findIndex(
        (field: any) => field.subcategoryId === subcategory.id
      );

      if (index !== -1) {
        removeSubcategory(index);
        updateSubcategorySortOrder(); // Update sortorder for remaining items - SYNCHRONOUS
      }
    }
  };

  // Handle drag end for categories - synchronous updates
  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categoryFields.findIndex(
        (field: any) => field.categoryId === active.id
      );
      const newIndex = categoryFields.findIndex(
        (field: any) => field.categoryId === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        moveCategory(oldIndex, newIndex);
        updateCategorySortOrder();
      }
    }
  };

  // Handle drag end for subcategories - synchronous updates
  const handleSubcategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = subcategoryFields.findIndex(
        (field: any) => field.subcategoryId === active.id
      );
      const newIndex = subcategoryFields.findIndex(
        (field: any) => field.subcategoryId === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        moveSubcategory(oldIndex, newIndex);
        updateSubcategorySortOrder();
      }
    }
  };

  // Handle category removal from sorted list - synchronous updates
  const handleCategoryRemove = (index: number) => {
    removeCategory(index);
    updateCategorySortOrder();
  };

  // Handle subcategory removal from sorted list - synchronous updates
  const handleSubcategoryRemove = (index: number) => {
    removeSubcategory(index);
    updateSubcategorySortOrder();
  };

  // Get category/subcategory name by ID
  const getCategoryName = (categoryId: string) => {
    // Validate input
    if (
      !categoryId ||
      typeof categoryId !== "string" ||
      categoryId.trim() === ""
    ) {
      return "Invalid Category ID";
    }

    const category = availableCategories.find((cat) => cat.id === categoryId);
    if (!category) {
      return `Unknown Category (${categoryId})`;
    }
    return category.name;
  };

  const getSubcategoryName = (subcategoryId: string) => {
    // Validate input
    if (
      !subcategoryId ||
      typeof subcategoryId !== "string" ||
      subcategoryId.trim() === ""
    ) {
      return "Invalid Subcategory ID";
    }

    const subcategory = availableSubcategories.find(
      (subcat) => subcat.id === subcategoryId
    );
    if (!subcategory) {
      return `Unknown Subcategory (${subcategoryId})`;
    }
    return subcategory.name;
  };

  // Auto-generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  // Form submission
  const onSubmit = async (
    values: ExtendedCreateBrandInput | ExtendedUpdateBrandInput
  ) => {
    const slug = generateSlug(values.name);

    // Transform field arrays back to the expected format for API
    const categoryIds = values.categories.map((cat: any) => cat.categoryId);
    const subcategoryIds = values.subcategories.map(
      (subcat: any) => subcat.subcategoryId
    );

    const payload = {
      name: values.name,
      slug: slug,
      isActive: values.active, // backend expects 'isActive' as boolean
      categories: categoryIds, // Send array of category IDs
      subcategories: subcategoryIds, // Send array of subcategory IDs
    };

    const url = isUpdate
      ? `/api/admin/taxonomy/brands/${brandData!.id}`
      : `/api/admin/taxonomy/brands`;

    const method = isUpdate ? "PUT" : "POST";

    try {
      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        withCredentials: true,
      });

      if (response.data?.success) {
        toast.success(
          isUpdate ? "Brand updated successfully" : "Brand created successfully"
        );
        form.reset();

        // Transform backend data to frontend format
        const brandData = response.data.data;
        const transformedBrand = {
          id: brandData._id,
          name: brandData.name,
          slug: brandData.slug,
          sortorder: brandData.sortOrder || 0,
          active: brandData.isActive,
          url: brandData.url || `/${brandData.slug}`,
          categories_count: brandData.categories_count || 0,
          subcategories_count: brandData.subcategories_count || 0,
          categories: (brandData.categories || []).map((cat: any) => ({
            id: cat._id,
            name: cat.name,
            slug: cat.slug,
            active: cat.isActive,
          })),
          subcategories: (brandData.subcategories || []).map((subcat: any) => ({
            id: subcat._id,
            name: subcat.name,
            slug: subcat.slug,
            active: subcat.isActive,
          })),
          total_associations:
            (brandData.categories_count || 0) +
            (brandData.subcategories_count || 0),
          created_at: brandData.createdAt,
          updated_at: brandData.updatedAt,
        };

        // Update Redux state
        if (isUpdate) {
          dispatch(updateABrand(transformedBrand));
        } else {
          dispatch(addABrand(transformedBrand));
        }

        onSuccess?.();
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 p-1 max-h-[400px] overflow-y-auto"
      >
        {/* Basic Information */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
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

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-xs font-medium text-left">
                  Slug*
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter URL slug (lowercase, hyphens only)"
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
            name="active"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-medium">
                    Active Status
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Categories Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Categories</h3>
            <Card>
              <CardContent className="p-4">
                {availableCategories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategoryIds.includes(category.id)}
                          onCheckedChange={(checked) =>
                            handleCategoryToggle(category, checked)
                          }
                          disabled={form.formState.isSubmitting}
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-xs text-gray-500 py-4">
                    No categories available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selected Categories - Draggable List */}
          {categoryFields.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                Selected Categories (Drag to reorder)
              </h4>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleCategoryDragEnd}
              >
                <SortableContext
                  items={categoryFields.map((field: any) => field.categoryId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {categoryFields.map((field: any, index) => (
                      <SortableItem
                        key={field.id} // Use RHF's internal ID for React key
                        id={field.categoryId} // Use actual category ID for drag/drop
                        index={index}
                        name={getCategoryName(field.categoryId)}
                        type="category"
                        onRemove={() => handleCategoryRemove(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* Subcategories Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Subcategories</h3>
            <Card>
              <CardContent className="p-4">
                {selectedCategoryIds.length === 0 ? (
                  <div className="text-center text-xs text-gray-500 py-4">
                    Please select at least one category first
                  </div>
                ) : filteredSubcategories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredSubcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`subcategory-${subcategory.id}`}
                          checked={selectedSubcategoryIds.includes(
                            subcategory.id
                          )}
                          onCheckedChange={(checked) =>
                            handleSubcategoryToggle(subcategory, checked)
                          }
                          disabled={form.formState.isSubmitting}
                        />
                        <label
                          htmlFor={`subcategory-${subcategory.id}`}
                          className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {subcategory.name}
                          <span className="text-gray-400 ml-1">
                            ({subcategory.category.name})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-xs text-gray-500 py-4">
                    No subcategories available for selected categories
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selected Subcategories - Draggable List */}
          {subcategoryFields.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                Selected Subcategories (Drag to reorder)
              </h4>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSubcategoryDragEnd}
              >
                <SortableContext
                  items={subcategoryFields.map(
                    (field: any) => field.subcategoryId
                  )}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {subcategoryFields.map((field: any, index) => (
                      <SortableItem
                        key={field.id} // Use RHF's internal ID for React key
                        id={field.subcategoryId} // Use actual subcategory ID for drag/drop
                        index={index}
                        name={getSubcategoryName(field.subcategoryId)}
                        type="subcategory"
                        onRemove={() => handleSubcategoryRemove(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>

        {/* Form Actions */}
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
            aria-label={isUpdate ? "update brand" : "create brand"}
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

// Add Brand Form
const AddBrandForm = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <AddingDialog
      buttonText="Add New Brand"
      dialogTitle="Add New Brand"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <BrandForm mode="create" onSuccess={handleSuccess} />
    </AddingDialog>
  );
};

// Update Brand Form
const UpdateBrandForm = ({ brandData }: UpdateBrandFormProps) => {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const handleSuccess = () => {
    setIsUpdateOpen(false);
  };

  return (
    <EditingDialog
      buttonText="Update Brand"
      dialogTitle="Update Brand"
      open={isUpdateOpen}
      onOpenChange={setIsUpdateOpen}
    >
      <BrandForm
        mode="update"
        brandData={brandData}
        onSuccess={handleSuccess}
      />
    </EditingDialog>
  );
};

export { AddBrandForm, UpdateBrandForm };
