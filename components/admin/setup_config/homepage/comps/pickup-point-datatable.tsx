"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setPickupPointsList } from "@/store/slices/pickupPointSlice";
import { DataTable } from "@/components/ui/data-table";
import { getPickupPointColumns } from "@/app/(admins)/control/setup-config/homepage-config/pickup-points/pickup-point-columns";
import { PickupPointDisplayType } from "@/schemas/admin/setupconfig/homepage/pickupPoint/pickupPointSchema";

interface PickupPointDataTableProps {
  pickupPointsData: PickupPointDisplayType[];
}

const LoadingSpinner: React.FC = () => (
  <div className="h-full flex justify-center items-center">
    <div className="size-4 md:size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
  </div>
);

const PickupPointDataTable = ({
  pickupPointsData,
}: PickupPointDataTableProps) => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const pickupPointsReduxData = useSelector(
    (state: RootState) => state.pickupPoints.allPickupPoints.data,
  );
  const dispatch = useDispatch<AppDispatch>();
  const pickupPointColumns = React.useMemo(() => getPickupPointColumns(), []);

  // Initialize Redux store with server data
  React.useEffect(() => {
    if (pickupPointsData?.length >= 0 && !isInitialized) {
      dispatch(
        setPickupPointsList({
          data: pickupPointsData,
          fetchedStatus: true,
        }),
      );
      setIsInitialized(true);
    }
  }, [dispatch, pickupPointsData, isInitialized]);

  // Loading state during initial load
  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full h-fit mt-4">
      <DataTable<PickupPointDisplayType, any>
        columns={pickupPointColumns}
        data={pickupPointsReduxData}
        enableSelectedRowsCount={false}
      />
    </div>
  );
};

export { PickupPointDataTable };
