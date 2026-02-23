import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/schemas/cartSchema";

export interface PendingUpdate {
  item_id: string;
  item_color: string | null;
  new_quantity: number;
}

type CartState = {
    cartdata: CartItem[] | null;
    pendingUpdates: PendingUpdate[];
    isUpdating: boolean;
};

const initialState: CartState = {
    cartdata: null,
    pendingUpdates: [],
    isUpdating: false,
};

const cartSlice = createSlice({
    name: "shoppingcart",
    initialState,
    reducers: {
        setCartData: (state, action: PayloadAction<CartItem[]>) => {
            state.cartdata = action.payload;
        },
        addPendingUpdate: (state, action: PayloadAction<PendingUpdate>) => {
            const { item_id, item_color, new_quantity } = action.payload;
            const existingIndex = state.pendingUpdates.findIndex(
                update => update.item_id === item_id && update.item_color === item_color
            );
            
            if (existingIndex >= 0) {
                state.pendingUpdates[existingIndex].new_quantity = new_quantity;
            } else {
                state.pendingUpdates.push(action.payload);
            }
        },
        removePendingUpdate: (state, action: PayloadAction<{ item_id: string; item_color: string | null }>) => {
            const { item_id, item_color } = action.payload;
            state.pendingUpdates = state.pendingUpdates.filter(
                update => !(update.item_id === item_id && update.item_color === item_color)
            );
        },
        clearPendingUpdates: (state) => {
            state.pendingUpdates = [];
        },
        setIsUpdating: (state, action: PayloadAction<boolean>) => {
            state.isUpdating = action.payload;
        },
        updateCartItemQuantities: (state, action: PayloadAction<PendingUpdate[]>) => {
            if (state.cartdata) {
                const updates = action.payload;
                state.cartdata = state.cartdata.map(item => {
                    const update = updates.find(
                        u => u.item_id === item.item_id && u.item_color === item.item_color
                    );
                    return update ? { ...item, item_quantity: update.new_quantity } : item;
                });
            }
        },
        removeCartItem: (state, action: PayloadAction<{ item_id: string; item_color: string | null }>) => {
            const { item_id, item_color } = action.payload;
            if (state.cartdata) {
                state.cartdata = state.cartdata.filter(
                    item => !(item.item_id === item_id && item.item_color === item_color)
                );
            }
        },
    },
});

export const { 
    setCartData, 
    addPendingUpdate, 
    removePendingUpdate, 
    clearPendingUpdates, 
    setIsUpdating, 
    updateCartItemQuantities,
    removeCartItem 
} = cartSlice.actions;

export default cartSlice.reducer;
