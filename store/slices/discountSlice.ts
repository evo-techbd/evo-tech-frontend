import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type DiscountState = {
    discountAmount: number;
    couponCode: string | null;
    couponType: "percentage" | "fixed" | null;
};

const initialState: DiscountState = {
    discountAmount: 0.0,
    couponCode: null,
    couponType: null,
};

const discountSlice = createSlice({
    name: "discount",
    initialState,
    reducers: {
        setDiscountAmount: (state, action: PayloadAction<number>) => {
            state.discountAmount = action.payload;
        },
        applyCoupon: (state, action: PayloadAction<{ code: string; amount: number; type: "percentage" | "fixed" }>) => {
            state.couponCode = action.payload.code;
            state.discountAmount = action.payload.amount;
            state.couponType = action.payload.type;
        },
        removeCoupon: (state) => {
            state.couponCode = null;
            state.discountAmount = 0;
            state.couponType = null;
        },
    },
});

export const { setDiscountAmount, applyCoupon, removeCoupon } = discountSlice.actions;

export default discountSlice.reducer;
