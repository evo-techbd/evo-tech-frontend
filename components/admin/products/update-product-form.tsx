"use client";

import { z } from "zod";
import Link from "next/link";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProductSchema } from "@/schemas/admin/product/productschemas";
import { FileUploader } from "@/components/file_upload/file-uploader";
import { EvoFormInputError } from "@/components/error/form-input-error";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/all_utils";
import { ItemBrandOptions } from "@/dal/product-inputs";
import { useTaxonomy } from "@/hooks/use-taxonomy";
import { useFeaturedSections } from "@/hooks/use-featured-sections";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoIosAddCircle } from "react-icons/io";
import { Trash2, Undo2, PlusCircle } from "lucide-react";
import Image from "next/image";
import axios from "@/utils/axios/axios";
import { useEffect } from "react";

interface UpdateProductFormProps {
  itemInfo: {
    itemid: string;
    i_name: string;
    i_slug: string;
    i_price: number;
    i_buyingprice: number;
    i_prevprice: number;
    i_rating: number;
    i_reviews: number;
    i_instock: boolean;
    i_features: string[];
    i_colors: string[];
    i_mainimg: string;
    i_category: string;
    i_subcategory: string;
    i_brand: string;
    i_weight: string;
    landing_section_id: string;
    i_images: Array<{
      imgid: string;
      imgsrc: string;
      imgtitle: string;
      ismain: boolean;
    }>;
    i_description?: string;
    i_shortdescription?: string;
    i_sku?: string;
    i_stock?: number;
    i_lowstockthreshold?: number;
    i_isfeatured?: boolean;
    i_published?: boolean;
    i_ispreorder?: boolean;
    i_preorderdate?: string;
    i_preorderprice?: number;
    i_seotitle?: string;
    i_seodescription?: string;
  };
}

