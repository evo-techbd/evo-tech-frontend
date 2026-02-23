"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  selectTaxonomyCategories,
  selectTaxonomyLoading,
  selectTaxonomyError,
  selectTaxonomyInitialized,
  selectCategoryBySlug,
  selectSubcategoryBySlug,
  type TaxonomyCategory,
  type TaxonomySubcategory,
  type TaxonomyBrand,
} from "@/store/slices/taxonomySlice";

/**
 * Custom hook for accessing taxonomy data from Redux store
 * Provides categories, loading state, error state, and utility functions
 */
export const useTaxonomy = () => {
  const categories = useSelector((state: RootState) =>
    selectTaxonomyCategories(state)
  );
  const isLoading = useSelector((state: RootState) =>
    selectTaxonomyLoading(state)
  );
  const error = useSelector((state: RootState) => selectTaxonomyError(state));
  const isInitialized = useSelector((state: RootState) =>
    selectTaxonomyInitialized(state)
  );

  // Utility functions for easy data access
  const getCategoryBySlug = (slug: string): TaxonomyCategory | undefined => {
    return categories.find((category) => category.slug === slug);
  };

  const getSubcategoryBySlug = (
    categorySlug: string,
    subcategorySlug: string
  ): TaxonomySubcategory | undefined => {
    const category = getCategoryBySlug(categorySlug);
    return category?.subcategories.find(
      (subcat) => subcat.slug === subcategorySlug
    );
  };

  const getAllBrands = (): TaxonomyBrand[] => {
    const allBrands: TaxonomyBrand[] = [];

    categories.forEach((category) => {
      // Add direct brands from category
      allBrands.push(...category.direct_brands);

      // Add brands from subcategories
      category.subcategories.forEach((subcategory) => {
        allBrands.push(...subcategory.brands);
      });
    });

    // Remove duplicates based on ID
    const uniqueBrands = allBrands.filter(
      (brand, index, self) => index === self.findIndex((b) => b.id === brand.id)
    );

    return uniqueBrands;
  };

  const getCategoriesForSelect = () => {
    return categories.map((category) => ({
      // value should be the ID to match backend expectations
      value: category.id,
      label: category.name,
      id: category.id,
    }));
  };

  const getSubcategoriesForSelect = (categoryId?: string) => {
    if (!categoryId) return [];

    // categoryId here can be an id or slug depending on usage; try to resolve by id first
    let category = categories.find((cat) => cat.id === categoryId);
    if (!category) category = getCategoryBySlug(categoryId);
    if (!category) return [];

    return category.subcategories.map((subcategory) => ({
      // use id so selects return IDs that backend accepts
      value: subcategory.id,
      label: subcategory.name,
      id: subcategory.id,
    }));
  };

  const getBrandsForSelect = (
    categoryId?: string,
    subcategoryId?: string
  ) => {
    if (!categoryId) {
      // Return all brands if no category specified
      return getAllBrands().map((brand) => ({
        value: brand.id,
        label: brand.name,
        id: brand.id,
      }));
    }

    // categoryId can be an id or slug depending on usage; try to resolve by id first
    let category = categories.find((cat) => cat.id === categoryId);
    if (!category) category = getCategoryBySlug(categoryId);
    if (!category) return [];

    if (subcategoryId) {
      // subcategoryId may be id or slug; try both
      let subcategory = category.subcategories.find(
        (sub) => sub.id === subcategoryId
      );
      if (!subcategory)
        subcategory = category.subcategories.find(
          (sub) => sub.slug === subcategoryId
        );
      return (
        subcategory?.brands.map((brand) => ({
          value: brand.id,
          label: brand.name,
          id: brand.id,
        })) || []
      );
    } else {
      // Return all brands for category (direct brands + brands from all subcategories)
      const allCategoryBrands: TaxonomyBrand[] = [];
      
      // Add direct brands from category
      allCategoryBrands.push(...category.direct_brands);
      
      // Add brands from all subcategories
      category.subcategories.forEach((subcategory) => {
        allCategoryBrands.push(...subcategory.brands);
      });
      
      // Remove duplicates based on ID
      const uniqueBrands = allCategoryBrands.filter(
        (brand, index, self) => index === self.findIndex((b) => b.id === brand.id)
      );
      
      return uniqueBrands.map((brand) => ({
        value: brand.id,
        label: brand.name,
        id: brand.id,
      }));
    }
  };

  return {
    // Data
    categories,
    isLoading,
    error,
    isInitialized,

    // Utility functions
    getCategoryBySlug,
    getSubcategoryBySlug,
    getAllBrands,
    getCategoriesForSelect,
    getSubcategoriesForSelect,
    getBrandsForSelect,

    // Computed values
    hasCategories: categories.length > 0,
    totalCategories: categories.length,
    totalSubcategories: categories.reduce(
      (total, cat) => total + cat.subcategories.length,
      0
    ),
    totalBrands: getAllBrands().length,
  };
};

/**
 * Hook specifically for accessing category data by slug
 */
export const useCategory = (slug: string) => {
  const category = useSelector((state: RootState) =>
    selectCategoryBySlug(slug)(state)
  );
  return category;
};

/**
 * Hook specifically for accessing subcategory data by slugs
 */
export const useSubcategory = (
  categorySlug: string,
  subcategorySlug: string
) => {
  const subcategory = useSelector((state: RootState) =>
    selectSubcategoryBySlug(categorySlug, subcategorySlug)(state)
  );
  return subcategory;
};
