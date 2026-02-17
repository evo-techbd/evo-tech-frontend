import { type ProductDisplayType } from "@/schemas/admin/product/productschemas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ProductStates = {
    publishedStates: Record<string, boolean>; // keyed by item id
    allProducts: Array<ProductDisplayType>;
    fetched: boolean;
    lastFetched: number | null;
};

const initialState: ProductStates = {
    publishedStates: {},
    allProducts: [],
    fetched: false,
    lastFetched: null,
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        updateProductPublishedState: (state, action: PayloadAction<{ productId: string; published: boolean; }>) => {
            const { productId, published } = action.payload;
            state.publishedStates[productId] = published;
        },

        setProductsList: (state, action: PayloadAction<ProductDisplayType[]>) => {
            state.allProducts = action.payload;
            state.fetched = true;
            state.lastFetched = Date.now();
        },

        removeAProduct: (state, action: PayloadAction<{ productId: string; }>) => {
            const { productId } = action.payload;
            delete state.publishedStates[productId]; // Clean up published state too to prevent memory leaks
            // Remove from products list
            state.allProducts = state.allProducts.filter(item => item.itemid !== productId);
        },
    },
});

export const {
    updateProductPublishedState,
    setProductsList,
    removeAProduct,
} = productSlice.actions;

export default productSlice.reducer;
