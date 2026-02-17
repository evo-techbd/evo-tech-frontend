"use client";

import { z } from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EvoFormInputError } from "@/components/error/form-input-error";
import { FileUploader } from "@/components/file_upload/file-uploader";
import { AddProductSchema } from "@/schemas/admin/product/productschemas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/all_utils";
import { useEffect, useState } from "react";

import { IoIosAddCircle } from "react-icons/io";
import { Trash2, PlusCircle, Palette } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ItemBrandOptions } from "@/dal/product-inputs";
import Link from "next/link";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { useFeaturedSections } from "@/hooks/use-featured-sections";
import axios from "@/utils/axios/axios";

const AddProductForm = () => {
  const router = useRouter();
  const {
    getCategoriesForSelect,
    getSubcategoriesForSelect,
    getBrandsForSelect,
  } = useTaxonomy();
  const { getSectionsForSelect } = useFeaturedSections();
  const categories = getCategoriesForSelect();
  const featuredSections = getSectionsForSelect();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof AddProductSchema>>({
    resolver: zodResolver(AddProductSchema),
    defaultValues: {
      item_name: "",
      item_slug: "",
      item_price: "",
      item_buyingprice: "",
      item_prevprice: "0",
      item_instock: true,
      item_mainimg: [],
      item_features: [],
      item_colors: [],
      item_category: "",
      item_subcategory: "",
      item_brand: "",
      item_weight: "",
      landing_section_id: "",
      additional_images: [],
      description: "",
      shortDescription: "",
      sku: "",
      stock: "0",
      lowStockThreshold: "10",
      isFeatured: false,
      published: true,
      isPreOrder: false,
      preOrderDate: "",
      preOrderPrice: "",
      seoTitle: "",
      seoDescription: "",
      item_faq: [],
    },
  });

  const [uniqueColors, setUniqueColors] = useState<any[]>([]);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [newColor, setNewColor] = useState({
    colorName: "",
    colorCode: "#000000",
    stock: "0",
  });

  // Fetch unique colors for suggestions
  useEffect(() => {
    const fetchUniqueColors = async () => {
      try {
        const response = await axios.get("/api/products/colors/unique");
        if (response.data.success) {
          setUniqueColors(response.data.data || []);
        }
      } catch (error) {
        // console.error("Error fetching unique colors:", error);
      }
    };
    fetchUniqueColors();
  }, []);

  // Dynamic fields for item features
  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: "item_features",
  });

  // Dynamic fields for item colors
  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({
    control,
    name: "item_colors", // Now manages objects {colorName, colorCode, stock}
  });

  // Dynamic fields for item faq
  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: "item_faq",
  });

  const generateSlug = () => {
    const itemName = watch("item_name");
    const generatedSlug = slugify(itemName);
    setValue("item_slug", generatedSlug, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const selectedCategory = watch("item_category");
  const selectedSubcategory = watch("item_subcategory");
  const subcategories = getSubcategoriesForSelect(selectedCategory);
  const normalizedSubcategory = selectedSubcategory || undefined;
  const brands = getBrandsForSelect(selectedCategory, normalizedSubcategory);

  // Clear subcategory when category changes if it's not valid for the new category
  useEffect(() => {
    const currentSubcategory = watch("item_subcategory");
    if (currentSubcategory) {
      const isValidSubcategory = subcategories.some(
        (sub) => sub.value === currentSubcategory
      );
      if (!isValidSubcategory) {
        setValue("item_subcategory", "");
      }
    }
  }, [selectedCategory, subcategories, watch, setValue]);

  // Clear brand when category/subcategory changes if brand is not in new filtered list
  useEffect(() => {
    const currentBrand = watch("item_brand");
    if (currentBrand) {
      const isValidBrand = brands.some((brand) => brand.value === currentBrand);
      if (!isValidBrand) {
        setValue("item_brand", "");
      }
    }
  }, [selectedCategory, selectedSubcategory, brands, watch, setValue]);

  const onSubmit = async (data: z.infer<typeof AddProductSchema>) => {
    // if (!session) {
    //   toast.error("Please log in to add products");
    //   return;
    // }

    const formdata = new FormData();

    // Send field names matching backend schema
    formdata.append("name", data.item_name);
    formdata.append("slug", data.item_slug);
    formdata.append("price", data.item_price);
    if (data.item_buyingprice) {
      formdata.append("buyingPrice", data.item_buyingprice);
    }
    formdata.append("previousPrice", data.item_prevprice);
    formdata.append("inStock", String(Boolean(data.item_instock)));

    // Main image - backend expects 'mainImage' but multer uses field name from multer.single('mainImage')
    // Handle both File instance and array from FileUploader component
    if (data.item_mainimg) {
      if (Array.isArray(data.item_mainimg) && data.item_mainimg.length > 0) {
        formdata.append("mainImage", data.item_mainimg[0]);
      } else if (data.item_mainimg instanceof File) {
        formdata.append("mainImage", data.item_mainimg);
      }
    }

    // Features array
    if (data.item_features && data.item_features.length > 0) {
      data.item_features.forEach((feature: string) => {
        if (feature && feature.trim()) {
          formdata.append("features[]", feature);
        }
      });
    }

    // Colors array
    // Colors array (send as JSON string)
    if (data.item_colors && data.item_colors.length > 0) {
      formdata.append("colors", JSON.stringify(data.item_colors));
    }

    // FAQ array (send as JSON string)
    if (data.item_faq && data.item_faq.length > 0) {
      // Map item_faq to backend expected structure if needed, but schema uses 'question', 'answer' which matches.
      // Backend controller parses 'faqs' from body.
      formdata.append("faqs", JSON.stringify(data.item_faq));
    }

    formdata.append("category", data.item_category);
    if (data.item_subcategory) {
      formdata.append("subcategory", data.item_subcategory);
    }
    formdata.append("brand", data.item_brand);
    if (data.item_weight) {
      formdata.append("weight", data.item_weight);
    }
    if (data.landing_section_id) {
      formdata.append("landingpageSectionId", data.landing_section_id);
    }

    // Additional images for product images collection
    if (data.additional_images && Array.isArray(data.additional_images)) {
      data.additional_images.forEach((file: File, index) => {
        formdata.append("additionalImages", file);
      });
    }

    // New fields - Description & SEO
    if (data.description) {
      formdata.append("description", data.description);
    }
    if (data.shortDescription) {
      formdata.append("shortDescription", data.shortDescription);
    }
    if (data.sku) {
      formdata.append("sku", data.sku);
    }

    // Inventory fields
    formdata.append("stock", data.stock ?? "0");
    formdata.append("lowStockThreshold", data.lowStockThreshold ?? "10");

    // Boolean flags
    formdata.append("isFeatured", String(Boolean(data.isFeatured)));
    formdata.append("published", String(Boolean(data.published)));

    // Pre-order fields
    formdata.append("isPreOrder", String(Boolean(data.isPreOrder)));
    if (data.isPreOrder && data.preOrderDate) {
      formdata.append("preOrderDate", data.preOrderDate);
    }
    if (data.isPreOrder && data.preOrderPrice) {
      formdata.append("preOrderPrice", data.preOrderPrice);
    }

    // SEO fields
    if (data.seoTitle) {
      formdata.append("seoTitle", data.seoTitle);
    }
    if (data.seoDescription) {
      formdata.append("seoDescription", data.seoDescription);
    }

    const response = await axios
      .post(`/api/admin/products`, formdata, {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        if (error.response) {
          const errorMessage =
            error.response.data.message || "Something went wrong";
          toast.error(errorMessage);
        } else if (error.request) {
          toast.error("Something went wrong - check your network connection");
        } else {
          toast.error("Something went wrong");
        }
        return null;
      });

    if (response && response.success) {
      toast.success(response.message || `Item '${response.item_name || "New Product"}' created`);
      reset();
      router.push(`/control/products`);
    }
  };

  return (
    <form
      id="addproductform"
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-4xl bg-white rounded-lg shadow-sm border border-stone-200 p-6 space-y-6"
    >
      {/* Item Name */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Product Name*
        </label>
        <input
          type="text"
          {...register("item_name")}
          disabled={isSubmitting}
          className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
          placeholder="Enter product name"
        />
        {errors.item_name && (
          <EvoFormInputError>{errors.item_name.message}</EvoFormInputError>
        )}
      </div>

      {/* Item Slug */}
      <div>
        <div className="flex gap-3 items-center mb-1.5">
          <label className="block text-sm font-medium text-stone-700">
            URL Slug*
          </label>
          <button
            onClick={generateSlug}
            type="button"
            aria-label="generate slug"
            disabled={isSubmitting}
            className="px-3 py-1 text-xs text-white bg-stone-700 hover:bg-stone-800 rounded-md disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors"
          >
            Generate
          </button>
        </div>
        <input
          type="text"
          {...register("item_slug")}
          disabled={isSubmitting}
          className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
          placeholder="product-url-slug"
        />
        {errors.item_slug && (
          <EvoFormInputError>{errors.item_slug.message}</EvoFormInputError>
        )}
      </div>
      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Current Price*
          </label>
          <input
            type="text"
            {...register("item_price")}
            disabled={isSubmitting}
            className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
            placeholder="0.00"
          />
          {errors.item_price && (
            <EvoFormInputError>{errors.item_price.message}</EvoFormInputError>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Buying Price{" "}
            <span className="text-stone-500 text-xs font-normal">
              (Admin Only)
            </span>
          </label>
          <input
            type="text"
            {...register("item_buyingprice")}
            disabled={isSubmitting}
            className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
            placeholder="0.00"
          />
          {errors.item_buyingprice && (
            <EvoFormInputError>
              {errors.item_buyingprice.message}
            </EvoFormInputError>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Previous Price{" "}
            <span className="text-stone-500 text-xs font-normal">
              (Optional)
            </span>
          </label>
          <input
            type="text"
            {...register("item_prevprice")}
            disabled={isSubmitting}
            className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
            placeholder="0.00"
          />
          {errors.item_prevprice && (
            <EvoFormInputError>
              {errors.item_prevprice.message}
            </EvoFormInputError>
          )}
        </div>
      </div>

      {/* In Stock (Boolean as a Checkbox) */}
      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-md border border-stone-200">
        <div>
          <label className="text-sm font-medium text-stone-700">
            Product In Stock
          </label>
          <p className="text-xs text-stone-500 mt-0.5">
            Available for purchase
          </p>
        </div>
        <Controller
          control={control}
          name="item_instock"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
        {errors.item_instock && (
          <EvoFormInputError>{errors.item_instock.message}</EvoFormInputError>
        )}
      </div>

      {/* Description Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Product Description{" "}
            <span className="text-stone-500 text-xs font-normal">
              (Optional)
            </span>
          </label>
          <textarea
            {...register("description")}
            disabled={isSubmitting}
            rows={4}
            className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 resize-y"
            placeholder="Enter detailed product description"
          />
          {errors.description && (
            <EvoFormInputError>{errors.description.message}</EvoFormInputError>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Short Description{" "}
            <span className="text-stone-500 text-xs font-normal">
              (Optional)
            </span>
          </label>
          <textarea
            {...register("shortDescription")}
            disabled={isSubmitting}
            rows={2}
            className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 resize-y"
            placeholder="Enter brief product summary"
          />
          {errors.shortDescription && (
            <EvoFormInputError>
              {errors.shortDescription.message}
            </EvoFormInputError>
          )}
        </div>
      </div>

      {/* Inventory Section */}
      <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 space-y-4">
        <h3 className="text-sm font-semibold text-stone-800">
          Inventory Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              SKU{" "}
              <span className="text-stone-500 text-xs font-normal">
                (Optional)
              </span>
            </label>
            <input
              type="text"
              {...register("sku")}
              disabled={isSubmitting}
              className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
              placeholder="SKU-12345"
            />
            {errors.sku && (
              <EvoFormInputError>{errors.sku.message}</EvoFormInputError>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Stock Quantity
            </label>
            <input
              type="number"
              {...register("stock")}
              disabled={isSubmitting}
              className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
              placeholder="0"
              min="0"
            />
            {errors.stock && (
              <EvoFormInputError>{errors.stock.message}</EvoFormInputError>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Low Stock Alert
            </label>
            <input
              type="number"
              {...register("lowStockThreshold")}
              disabled={isSubmitting}
              className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
              placeholder="10"
              min="0"
            />
            {errors.lowStockThreshold && (
              <EvoFormInputError>
                {errors.lowStockThreshold.message}
              </EvoFormInputError>
            )}
          </div>
        </div>
      </div>

      {/* Product Status Flags */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-md border border-stone-200">
          <div>
            <label className="text-sm font-medium text-stone-700">
              Featured Product
            </label>
            <p className="text-xs text-stone-500 mt-0.5">
              Show in featured sections
            </p>
          </div>
          <Controller
            control={control}
            name="isFeatured"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-md border border-stone-200">
          <div>
            <label className="text-sm font-medium text-stone-700">
              Published
            </label>
            <p className="text-xs text-stone-500 mt-0.5">
              Visible to customers
            </p>
          </div>
          <Controller
            control={control}
            name="published"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
        </div>
      </div>

      {/* Pre-Order Section */}
      <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-stone-800">
              Pre-Order Settings
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Allow customers to pre-order this product
            </p>
          </div>
          <Controller
            control={control}
            name="isPreOrder"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
        </div>

        {watch("isPreOrder") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-amber-200">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Pre-Order Available Date
              </label>
              <input
                type="date"
                {...register("preOrderDate")}
                disabled={isSubmitting}
                className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
              />
              {errors.preOrderDate && (
                <EvoFormInputError>
                  {errors.preOrderDate.message}
                </EvoFormInputError>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Pre-Order Price{" "}
                <span className="text-stone-500 text-xs font-normal">
                  (Optional)
                </span>
              </label>
              <input
                type="number"
                {...register("preOrderPrice")}
                disabled={isSubmitting}
                className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.preOrderPrice && (
                <EvoFormInputError>
                  {errors.preOrderPrice.message}
                </EvoFormInputError>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SEO Section */}
      <div className="p-4 bg-green-50/50 rounded-lg border border-green-200 space-y-4">
        <h3 className="text-sm font-semibold text-stone-800">SEO Settings</h3>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            SEO Title{" "}
            <span className="text-stone-500 text-xs font-normal">
              (Optional)
            </span>
          </label>
          <input
            type="text"
            {...register("seoTitle")}
            disabled={isSubmitting}
            className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500"
            placeholder="SEO optimized title"
          />
          {errors.seoTitle && (
            <EvoFormInputError>{errors.seoTitle.message}</EvoFormInputError>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            SEO Description{" "}
            <span className="text-stone-500 text-xs font-normal">
              (Optional)
            </span>
          </label>
          <textarea
            {...register("seoDescription")}
            disabled={isSubmitting}
            rows={3}
            className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 resize-y"
            placeholder="SEO meta description (150-160 characters recommended)"
          />
          {errors.seoDescription && (
            <EvoFormInputError>
              {errors.seoDescription.message}
            </EvoFormInputError>
          )}
        </div>
      </div>

      {/* Item Features (Dynamic Array of Text Inputs) */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Key Features{" "}
          <span className="text-stone-500 text-xs font-normal">(Optional)</span>
        </label>
        <div className="space-y-2">
          {featureFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="text"
                {...register(`item_features.${index}` as const)}
                placeholder="Enter a key feature"
                disabled={isSubmitting}
                className="block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                disabled={isSubmitting}
                className="px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors whitespace-nowrap"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => appendFeature("")}
          disabled={isSubmitting}
          className="mt-3 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md flex items-center gap-1 transition-colors"
        >
          <IoIosAddCircle className="size-5" />
          Add Feature
        </button>
        {errors.item_features && (
          <EvoFormInputError>
            {(errors.item_features as any).message}
          </EvoFormInputError>
        )}
      </div>

      {/* Item Colors (Dynamic Array of Text Inputs) */}
      {/* Item Colors (Structured with Stock) */}
      <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Product Colors
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage color variations and stock
            </p>
          </div>
          {uniqueColors.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorDropdown(!showColorDropdown)}
                className="text-xs flex items-center gap-1 text-purple-700 hover:text-purple-800 font-medium"
              >
                <Palette className="h-3 w-3" /> Select from existing
              </button>
              {showColorDropdown && (
                <div className="absolute right-0 top-full mt-1 w-56 max-h-48 overflow-y-auto bg-white border border-stone-200 shadow-lg rounded-md z-10">
                  {uniqueColors.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewColor({
                          ...newColor,
                          colorName: color.colorName,
                          colorCode: color.colorCode,
                        });
                        setShowColorDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-stone-50 text-left border-b last:border-0"
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-stone-300"
                        style={{ backgroundColor: color.colorCode }}
                      />
                      <span className="text-xs truncate flex-1">
                        {color.colorName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* List of Added Colors */}
        <div className="space-y-3">
          {colorFields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-md shadow-sm"
            >
              <div
                className="w-8 h-8 rounded border border-stone-300 shadow-sm"
                style={{ backgroundColor: (field as any).colorCode }} // Cast because form generic type might be strictly string[] in old schema but we updated schema
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900">
                  {(field as any).colorName}
                </p>
                <p className="text-xs text-stone-500">
                  {(field as any).colorCode} • Stock: {(field as any).stock}
                </p>
              </div>
              <button
                aria-label="remove"
                type="button"
                onClick={() => removeColor(index)}
                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {/* Hidden inputs to ensure data is submitted via register/watch if needed, though we use field array which updates form state */}
              <input
                type="hidden"
                {...register(`item_colors.${index}.colorName` as const)}
              />
              <input
                type="hidden"
                {...register(`item_colors.${index}.colorCode` as const)}
              />
              <input
                type="hidden"
                {...register(`item_colors.${index}.stock` as const)}
              />
            </div>
          ))}
        </div>

        {/* Add New Color Inputs */}
        <div className="flex flex-col md:flex-row gap-3 items-end bg-white p-3 rounded-md border border-purple-100">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Color Name
            </label>
            <input
              type="text"
              value={newColor.colorName}
              onChange={(e) =>
                setNewColor({ ...newColor, colorName: e.target.value })
              }
              placeholder="e.g. Midnight Blue"
              className="block w-full border border-stone-300 rounded-md px-3 py-1.5 text-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="block text-xs font-medium text-stone-600 mb-1">
              Stock
            </label>
            <input
              aria-label="color-code"
              type="number"
              value={newColor.stock}
              onChange={(e) =>
                setNewColor({ ...newColor, stock: e.target.value })
              }
              min="0"
              className="block w-full border border-stone-300 rounded-md px-3 py-1.5 text-sm focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="shrink-0">
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Code
              </label>
              <div className="flex gap-1.5">
                <input
                  aria-label="color picker"
                  type="color"
                  value={newColor.colorCode}
                  onChange={(e) =>
                    setNewColor({ ...newColor, colorCode: e.target.value })
                  }
                  className="h-9 w-9 p-0.5 border border-stone-300 rounded cursor-pointer"
                />
                <input
                  aria-label="new color"
                  type="text"
                  value={newColor.colorCode}
                  onChange={(e) =>
                    setNewColor({ ...newColor, colorCode: e.target.value })
                  }
                  className="w-20 text-xs border border-stone-300 rounded px-1.5"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!newColor.colorName)
                  return toast.error("Color name required");
                appendColor({
                  colorName: newColor.colorName,
                  colorCode: newColor.colorCode,
                  stock: parseInt(newColor.stock),
                });
                setNewColor({
                  colorName: "",
                  colorCode: "#000000",
                  stock: "0",
                });
              }}
              className="h-9 px-4 bg-stone-900 text-white text-sm font-medium rounded-md hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 mt-5 md:mt-0"
            >
              <PlusCircle className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Item FAQs */}
      <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-4">
        <h3 className="text-sm font-semibold text-stone-800">Product FAQs</h3>

        <div className="space-y-4">
          {faqFields.map((field, index) => (
            <div
              key={field.id}
              className="p-4 bg-white border border-stone-200 rounded-lg shadow-sm space-y-3 relative group"
            >
              <button
                aria-label="remove faq"
                type="button"
                onClick={() => removeFaq(index)}
                className="absolute top-2 right-2 text-stone-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                  Question
                </label>
                <input
                  {...register(`item_faq.${index}.question` as const)}
                  className="block w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:ring-stone-500 focus:border-stone-500"
                  placeholder="e.g. Is this waterproof?"
                />
                {errors.item_faq?.[index]?.question && (
                  <span className="text-xs text-red-500">
                    {errors.item_faq[index]?.question?.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                  Answer
                </label>
                <textarea
                  {...register(`item_faq.${index}.answer` as const)}
                  rows={2}
                  className="block w-full border border-stone-300 rounded-md px-3 py-2 text-sm focus:ring-stone-500 focus:border-stone-500 resize-y"
                  placeholder="e.g. Yes, it is IP68 rated."
                />
                {errors.item_faq?.[index]?.answer && (
                  <span className="text-xs text-red-500">
                    {errors.item_faq[index]?.answer?.message}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => appendFaq({ question: "", answer: "" })}
          className="w-full py-3 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 text-sm font-medium hover:border-stone-400 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" /> Add FAQ Item
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Main Image */}
        <div>
          <label className="block text-sm font-medium">
            Main Image*{" "}
            <span className="text-gray-500 text-xs">{`(will be shown 1st)`}</span>
          </label>
          <p className="text-[0.6875rem] leading-3 text-muted-foreground">{`(only jpeg/png/jpg/webp)`}</p>
          <div>
            {/* accept="image/jpeg, image/png, image/jpg, image/webp" */}
            <Controller
              control={control}
              name="item_mainimg"
              render={({ field }) => (
                <div className="mt-1 block">
                  <FileUploader
                    value={field.value}
                    onValueChange={field.onChange}
                    maxFileCount={1}
                    maxSize={10 * 1024 * 1024}
                    className="lg:min-h-32"
                    accept={{
                      "image/jpeg": [],
                      "image/png": [],
                      "image/webp": [],
                    }}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            />
          </div>
          {errors.item_mainimg && (
            <EvoFormInputError>
              {errors.item_mainimg?.message?.toString()}
            </EvoFormInputError>
          )}
        </div>

        {/* Additional Images */}
        <div>
          <label className="block text-sm font-medium">Additional Images</label>
          <p className="text-[0.6875rem] leading-3 text-muted-foreground">{`(only jpeg/png/jpg/webp)`}</p>
          <div>
            {/* accept="image/jpeg, image/png, image/jpg, image/webp" */}
            <Controller
              control={control}
              name="additional_images"
              render={({ field }) => (
                <div className="mt-1 block">
                  <FileUploader
                    value={field.value}
                    onValueChange={field.onChange}
                    maxFileCount={10}
                    maxSize={10 * 1024 * 1024}
                    multiple
                    className="lg:min-h-32"
                    accept={{
                      "image/jpeg": [],
                      "image/png": [],
                      "image/webp": [],
                    }}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            />
          </div>
          {errors.additional_images && (
            <EvoFormInputError>
              {errors.additional_images?.message?.toString()}
            </EvoFormInputError>
          )}
        </div>
      </div>

      {/* Category and Subcategory */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Category*</label>
          <Controller
            control={control}
            name="item_category"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-200 focus:ring-stone-200">
                  <SelectValue
                    placeholder={
                      <span className={`text-stone-400`}>
                        Select a category
                      </span>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 && field.value !== "" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs bg-stone-500/10 text-rose-500 mb-2"
                      onClick={() => {
                        field.onChange("");
                      }}
                    >
                      Clear
                    </Button>
                  )}
                  {categories.length > 0 ? (
                    categories.map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.label}
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
            )}
          />
          {errors.item_category && (
            <EvoFormInputError>
              {errors.item_category.message}
            </EvoFormInputError>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">
            Subcategory{" "}
            <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <Controller
            control={control}
            name="item_subcategory"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-300 focus:ring-stone-200">
                  <SelectValue
                    placeholder={
                      <span className={`text-stone-400`}>
                        Select a subcategory
                      </span>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.length > 0 && field.value !== "" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs bg-stone-500/10 text-rose-500 mb-2"
                      onClick={() => {
                        field.onChange("");
                      }}
                    >
                      Clear
                    </Button>
                  )}
                  {subcategories.length > 0 ? (
                    subcategories.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-xs text-stone-500 py-2">
                      <p>No subcategories found for the selected category</p>
                      <Link
                        href="/control/subcategories"
                        className="text-evoAdminAccent hover:underline"
                      >
                        Add a subcategory
                      </Link>
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.item_subcategory && (
            <EvoFormInputError>
              {errors.item_subcategory.message}
            </EvoFormInputError>
          )}
        </div>
      </div>

      {/* Brand */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Brand*</label>
          <Controller
            control={control}
            name="item_brand"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-300 focus:ring-stone-200">
                  <SelectValue
                    placeholder={
                      <span className={`text-stone-400`}>Select a brand</span>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {brands.length > 0 && field.value !== "" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs bg-stone-500/10 text-rose-500 mb-2"
                      onClick={() => {
                        field.onChange("");
                      }}
                    >
                      Clear
                    </Button>
                  )}
                  {brands.length > 0 &&
                    brands.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.item_brand && (
            <EvoFormInputError>{errors.item_brand.message}</EvoFormInputError>
          )}
        </div>
      </div>

      {/* Weight and Landing Section ID */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">
            {`Weight (grams) `}
            <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            {...register("item_weight")}
            disabled={isSubmitting}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-300 focus:ring-stone-600"
          />
          {errors.item_weight && (
            <EvoFormInputError>{errors.item_weight.message}</EvoFormInputError>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">
            Add to Featured{" "}
            <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <Controller
            control={control}
            name="landing_section_id"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={isSubmitting}
              >
                <SelectTrigger className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-300 focus:ring-stone-200">
                  <SelectValue
                    placeholder={
                      <span className={`text-stone-400`}>Select a section</span>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {featuredSections.length > 0 && field.value !== "" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs bg-stone-500/10 text-rose-500 mb-2"
                      onClick={() => {
                        field.onChange("");
                      }}
                    >
                      Clear
                    </Button>
                  )}
                  {featuredSections.length > 0 ? (
                    featuredSections.map((option) => (
                      <SelectItem
                        key={`L_Featured_${option.value}`}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-xs text-stone-500 py-2">
                      <p>No featured sections found</p>
                      <Link
                        href="/control/setup-config/homepage-config/featured-sections"
                        className="text-evoAdminAccent hover:underline"
                      >
                        Add a featured section
                      </Link>
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.landing_section_id && (
            <EvoFormInputError>
              {errors.landing_section_id.message}
            </EvoFormInputError>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-stone-200">
        <Link
          href={`/control/products`}
          className={`px-6 py-2.5 bg-white border border-stone-300 text-stone-700 rounded-md text-sm font-medium hover:bg-stone-50 transition-colors shadow-sm 
                        ${
                          isSubmitting ? "pointer-events-none opacity-50" : ""
                        }`}
        >
          Cancel
        </Link>
        <button
          type="submit"
          aria-label="add product"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-stone-800 text-white rounded-md text-sm font-medium hover:bg-stone-900 disabled:bg-stone-400 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isSubmitting ? `Adding Product...` : `Add Product`}
        </button>
      </div>
    </form>
  );
};

export { AddProductForm };
