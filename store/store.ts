import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import cartReducer from "@/store/slices/cartslice";
import discountReducer from "@/store/slices/discountSlice";
import productReducer from "@/store/slices/productSlice";
import orderReducer from "@/store/slices/orderSlice";
import heroSectionReducer from "@/store/slices/heroSectionSlice";
import featuredSectionReducer from "@/store/slices/featuredSectionSlice";
import ourClientsReducer from "@/store/slices/ourClientsSlice";
import taxonomyReducer from "@/store/slices/taxonomySlice";
import categoryReducer from "@/store/slices/categorySlice";
import subcategoryReducer from "@/store/slices/subcategorySlice";
import brandReducer from "@/store/slices/brandSlice";

// Persist configuration for cart and discount
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["shoppingcart", "discount"], // Only persist cart and discount state
};

// Combine all reducers
const rootReducer = combineReducers({
  shoppingcart: cartReducer,
  discount: discountReducer,
  products: productReducer,
  orders: orderReducer,
  heroSections: heroSectionReducer,
  featuredSections: featuredSectionReducer,
  ourClients: ourClientsReducer,
  taxonomy: taxonomyReducer,
  categories: categoryReducer,
  subcategories: subcategoryReducer,
  brands: brandReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with persisted reducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// Create persistor
const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