const UpdateProductForm = ({ itemInfo }: UpdateProductFormProps) => {
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
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof UpdateProductSchema>>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues: {
      item_name: itemInfo.i_name,
      item_slug: itemInfo.i_slug,
      item_price: itemInfo.i_price.toString(),
      item_buyingprice: itemInfo.i_buyingprice?.toString() || "",
      item_prevprice: itemInfo.i_prevprice.toString(),
      item_instock: itemInfo.i_instock,
      item_features: itemInfo.i_features || [],
      item_colors: itemInfo.i_colors || [],
      item_category: itemInfo.i_category,
      item_subcategory: itemInfo.i_subcategory || "",
      item_brand: itemInfo.i_brand,
      item_weight: itemInfo.i_weight?.toString() || "",
      landing_section_id: itemInfo.landing_section_id?.toString() || "",
      item_newmainimg: [],
      item_newmainfromexisting: "",
      item_featurebanner: (itemInfo as any).i_featurebanner || "",
      additional_newimages: [],
      remove_additional_images: [],
      description: (itemInfo as any).i_description || "",
      shortDescription: (itemInfo as any).i_shortdescription || "",
      sku: (itemInfo as any).i_sku || "",
      stock: (itemInfo as any).i_stock?.toString() || "0",
      lowStockThreshold:
        (itemInfo as any).i_lowstockthreshold?.toString() || "10",
      isFeatured: (itemInfo as any).i_isfeatured || false,
      published:
        (itemInfo as any).i_published !== undefined
          ? (itemInfo as any).i_published
          : true,
      isPreOrder: (itemInfo as any).i_ispreorder || false,
      preOrderDate: (itemInfo as any).i_preorderdate || "",
      preOrderPrice: (itemInfo as any).i_preorderprice?.toString() || "",
      seoTitle: (itemInfo as any).i_seotitle || "",
      seoDescription: (itemInfo as any).i_seodescription || "",
      item_faq: (itemInfo as any).i_faq || [],
    },
  });

  // Watch for changes in new main image fields
  const newMainImg = watch("item_newmainimg");
  const newMainFromExisting = watch("item_newmainfromexisting");

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

  const handleSetNewMainImage = (imageId: string) => {
    setValue("item_newmainfromexisting", imageId);
    setValue("item_newmainimg", []);
  };

  const handleRemoveImage = (imageId: string) => {
    const currentRemoved = watch("remove_additional_images") || [];
    setValue("remove_additional_images", [...currentRemoved, imageId]);
  };

  const handleUndoRemoveImage = (imageId: string) => {
    const currentRemoved = watch("remove_additional_images") || [];
    setValue(
      "remove_additional_images",
      currentRemoved.filter((id) => id !== imageId),
    );
  };

  const undoRemovalOfMainImage = () => {
    const mainImage = itemInfo.i_images.find((image) => image.ismain);
    const currentRemoved = watch("remove_additional_images") || [];
    if (mainImage && currentRemoved.includes(mainImage.imgid)) {
      handleUndoRemoveImage(mainImage.imgid);
    }
  };

  const handleUndoSetAsMain = (imageId: string) => {
    if (newMainFromExisting) {
      setValue("item_newmainfromexisting", "");
      undoRemovalOfMainImage();
    }
  };

  // Get selected category - use watched value if changed, otherwise use initial value
  const selectedCategory = watch("item_category") || itemInfo.i_category;
  const selectedSubcategory =
    watch("item_subcategory") || itemInfo.i_subcategory;
  const subcategories = getSubcategoriesForSelect(selectedCategory);

  // Get brands filtered by category and subcategory
  const brands = getBrandsForSelect(selectedCategory, selectedSubcategory);

  // Clear subcategory when category changes (and new category doesn't contain the current subcategory)
  useEffect(() => {
    const currentSubcategory = watch("item_subcategory");
    if (currentSubcategory) {
      const isValidSubcategory = subcategories.some(
        (sub) => sub.value === currentSubcategory,
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

  const onSubmit = async (data: z.infer<typeof UpdateProductSchema>) => {
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

    // Handle new main image
    if (data.item_newmainimg && data.item_newmainimg instanceof File) {
      formdata.append("mainImage", data.item_newmainimg);
    }

    // Handle setting existing image as main
    if (data.item_newmainfromexisting) {
      formdata.append("newMainFromExisting", data.item_newmainfromexisting);
    }

    // Handle feature banner selection
    if (data.item_featurebanner) {
      formdata.append("featureBanner", data.item_featurebanner);
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
    // FAQ array (send as JSON string)
    if (data.item_faq && data.item_faq.length > 0) {
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

    // Additional new images
    console.log("OnSubmit - additional_newimages:", data.additional_newimages);
    if (data.additional_newimages && Array.isArray(data.additional_newimages)) {
      console.log(
        `Processing ${data.additional_newimages.length} additional images`,
      );
      data.additional_newimages.forEach((file: File) => {
        console.log("Appending file:", file.name, file.size, file.type);
        formdata.append("additionalImages", file);
      });
    } else {
      console.log("No additional_newimages found or not an array");
    }

    // Images to remove
    if (
      data.remove_additional_images &&
      data.remove_additional_images.length > 0
    ) {
      data.remove_additional_images.forEach((imageId: string) => {
        formdata.append("removeImages[]", imageId);
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
    if (data.stock !== undefined && data.stock !== null && data.stock !== "") {
      formdata.append("stock", data.stock.toString());
    }
    if (
      data.lowStockThreshold !== undefined &&
      data.lowStockThreshold !== null &&
      data.lowStockThreshold !== ""
    ) {
      formdata.append("lowStockThreshold", data.lowStockThreshold.toString());
    }

    // Boolean flags
    if (data.isFeatured !== undefined) {
      formdata.append("isFeatured", String(Boolean(data.isFeatured)));
    }
    if (data.published !== undefined) {
      formdata.append("published", String(Boolean(data.published)));
    }

    // Pre-order fields
    if (data.isPreOrder !== undefined) {
      formdata.append("isPreOrder", String(Boolean(data.isPreOrder)));
    }
    if (data.isPreOrder && data.preOrderDate) {
      formdata.append("preOrderDate", data.preOrderDate);
    }
    if (data.isPreOrder && data.preOrderPrice) {
      formdata.append("preOrderPrice", data.preOrderPrice.toString());
    }

    // SEO fields
    if (data.seoTitle) {
      formdata.append("seoTitle", data.seoTitle);
    }
    if (data.seoDescription) {
      formdata.append("seoDescription", data.seoDescription);
    }

    const response = await axios
      .put(`/api/admin/products/${itemInfo.itemid}`, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-Requested-With": "XMLHttpRequest",
        },
        withCredentials: true,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error: any) => {
        if (error.response) {
          toast.error(
            error.response.data.message
              ? error.response.data.message
              : "Something went wrong",
          );
        } else {
          toast.error("Something went wrong");
        }
        return null;
      });

    if (response) {
      toast.success(
        response.message ||
        `Item '${response.item_name || itemInfo.i_name}' updated`,
      );
      // router.replace(`/control/products/update/${response.item_slug}`, { scroll: false }); // because slug can also be changed
      router.push(`/control/products`, {
        scroll: true,
      });
    }
  };

  return (
    <form
      id="updateproductform"
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl p-6 space-y-4 text-sm"
    >
      {/* Current Main Image Display */}
      <div className="border-b border-stone-300 pb-4">
        <label className="block text-sm font-medium mb-2">
          Current Main Image
        </label>
        <div className="relative w-full max-w-md h-64 bg-white border border-stone-300 rounded-md overflow-hidden">
          <Image
            src={itemInfo.i_mainimg}
            alt="Current main product image"
            fill
            sizes="100%"
            className="object-contain object-center"
          />
        </div>
      </div>

      {/* Existing Images Grid */}
      <div className="border-b border-stone-300 pb-4">
        <label className="block text-sm font-medium mb-2">
          Item Image Gallery
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {itemInfo.i_images.map((image) => {
            const isMain = image.ismain;
            const isRemoved = watch("remove_additional_images")?.includes(
              image.imgid,
            );
            const isNewMainFromExisting =
              watch("item_newmainfromexisting") === image.imgid;

            return (
              <div
                key={image.imgid}
                className={`relative w-full h-32 group ${isRemoved ? "opacity-35" : ""
                  }`}
              >
                <Image
                  src={image.imgsrc}
                  alt="Product image"
                  fill
                  sizes="100%"
                  className="object-cover object-center rounded-md bg-white"
                />
                <div className="absolute top-1 right-1 flex flex-col items-end gap-1">
                  {!isMain && !isNewMainFromExisting && !isRemoved && (
                    <button
                      type="button"
                      onClick={() => handleSetNewMainImage(image.imgid)}
                      disabled={isSubmitting}
                      className="p-0.5 bg-blue-500 text-[0.625rem] leading-tight text-white rounded-md hover:bg-blue-600 border border-stone-700"
                    >
                      Set as main
                    </button>
                  )}
                  {!isMain && isNewMainFromExisting && !isRemoved && (
                    <button
                      type="button"
                      onClick={() => handleUndoSetAsMain(image.imgid)}
                      disabled={isSubmitting}
                      className="p-0.5 bg-stone-100 text-[0.625rem] leading-tight text-stone-700 rounded-md hover:bg-stone-300 border border-stone-700"
                    >
                      Undo set as main
                    </button>
                  )}
                  {/* Allows the following cases:
                                        1. An image that is not main, not being set as a new main from existing ones, and not removed. 
                                        2. An image that is currently main **and** 
                                            - Either there is a new main image being uploaded, 
                                            - Or a main image is being selected from an existing one,
                                            - And it is not marked for removal. */}
                  {!isRemoved &&
                    ((!isMain && !isNewMainFromExisting) ||
                      (isMain &&
                        ((Array.isArray(newMainImg) && newMainImg.length > 0) ||
                          newMainFromExisting))) && (
                      <button
                        aria-label="remove"
                        type="button"
                        onClick={() => handleRemoveImage(image.imgid)}
                        disabled={isSubmitting}
                        className="p-0.5 bg-red-500 text-white rounded-md hover:bg-red-600 border border-stone-700"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  {isRemoved && (
                    <button
                      aria-label="undo"
                      type="button"
                      onClick={() => handleUndoRemoveImage(image.imgid)}
                      disabled={isSubmitting}
                      className="p-0.5 bg-white text-evoAdminPrimary rounded-md hover:bg-stone-300 border border-stone-700"
                    >
                      <Undo2 className="size-4" />
                    </button>
                  )}
                </div>
                {isMain && (
                  <div className="absolute bottom-1 left-1 bg-green-600 text-white px-1 py-0.5 rounded-md text-[0.625rem] leading-tight border border-stone-700">
                    main
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Banner Selection - REMOVED: Banner image is now uploaded directly in Add Header form */}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* New Main Image */}
        {/* <div>
          <label className="block text-sm font-medium">
            {`New Main Image `}
            <span className="text-gray-500 text-xs">{`(optional)`}</span>
          </label>
          <p className="text-[0.6875rem] leading-3 text-muted-foreground">{`(only jpeg/png/jpg/webp)`}</p>
          <div>
            <Controller
              control={control}
              name="item_newmainimg"
              render={({ field }) => (
                <div className="mt-1 block">
                  <FileUploader
                    value={field.value}
                    onValueChange={(files) => {
                      if (files.length === 0) {
                        undoRemovalOfMainImage();
                      } else {
                        if (newMainFromExisting) {
                          setValue("item_newmainfromexisting", ""); // clear any other selected image to set as main
                        }
                      }
                      field.onChange(files); // important: keep this at the end of the function
                    }}
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
          {errors.item_newmainimg && (
            <EvoFormInputError>
              {errors.item_newmainimg?.message?.toString()}
            </EvoFormInputError>
          )}
        </div> */}

        {/* New Additional Images */}
        <div>
          <label className="block text-sm font-medium">
            {`Add More Images `}
            <span className="text-gray-500 text-xs">{`(optional)`}</span>
          </label>
          <p className="text-[0.6875rem] leading-3 text-muted-foreground">{`(only jpeg/png/jpg/webp)`}</p>
          <div>
            <Controller
              control={control}
              name="additional_newimages"
              render={({ field }) => (
                <div className="mt-1 block">
                  <FileUploader
                    value={field.value}
                    onValueChange={(val) => {
                      console.log("FileUploader onValueChange:", val);
                      field.onChange(val);
                    }}
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
          {errors.additional_newimages && (
            <EvoFormInputError>
              {errors.additional_newimages?.message?.toString()}
            </EvoFormInputError>
          )}
        </div>
      </div>

      {/* Item Name */}
      <div>
        <label className="block text-sm font-medium">Name*</label>
        <input
          type="text"
          {...register("item_name")}
          disabled={isSubmitting}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-300 focus:ring-stone-600"
        />
        {errors.item_name && (
          <EvoFormInputError>{errors.item_name.message}</EvoFormInputError>
        )}
      </div>

      {/* Item Slug */}
      <div>
        <div className="w-fit flex gap-3 items-center">
          <label className="block text-sm font-medium">Slug*</label>
          <button
            onClick={generateSlug}
            type="button"
            aria-label="generate slug"
            disabled={isSubmitting}
            className="w-fit px-2 py-0.5 text-xs text-stone-50 bg-stone-800 hover:bg-stone-900 rounded-[6px] disabled:bg-stone-600 disabled:cursor-default"
          >
            generate
          </button>
        </div>
        <input
          type="text"
          {...register("item_slug")}
          disabled={isSubmitting}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-300 focus:ring-stone-600"
        />
        {errors.item_slug && (
          <EvoFormInputError>{errors.item_slug.message}</EvoFormInputError>
        )}
      </div>

      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Price*</label>
          <input
            type="text"
            {...register("item_price")}
            disabled={isSubmitting}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-300 focus:ring-stone-600"
          />
          {errors.item_price && (
            <EvoFormInputError>{errors.item_price.message}</EvoFormInputError>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">
            Buying Price{" "}
            <span className="text-stone-500 text-xs font-normal">
              (Admin Only)
            </span>
          </label>
          <input
            type="text"
            {...register("item_buyingprice")}
            disabled={isSubmitting}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-300 focus:ring-stone-600"
          />
          {errors.item_buyingprice && (
            <EvoFormInputError>
              {errors.item_buyingprice.message}
            </EvoFormInputError>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Previous Price</label>
          <input
            type="text"
            {...register("item_prevprice")}
            disabled={isSubmitting}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-300 focus:ring-stone-600"
          />
          {errors.item_prevprice && (
            <EvoFormInputError>
              {errors.item_prevprice.message}
            </EvoFormInputError>
          )}
        </div>
      </div>

      {/* In Stock (Boolean as a Checkbox) */}
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="text-sm font-medium">In Stock</label>
          <Controller
            control={control}
            name="item_instock"
            render={({ field }) => (
              <div className="min-[500px]:max-lg:justify-self-start justify-self-end">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </div>
            )}
          />
        </div>

        {errors.item_instock && (
          <EvoFormInputError>{errors.item_instock.message}</EvoFormInputError>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Product Description{" "}
          <span className="text-stone-500 text-xs font-normal">(Optional)</span>
        </label>
        <textarea
          {...register("description")}
          disabled={isSubmitting}
          rows={4}
          className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 resize-y"
          placeholder="Detailed product description..."
        />
        {errors.description && (
          <EvoFormInputError>{errors.description.message}</EvoFormInputError>
        )}
        
        {/* Update Button after Description */}
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-2 bg-stone-800 text-white rounded text-xs md:text-sm hover:bg-stone-900 disabled:bg-stone-600 transition-colors duration-100"
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </div>

      {/* Short Description */
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Short Description{" "}
          <span className="text-stone-500 text-xs font-normal">(Optional)</span>
        </label>
        <textarea
          {...register("shortDescription")}
          disabled={isSubmitting}
          rows={2}
          className="mt-1 block w-full border border-stone-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent disabled:bg-stone-50 disabled:text-stone-500 resize-y"
          placeholder="Brief product summary..."
        />
        {errors.shortDescription && (
          <EvoFormInputError>
            {errors.shortDescription.message}
          </EvoFormInputError>
        )}
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
        <label className="block text-sm font-medium">
          Key Features{" "}
          <span className="text-gray-500 text-xs">(If applicable)</span>
        </label>
        {featureFields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2 mt-1">
            <input
              type="text"
              {...register(`item_features.${index}` as const)}
              placeholder="write key feature"
              disabled={isSubmitting}
              className="block w-full border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none focus:ring-1 ring-stone-300 focus:ring-stone-600 placeholder:text-sm"
            />
            <button
              type="button"
              onClick={() => removeFeature(index)}
              disabled={isSubmitting}
              className="text-red-600 text-xs font-[500]"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => appendFeature("")}
          disabled={isSubmitting}
          className="mt-2 text-[#0866FF] text-xs font-[500] flex items-center"
        >
          <IoIosAddCircle className="inline size-5 mr-1" />
          Add Feature
        </button>
        {errors.item_features && (
          <EvoFormInputError>
            {(errors.item_features as any).message}
          </EvoFormInputError>
        )}
        
        {/* Update Button after Features */}
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-2 bg-stone-800 text-white rounded text-xs md:text-sm hover:bg-stone-900 disabled:bg-stone-600 transition-colors duration-100"
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </div>

      {/* Item Colors (Dynamic Array of Text Inputs) */}

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
                aria-label="remove"
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
    </form>
  );
};

export { UpdateProductForm };
