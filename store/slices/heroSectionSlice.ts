import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HeroSectionDisplayType } from "@/schemas/admin/setupconfig/homepage/heroSection/heroSchema";

interface HeroSectionState {
  allHeroItems: {
    data: HeroSectionDisplayType[];
    fetched: boolean;
  };
}

const initialState: HeroSectionState = {
  allHeroItems: {
    data: [],
    fetched: false,
  },
};

const heroSectionSlice = createSlice({
  name: "heroSections",
  initialState,
  reducers: {
    setHeroSectionsList: (
      state,
      action: PayloadAction<{
        data: HeroSectionDisplayType[];
        fetchedStatus: boolean;
      }>
    ) => {
      state.allHeroItems.data = action.payload.data;
      state.allHeroItems.fetched = action.payload.fetchedStatus;
    },

    addAHeroSection: (state, action: PayloadAction<HeroSectionDisplayType>) => {
      const newHeroItem = action.payload;

      state.allHeroItems.data.forEach((heroItem) => {
        if (heroItem.sortOrder >= newHeroItem.sortOrder) {
          heroItem.sortOrder += 1;
        }
      });

      state.allHeroItems.data.push(newHeroItem);

      const sortedHeroItems = [...state.allHeroItems.data].sort(
        (a, b) => a.sortOrder - b.sortOrder
      );

      sortedHeroItems.forEach((heroItem, index) => {
        if (heroItem.sortOrder !== index + 1) {
          heroItem.sortOrder = index + 1;
        }
      });

      state.allHeroItems.data = sortedHeroItems;
    },

    updateAHeroSection: (
      state,
      action: PayloadAction<HeroSectionDisplayType>
    ) => {
      const updatedHeroItem = action.payload;
      const index = state.allHeroItems.data.findIndex(
        (heroItem) => heroItem._id === updatedHeroItem._id
      );

      if (index !== -1) {
        const oldHeroItem = state.allHeroItems.data[index];
        const oldSortOrder = oldHeroItem.sortOrder;
        const newSortOrder = updatedHeroItem.sortOrder;

        state.allHeroItems.data[index] = {
          ...updatedHeroItem,
          sortOrder: oldSortOrder,
        };

        if (oldSortOrder !== newSortOrder) {
          if (newSortOrder > oldSortOrder) {
            state.allHeroItems.data.forEach((heroItem) => {
              if (
                heroItem._id !== updatedHeroItem._id &&
                heroItem.sortOrder > oldSortOrder &&
                heroItem.sortOrder <= newSortOrder
              ) {
                heroItem.sortOrder -= 1;
              }
            });
          } else {
            state.allHeroItems.data.forEach((heroItem) => {
              if (
                heroItem._id !== updatedHeroItem._id &&
                heroItem.sortOrder >= newSortOrder &&
                heroItem.sortOrder < oldSortOrder
              ) {
                heroItem.sortOrder += 1;
              }
            });
          }

          state.allHeroItems.data[index].sortOrder = newSortOrder;

          const sortedHeroItems = [...state.allHeroItems.data].sort(
            (a, b) => a.sortOrder - b.sortOrder
          );
          sortedHeroItems.forEach((heroItem, itemIdx) => {
            if (heroItem.sortOrder !== itemIdx + 1) {
              heroItem.sortOrder = itemIdx + 1;
            }
          });

          state.allHeroItems.data = sortedHeroItems;
        }
      }
    },

    removeAHeroSection: (
      state,
      action: PayloadAction<{ bannerId: string }>
    ) => {
      const heroItemToRemove = state.allHeroItems.data.find(
        (heroItem) => heroItem._id === action.payload.bannerId
      );

      if (heroItemToRemove) {
        state.allHeroItems.data = state.allHeroItems.data.filter(
          (heroItem) => heroItem._id !== action.payload.bannerId
        );

        state.allHeroItems.data.forEach((heroItem) => {
          if (heroItem.sortOrder > heroItemToRemove.sortOrder) {
            heroItem.sortOrder -= 1;
          }
        });

        const sortedHeroItems = [...state.allHeroItems.data].sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        sortedHeroItems.forEach((heroItem, index) => {
          if (heroItem.sortOrder !== index + 1) {
            heroItem.sortOrder = index + 1;
          }
        });

        state.allHeroItems.data = sortedHeroItems;
      }
    },

    clearHeroSectionsData: (state) => {
      state.allHeroItems.data = [];
      state.allHeroItems.fetched = false;
    },
  },
});

export const {
  setHeroSectionsList,
  addAHeroSection,
  updateAHeroSection,
  removeAHeroSection,
  clearHeroSectionsData,
} = heroSectionSlice.actions;

export default heroSectionSlice.reducer;
