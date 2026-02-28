import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PickupPointDisplayType } from "@/schemas/admin/setupconfig/homepage/pickupPoint/pickupPointSchema";

interface PickupPointState {
  allPickupPoints: {
    data: PickupPointDisplayType[];
    fetched: boolean;
  };
}

const initialState: PickupPointState = {
  allPickupPoints: {
    data: [],
    fetched: false,
  },
};

const pickupPointSlice = createSlice({
  name: "pickupPoints",
  initialState,
  reducers: {
    setPickupPointsList: (
      state,
      action: PayloadAction<{
        data: PickupPointDisplayType[];
        fetchedStatus: boolean;
      }>,
    ) => {
      state.allPickupPoints.data = action.payload.data;
      state.allPickupPoints.fetched = action.payload.fetchedStatus;
    },

    addAPickupPoint: (state, action: PayloadAction<PickupPointDisplayType>) => {
      const newPickupPoint = action.payload;

      state.allPickupPoints.data.forEach((pickupPoint) => {
        if (pickupPoint.sortOrder >= newPickupPoint.sortOrder) {
          pickupPoint.sortOrder += 1;
        }
      });

      state.allPickupPoints.data.push(newPickupPoint);

      const sortedPickupPoints = [...state.allPickupPoints.data].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      );

      sortedPickupPoints.forEach((pickupPoint, index) => {
        if (pickupPoint.sortOrder !== index + 1) {
          pickupPoint.sortOrder = index + 1;
        }
      });

      state.allPickupPoints.data = sortedPickupPoints;
    },

    updateAPickupPoint: (
      state,
      action: PayloadAction<PickupPointDisplayType>,
    ) => {
      const updatedPickupPoint = action.payload;
      const index = state.allPickupPoints.data.findIndex(
        (pickupPoint) => pickupPoint._id === updatedPickupPoint._id,
      );

      if (index !== -1) {
        const oldPickupPoint = state.allPickupPoints.data[index];
        const oldSortOrder = oldPickupPoint.sortOrder;
        const newSortOrder = updatedPickupPoint.sortOrder;

        state.allPickupPoints.data[index] = {
          ...updatedPickupPoint,
          sortOrder: oldSortOrder,
        };

        if (oldSortOrder !== newSortOrder) {
          if (newSortOrder > oldSortOrder) {
            state.allPickupPoints.data.forEach((pickupPoint) => {
              if (
                pickupPoint._id !== updatedPickupPoint._id &&
                pickupPoint.sortOrder > oldSortOrder &&
                pickupPoint.sortOrder <= newSortOrder
              ) {
                pickupPoint.sortOrder -= 1;
              }
            });
          } else {
            state.allPickupPoints.data.forEach((pickupPoint) => {
              if (
                pickupPoint._id !== updatedPickupPoint._id &&
                pickupPoint.sortOrder >= newSortOrder &&
                pickupPoint.sortOrder < oldSortOrder
              ) {
                pickupPoint.sortOrder += 1;
              }
            });
          }

          state.allPickupPoints.data[index].sortOrder = newSortOrder;

          const sortedPickupPoints = [...state.allPickupPoints.data].sort(
            (a, b) => a.sortOrder - b.sortOrder,
          );
          sortedPickupPoints.forEach((pickupPoint, itemIdx) => {
            if (pickupPoint.sortOrder !== itemIdx + 1) {
              pickupPoint.sortOrder = itemIdx + 1;
            }
          });

          state.allPickupPoints.data = sortedPickupPoints;
        }
      }
    },

    removeAPickupPoint: (
      state,
      action: PayloadAction<{ pickupPointId: string }>,
    ) => {
      const pickupPointToRemove = state.allPickupPoints.data.find(
        (pickupPoint) => pickupPoint._id === action.payload.pickupPointId,
      );

      if (pickupPointToRemove) {
        state.allPickupPoints.data = state.allPickupPoints.data.filter(
          (pickupPoint) => pickupPoint._id !== action.payload.pickupPointId,
        );

        state.allPickupPoints.data.forEach((pickupPoint) => {
          if (pickupPoint.sortOrder > pickupPointToRemove.sortOrder) {
            pickupPoint.sortOrder -= 1;
          }
        });

        const sortedPickupPoints = [...state.allPickupPoints.data].sort(
          (a, b) => a.sortOrder - b.sortOrder,
        );
        sortedPickupPoints.forEach((pickupPoint, index) => {
          if (pickupPoint.sortOrder !== index + 1) {
            pickupPoint.sortOrder = index + 1;
          }
        });

        state.allPickupPoints.data = sortedPickupPoints;
      }
    },

    clearPickupPointsData: (state) => {
      state.allPickupPoints.data = [];
      state.allPickupPoints.fetched = false;
    },
  },
});

export const {
  setPickupPointsList,
  addAPickupPoint,
  updateAPickupPoint,
  removeAPickupPoint,
  clearPickupPointsData,
} = pickupPointSlice.actions;

export default pickupPointSlice.reducer;
