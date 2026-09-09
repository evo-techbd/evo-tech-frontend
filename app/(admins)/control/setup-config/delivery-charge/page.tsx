import { DeliveryChargeForm } from "@/components/admin/setup_config/delivery-charge-form";
import axiosErrorLogger from "@/components/error/axios_error";
import { DeliveryChargeSettingsType } from "@/schemas/admin/setupconfig/deliveryCharge/deliveryChargeSchema";
import axiosIntercept from "@/utils/axios/axiosIntercept";

const DEFAULT_SETTINGS: DeliveryChargeSettingsType = {
  insideDhakaCharge: 70,
  outsideDhakaCharge: 120,
  additionalChargePerKg: 20,
};

const getDeliveryChargeSettings =
  async (): Promise<DeliveryChargeSettingsType> => {
    const axioswithIntercept = await axiosIntercept();

    return axioswithIntercept
      .get(`/settings/delivery-charge`)
      .then((res) => res.data?.data ?? DEFAULT_SETTINGS)
      .catch((error: any) => {
        axiosErrorLogger({ error });
        return DEFAULT_SETTINGS;
      });
  };

const DeliveryChargePage = async () => {
  const settings = await getDeliveryChargeSettings();

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
          Delivery Charge
        </h2>
        <p className="text-sm text-stone-600">
          Configure the delivery charge used to calculate order totals at
          checkout.
        </p>
      </div>
      <DeliveryChargeForm settings={settings} />
    </div>
  );
};

export default DeliveryChargePage;
