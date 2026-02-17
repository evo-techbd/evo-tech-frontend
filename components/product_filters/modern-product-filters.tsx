"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { FC } from "react";
import { FiCheck } from "react-icons/fi";
import * as Slider from "@radix-ui/react-slider";

interface ModernProductFiltersProps {
  availableBrands: any[];
  availableSubcategories: any[];
  availableCategories?: any[];
  categorySlug?: string;
}

const ModernProductFilters = ({
  availableBrands,
  availableSubcategories,
  availableCategories,
  categorySlug,
}: ModernProductFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<number[]>([
    parseInt(searchParams.get("minPrice") || "0"),
    parseInt(searchParams.get("maxPrice") || "100000"),
  ]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      params.delete("page"); // Reset to first page on filter change
      return params.toString();
    },
    [searchParams]
  );

  const removeQueryParam = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);
      params.delete("page"); // Reset to first page on filter change
      return params.toString();
    },
    [searchParams]
  );

  const toggleFilter = useCallback(
    (filterName: string, value: string) => {
      const current = searchParams.get(filterName);
      if (current === value) {
        // Remove filter if clicking same value
        router.push(`${pathname}?${removeQueryParam(filterName)}`, {
          scroll: false,
        });
      } else {
        // Set new filter value
        router.push(`${pathname}?${createQueryString(filterName, value)}`, {
          scroll: false,
        });
      }
    },
    [searchParams, pathname, router, createQueryString, removeQueryParam]
  );

  const applyPriceFilter = () => {
    let query = createQueryString("minPrice", priceRange[0].toString());
    const params = new URLSearchParams(query);
    params.set("maxPrice", priceRange[1].toString());
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const activeFiltersCount = Array.from(searchParams.keys()).filter(
    (key) => !["page", "perpage", "sortBy", "sortOrder"].includes(key)
  ).length;

  const currentBrand = searchParams.get("brand");
  const currentSubcategory = searchParams.get("subcategory");
  const currentInStock = searchParams.get("instock");

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-stone-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Availability Filter */}
      <div className="space-y-3">
        <h4 className="font-semibold text-stone-900 text-sm uppercase tracking-wide">
          Availability
        </h4>
        <div className="space-y-2">
          <FilterCheckbox
            label="In Stock"
            checked={currentInStock === "true"}
            onChange={() => toggleFilter("instock", "true")}
          />
          <FilterCheckbox
            label="Out of Stock"
            checked={currentInStock === "false"}
            onChange={() => toggleFilter("instock", "false")}
          />
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <h4 className="font-semibold text-stone-900 text-sm uppercase tracking-wide">
          Price Range
        </h4>
        <div className="space-y-4 px-1">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={priceRange}
            onValueChange={setPriceRange}
            max={100000}
            min={0}
            step={1000}
          >
            <Slider.Track className="bg-stone-200 relative grow rounded-full h-[3px]">
              <Slider.Range className="absolute bg-brand-600 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-5 h-5 bg-white border-2 border-brand-600 rounded-full hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              aria-label="Min price"
            />
            <Slider.Thumb
              className="block w-5 h-5 bg-white border-2 border-brand-600 rounded-full hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              aria-label="Max price"
            />
          </Slider.Root>

          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4 items-center">
              <span className="text-stone-600">
                BDT {priceRange[0].toLocaleString()}
              </span>
              <span className="text-stone-400">–</span>
              <span className="text-stone-600">
                BDT {priceRange[1].toLocaleString()}
              </span>
            </div>

            <div className="flex-none">
              <button
                onClick={applyPriceFilter}
                className="py-2 px-4 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      {availableCategories && availableCategories.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-stone-900 text-sm uppercase tracking-wide">
            Categories
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {availableCategories.map((cat: any) => (
              <FilterCheckbox
                key={cat._id}
                label={cat.name}
                checked={
                  (searchParams.get("category") || categorySlug || "") ===
                  (cat.slug || cat._id)
                }
                onChange={() => toggleFilter("category", cat.slug || cat._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Subcategory Filter */}
      {availableSubcategories.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-stone-900 text-sm uppercase tracking-wide">
            Subcategory
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {availableSubcategories.map((sub) => (
              <FilterCheckbox
                key={sub._id}
                label={sub.name}
                checked={currentSubcategory === sub._id}
                onChange={() => toggleFilter("subcategory", sub._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Brand Filter */}
      {availableBrands.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-stone-900 text-sm uppercase tracking-wide">
            Brand
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {availableBrands.map((brand) => (
              <FilterCheckbox
                key={brand._id}
                label={brand.name}
                checked={currentBrand === brand._id}
                onChange={() => toggleFilter("brand", brand._id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Checkbox Component
interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const FilterCheckbox: FC<FilterCheckboxProps> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-5 h-5 border-2 border-stone-300 rounded peer-checked:border-brand-600 peer-checked:bg-brand-600 transition-all flex items-center justify-center group-hover:border-brand-400">
          {checked && <FiCheck className="w-3 h-3 text-white" />}
        </div>
      </div>
      <div className="flex items-center w-full">
        <span className="text-sm text-stone-700 group-hover:text-stone-900">
          {label}
        </span>
      </div>
    </label>
  );
};

export { ModernProductFilters };
