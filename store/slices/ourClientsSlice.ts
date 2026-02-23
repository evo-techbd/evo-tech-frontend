import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OurClientsDisplayType } from "@/schemas/admin/setupconfig/homepage/ourClientsSection/ourClientsSchema";

interface OurClientsState {
  allClientItems: {
    data: OurClientsDisplayType[];
    fetched: boolean;
  };
}

const initialState: OurClientsState = {
  allClientItems: {
    data: [],
    fetched: false,
  },
};

const ourClientsSlice = createSlice({
  name: "ourClients",
  initialState,
  reducers: {
    setOurClientsList: (
      state,
      action: PayloadAction<{
        data: OurClientsDisplayType[];
        fetchedStatus: boolean;
      }>
    ) => {
      state.allClientItems.data = [...action.payload.data].sort(
        (a, b) => a.sortorder - b.sortorder
      );
      state.allClientItems.fetched = action.payload.fetchedStatus;
    },

    addAClientItem: (state, action: PayloadAction<OurClientsDisplayType>) => {
      const newClientItem = action.payload;

      // Shift existing client items with sortorder >= newClientItem.sortorder
      state.allClientItems.data.forEach((clientItem) => {
        if (clientItem.sortorder >= newClientItem.sortorder) {
          clientItem.sortorder++;
        }
      });

      // Add the new client item
      state.allClientItems.data.push(newClientItem);

      // Ensure all client items are properly ordered from 1 without gaps
      const sortedClientItems = [...state.allClientItems.data].sort(
        (a, b) => a.sortorder - b.sortorder
      );
      sortedClientItems.forEach((clientItem, index) => {
        if (clientItem.sortorder !== index + 1) {
          clientItem.sortorder = index + 1;
        }
      });

      // reorder the client items in the state
      state.allClientItems.data = sortedClientItems;
    },

    updateAClientItem: (
      state,
      action: PayloadAction<OurClientsDisplayType>
    ) => {
      const updatedClientItem = action.payload;
      const index = state.allClientItems.data.findIndex(
        (clientItem) => clientItem.trustedbyid === updatedClientItem.trustedbyid
      );

      if (index !== -1) {
        const oldClientItem = state.allClientItems.data[index];
        const oldSortorder = oldClientItem.sortorder;
        const newSortorder = updatedClientItem.sortorder;

        // First update the client item fields (except sortorder initially)
        state.allClientItems.data[index] = {
          ...updatedClientItem,
          sortorder: oldSortorder,
        };

        // Handle sortorder changes
        if (oldSortorder !== newSortorder) {
          if (newSortorder > oldSortorder) {
            // Moving to a higher position: shift client items down between old and new position
            state.allClientItems.data.forEach((clientItem) => {
              if (
                clientItem.trustedbyid !== updatedClientItem.trustedbyid &&
                clientItem.sortorder > oldSortorder &&
                clientItem.sortorder <= newSortorder
              ) {
                clientItem.sortorder--;
              }
            });
          } else {
            // Moving to a lower position: shift client items up between new and old position
            state.allClientItems.data.forEach((clientItem) => {
              if (
                clientItem.trustedbyid !== updatedClientItem.trustedbyid &&
                clientItem.sortorder >= newSortorder &&
                clientItem.sortorder < oldSortorder
              ) {
                clientItem.sortorder++;
              }
            });
          }

          // update the current client item's sortorder
          state.allClientItems.data[index].sortorder = newSortorder;

          // Ensure all client items are properly ordered from 1 without gaps
          const sortedClientItems = [...state.allClientItems.data].sort(
            (a, b) => a.sortorder - b.sortorder
          );
          sortedClientItems.forEach((clientItem, index) => {
            if (clientItem.sortorder !== index + 1) {
              clientItem.sortorder = index + 1;
            }
          });

          // reorder the client items in the state
          state.allClientItems.data = sortedClientItems;
        }
      }
    },

    removeAClientItem: (state, action: PayloadAction<{ clientId: string }>) => {
      const clientItemToRemove = state.allClientItems.data.find(
        (clientItem) => clientItem.trustedbyid === action.payload.clientId
      );

      if (clientItemToRemove) {
        // Remove the client item
        state.allClientItems.data = state.allClientItems.data.filter(
          (clientItem) => clientItem.trustedbyid !== action.payload.clientId
        );

        // Shift down all client items with higher sortorder
        state.allClientItems.data.forEach((clientItem) => {
          if (clientItem.sortorder > clientItemToRemove.sortorder) {
            clientItem.sortorder--;
          }
        });

        // Ensure all client items are properly ordered from 1 without gaps
        const sortedClientItems = [...state.allClientItems.data].sort(
          (a, b) => a.sortorder - b.sortorder
        );
        sortedClientItems.forEach((clientItem, index) => {
          if (clientItem.sortorder !== index + 1) {
            clientItem.sortorder = index + 1;
          }
        });

        // reorder the client items in the state
        state.allClientItems.data = sortedClientItems;
      }
    },

    clearOurClientsData: (state) => {
      state.allClientItems.data = [];
      state.allClientItems.fetched = false;
    },
  },
});

export const {
  setOurClientsList,
  addAClientItem,
  updateAClientItem,
  removeAClientItem,
  clearOurClientsData,
} = ourClientsSlice.actions;

export default ourClientsSlice.reducer;
