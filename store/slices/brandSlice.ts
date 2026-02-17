import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BrandTableType } from '@/schemas/admin/product/taxonomySchemas';

interface BrandState {
    allBrands: {
        data: BrandTableType[];
        fetched: boolean;
    };
}

const initialState: BrandState = {
    allBrands: {
        data: [],
        fetched: false,
    },
};

const brandSlice = createSlice({
    name: 'brands',
    initialState,
    reducers: {
        setBrandsList: (state, action: PayloadAction<{
            data: BrandTableType[];
            fetchedStatus: boolean;
        }>) => {
            state.allBrands.data = action.payload.data;
            state.allBrands.fetched = action.payload.fetchedStatus;
        },

        addABrand: (state, action: PayloadAction<BrandTableType>) => {
            const newBrand = action.payload;
            state.allBrands.data.push(newBrand);
            // Sort brands alphabetically by name for consistent ordering
            state.allBrands.data.sort((a, b) => a.name.localeCompare(b.name));
        },

        updateABrand: (state, action: PayloadAction<BrandTableType>) => {
            const updatedBrand = action.payload;
            const index = state.allBrands.data.findIndex(
                brand => brand.id === updatedBrand.id
            );

            if (index !== -1) {
                state.allBrands.data[index] = updatedBrand;
                // Resort the brands alphabetically by name
                state.allBrands.data.sort((a, b) => a.name.localeCompare(b.name));
            }
        },

        removeABrand: (state, action: PayloadAction<{ brandId: string }>) => {
            const { brandId } = action.payload;

            // Remove brand from the main list
            state.allBrands.data = state.allBrands.data.filter(
                brand => brand.id !== brandId
            );
        },

        clearBrandsData: (state) => {
            state.allBrands.data = [];
            state.allBrands.fetched = false;
        },
    },
});

export const {
    setBrandsList,
    addABrand,
    updateABrand,
    removeABrand,
    clearBrandsData,
} = brandSlice.actions;

export default brandSlice.reducer;
