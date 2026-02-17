import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type OrderStates = {
  allOrders: Array<OrderWithItemsType>;
  fetched: boolean;
};

const initialState: OrderStates = {
  allOrders: [],
  fetched: false,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrdersList: (state, action: PayloadAction<OrderWithItemsType[]>) => {
      state.allOrders = action.payload;
      state.fetched = true;
    },

    removeAnOrder: (state, action: PayloadAction<{ orderId: string }>) => {
      const { orderId } = action.payload;
      // Remove from orders list
      state.allOrders = state.allOrders.filter((item) => item._id !== orderId);
    },
  },
});

export const { setOrdersList, removeAnOrder } = orderSlice.actions;

export default orderSlice.reducer;
