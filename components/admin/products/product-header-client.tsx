"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { ItemBrandOptions } from "@/dal/product-inputs";
import { useSearchParamsState } from "@/hooks/use-search-params-state";

const productFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
});

type ProductFilterValues = z.infer<typeof productFilterSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
  value: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  value: string;
  category: any;
}

interface Brand {
  label: string;
  value: string;
  slug: string;
}

const ProductHeaderClient = () => {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([...ItemBrandOptions]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { updateSearchParams, resetSearchParams, getParam } =
    useSearchParamsState({
      basePath: "/control/products",
    });

  // Memoize default values to prevent unnecessary re-renders
  const defaultValues = useMemo(
    () => ({
      search: getParam("search"),
      category: getParam("category"),
      subcategory: getParam("subcategory"),
      brand: getParam("brand"),
    }),
    [getParam]
  );

  const form = useForm<ProductFilterValues>({
    resolver: zodResolver(productFilterSchema),
    defaultValues,
  });

  // Update form values when search params change
  useEffect(() => {
    form.reset(defaultValues);
    setSelectedCategory(defaultValues.category || "");
  }, [defaultValues, form]);

  // Fetch filter options (categories, brands) on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!currentUser) return;

      try {
        // Fetch categories
        const categoriesResponse = await axios.get("/categories");
        const categoriesData = (categoriesResponse.data.data || []).map(
          (cat: any) => ({
            id: cat._id,
            name: cat.name,
            slug: cat.slug,
            value: cat._id, // Use ID for select value
          })
        );
        setCategories(categoriesData);

        // Fetch subcategories
        const subcategoriesResponse = await axios.get("/subcategories");
        const subcategoriesData = (subcategoriesResponse.data.data || []).map(
          (sub: any) => ({
            id: sub._id,
            name: sub.name,
            slug: sub.slug,
            value: sub._id, // Use ID for select value
            category: sub.category,
          })
        );
        setSubcategories(subcategoriesData);

        // // Fetch brands
        // const brandsResponse = await axios.get('/api/admin/taxonomy/brands');
        // setBrands(brandsResponse.data.brands_data || []);
      } catch (error) {
        toast.error("Failed to fetch filter options.");
      }
    };

    fetchFilterOptions();
  }, [currentUser]);

  // Filter subcategories based on selected category
  const filteredSubcategories = useMemo(() => {
    if (!selectedCategory) return subcategories;
    // Filter by category ID (selectedCategory is now an ID, not a slug)
    return subcategories.filter(
      (sub) =>
        sub.category?._id === selectedCategory ||
        sub.category?.id === selectedCategory
    );
  }, [subcategories, selectedCategory]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // Reset subcategory when category changes
    form.setValue("subcategory", "");
  };

  const handleReset = () => {
    form.reset({
      search: "",
      category: "",
      subcategory: "",
      brand: "",
    });
    setSelectedCategory("");
    resetSearchParams();
  };

  const onSubmit = (data: ProductFilterValues) => {
    updateSearchParams({
      search: data.search || null,
      category: data.category || null,
      subcategory: data.subcategory || null,
      brand: data.brand || null,
    });
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-4 items-end">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col xl:flex-row gap-4 items-end"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name..."
                        className="pl-8 text-xs placeholder:text-stone-400 placeholder:text-xs"
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCategoryChange(value);
                      }}
                      value={field.value}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue
                          placeholder={
                            <span className="text-stone-400 text-xs">
                              Select category
                            </span>
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs bg-stone-500/10 text-rose-500 mb-2"
                          onClick={() => {
                            field.onChange("");
                            handleCategoryChange("");
                          }}
                        >
                          Clear
                        </Button>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.value}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedCategory || selectedCategory === "all"}
                    >
                      <SelectTrigger className="disabled:cursor-default text-xs">
                        <SelectValue
                          placeholder={
                            <span className="text-stone-400 text-xs">
                              Select subcategory
                            </span>
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
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
                        {filteredSubcategories.map((subcategory) => (
                          <SelectItem
                            key={subcategory.id}
                            value={subcategory.value}
                          >
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="text-xs">
                        <SelectValue
                          placeholder={
                            <span className="text-stone-400 text-xs">
                              Select brand
                            </span>
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
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
                        {brands.map((brand, index) => (
                          <SelectItem
                            key={brand.value || `brand-${index}`}
                            value={brand.value}
                          >
                            {brand.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2 items-center">
            <Button
              type="submit"
              className="bg-brand-600 hover:bg-brand-400"
              size="default"
              aria-label="filter products"
            >
              Filter
            </Button>
            <Button
              type="button"
              size="default"
              variant="outline"
              onClick={handleReset}
              aria-label="reset filters"
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export { ProductHeaderClient };
