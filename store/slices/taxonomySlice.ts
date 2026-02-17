import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Interface definitions matching the API response
export interface TaxonomyBrand {
  id: string;
  name: string;
  slug: string;
  url: string;
}

export interface TaxonomySubcategory {
  id: string;
  name: string;
  slug: string;
  url: string;
  brands: TaxonomyBrand[];
}

export interface TaxonomyCategory {
  id: string;
  name: string;
  slug: string;
  url: string;
  description?: string;
  has_subcategories: boolean;
  subcategories: TaxonomySubcategory[];
  direct_brands: TaxonomyBrand[];
}

export interface TaxonomyState {
  categories: TaxonomyCategory[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  isInitialized: boolean;
}

const initialState: TaxonomyState = {
  categories: [],
  isLoading: false,
  error: null,
  lastFetched: null,
  isInitialized: false,
};

const taxonomySlice = createSlice({
  name: "taxonomy",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setTaxonomyData: (state, action: PayloadAction<TaxonomyCategory[]>) => {
      state.categories = action.payload;
      state.isLoading = false;
      state.error = null;
      state.lastFetched = Date.now();
      state.isInitialized = true;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetTaxonomy: (state) => {
      state.categories = [];
      state.isLoading = false;
      state.error = null;
      state.lastFetched = null;
      state.isInitialized = false;
    },
    updateCategory: (state, action: PayloadAction<TaxonomyCategory>) => {
      const index = state.categories.findIndex(
        (cat) => cat.id === action.payload.id
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    addCategory: (state, action: PayloadAction<TaxonomyCategory>) => {
      state.categories.push(action.payload);
    },
    removeCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(
        (cat) => cat.id !== action.payload
      );
    },
  },
});

export const {
  setLoading,
  setTaxonomyData,
  setError,
  clearError,
  resetTaxonomy,
  updateCategory,
  addCategory,
  removeCategory,
} = taxonomySlice.actions;

// Selectors
export const selectTaxonomyCategories = (state: { taxonomy: TaxonomyState }) =>
  state.taxonomy.categories;
export const selectTaxonomyLoading = (state: { taxonomy: TaxonomyState }) =>
  state.taxonomy.isLoading;
export const selectTaxonomyError = (state: { taxonomy: TaxonomyState }) =>
  state.taxonomy.error;
export const selectTaxonomyInitialized = (state: { taxonomy: TaxonomyState }) =>
  state.taxonomy.isInitialized;
export const selectCategoryBySlug =
  (slug: string) => (state: { taxonomy: TaxonomyState }) =>
    state.taxonomy.categories.find((category) => category.slug === slug);
export const selectSubcategoryBySlug =
  (categorySlug: string, subcategorySlug: string) =>
  (state: { taxonomy: TaxonomyState }) => {
    const category = state.taxonomy.categories.find(
      (cat) => cat.slug === categorySlug
    );
    return category?.subcategories.find(
      (subcat) => subcat.slug === subcategorySlug
    );
  };

export default taxonomySlice.reducer;
