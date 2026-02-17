"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ModernProductsListing } from "@/components/products/modern-products-listing";
import { ModernProductFilters } from "@/components/product_filters/modern-product-filters";
import { HiViewGrid, HiViewList } from "react-icons/hi";
import { FiFilter } from "react-icons/fi";

interface ModernProductsContainerProps {
  fetchedProductsData: any[];
  paginationMetaForData: any;
  categoryData: any;
  availableBrands: any[];
  availableSubcategories: any[];
  availableCategories?: any[];
}

const ModernProductsContainer = ({
  fetchedProductsData,
  paginationMetaForData,
  categoryData,
  availableBrands,
  availableSubcategories,
  availableCategories = [],
}: ModernProductsContainerProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilterAndNavigate = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value) params.set(name, value);
    else params.delete(name);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Persist view mode
  useEffect(() => {
    const savedViewMode = localStorage.getItem("products-view-mode");
    if (savedViewMode === "list" || savedViewMode === "grid") {
      setViewMode(savedViewMode);
    }

    const savedFilterState = localStorage.getItem("products-filter-open");
    if (savedFilterState !== null) {
      setIsFilterOpen(JSON.parse(savedFilterState));
    } else {
      setIsFilterOpen(true); // Default to open on desktop
    }
  }, []);

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("products-view-mode", mode);
  };

  const toggleFilters = () => {
    const newState = !isFilterOpen;
    setIsFilterOpen(newState);
    localStorage.setItem("products-filter-open", JSON.stringify(newState));
  };

  return (
    <div className="w-full h-fit">
      {/* Header with view toggles and filter button */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleFilters}
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isFilterOpen ? "Hide" : "Show"} Filters
            </span>
          </button>

          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex lg:hidden items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>

          <div className="text-sm text-stone-600">
            <span className="font-semibold text-stone-900">
              {paginationMetaForData.totalItems}
            </span>{" "}
            Products
            {categoryData && (
              <span className="ml-1">in {categoryData.name}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewModeChange("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-brand-600 text-white"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
            aria-label="Grid view"
          >
            <HiViewGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleViewModeChange("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-brand-600 text-white"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
            aria-label="List view"
          >
            <HiViewList className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row w-full h-fit gap-6">
        {/* Filters Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out lg:flex flex-none ${
            isFilterOpen
              ? "lg:w-[280px]"
              : "lg:w-0 lg:opacity-0 lg:pointer-events-none"
          } hidden`}
        >
          <ModernProductFilters
            availableBrands={availableBrands}
            availableSubcategories={availableSubcategories}
            availableCategories={availableCategories}
            categorySlug={categoryData?.slug}
          />
        </div>

        {/* Mobile Filters Overlay */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-xl overflow-y-auto">
              <div className="p-4 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-lg"
                  aria-label="Close filters"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <ModernProductFilters
                  availableBrands={availableBrands}
                  availableSubcategories={availableSubcategories}
                  availableCategories={availableCategories}
                  categorySlug={categoryData?.slug}
                />
              </div>
            </div>
          </div>
        )}

        {/* Products Listing */}
        <div className="flex-1 w-full h-fit">
          <Suspense
            fallback={
              <div className="w-full h-[calc(100vh-200px)] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <ModernProductsListing
              fetchedProdData={fetchedProductsData}
              paginationMeta={paginationMetaForData}
              viewMode={viewMode}
            />
          </Suspense>
        </div>

        {/* Right-side related panel (brands / subcategories / categories) */}
      </div>
    </div>
  );
};

export { ModernProductsContainer };
