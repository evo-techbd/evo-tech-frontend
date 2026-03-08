import { AddPickupPointForm } from "@/components/admin/setup_config/homepage/add-update-pickup-point-form";
import { PickupPointDataTable } from "@/components/admin/setup_config/homepage/comps/pickup-point-datatable";
import axiosErrorLogger from "@/components/error/axios_error";
import {
  PickupPointDisplayType,
  PickupPointListSchema,
} from "@/schemas/admin/setupconfig/homepage/pickupPoint/pickupPointSchema";
import axiosIntercept from "@/utils/axios/axiosIntercept";

const getPickupPoints = async (): Promise<PickupPointDisplayType[]> => {
  const axioswithIntercept = await axiosIntercept();

  const pickupPointsData = await axioswithIntercept
    .get(`/pickup-points`)
    .then((res) => PickupPointListSchema.parse(res.data?.data ?? []))
    .catch((error: any) => {
      axiosErrorLogger({ error });
      return [];
    });

  return pickupPointsData;
};

const PickupPointsPage = async () => {
  const pickupPointsData = await getPickupPoints();

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
          Pickup Points
        </h2>
        <AddPickupPointForm />
      </div>
      <PickupPointDataTable pickupPointsData={pickupPointsData} />
    </div>
  );
};

export default PickupPointsPage;
