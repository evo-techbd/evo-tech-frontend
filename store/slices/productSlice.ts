import { type ProductDisplayType } from "@/schemas/admin/product/productschemas";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ProductStates = {
    publishedStates: Record<string, boolean>; // keyed by item id
    groupBuyStates: Record<string, boolean>; // keyed by item id
    allProducts: Array<ProductDisplayType>;
    fetched: boolean;
    lastFetched: number | null;
};

const initialState: ProductStates = {
    publishedStates: {},
    groupBuyStates: {},
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

        updateProductGroupBuyState: (state, action: PayloadAction<{ productId: string; isPreOrder: boolean; }>) => {
            const { productId, isPreOrder } = action.payload;
            state.groupBuyStates[productId] = isPreOrder;
        },

        setProductsList: (state, action: PayloadAction<ProductDisplayType[]>) => {
            state.allProducts = action.payload;
            // Fresh server data wins over toggles made earlier in the session
            state.publishedStates = {};
            state.groupBuyStates = {};
            state.fetched = true;
            state.lastFetched = Date.now();
        },

        removeAProduct: (state, action: PayloadAction<{ productId: string; }>) => {
            const { productId } = action.payload;
            delete state.publishedStates[productId]; // Clean up published state too to prevent memory leaks
            delete state.groupBuyStates[productId];
            // Remove from products list
            state.allProducts = state.allProducts.filter(item => item.itemid !== productId);
        },
    },
});

export const {
    updateProductPublishedState,
    updateProductGroupBuyState,
    setProductsList,
    removeAProduct,
} = productSlice.actions;

export default productSlice.reducer;
