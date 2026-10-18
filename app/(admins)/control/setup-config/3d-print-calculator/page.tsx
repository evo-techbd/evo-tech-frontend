import {
  PrintCalculatorForm,
  PrintPricingSettings,
} from "@/components/admin/setup_config/print-calculator-form";
import axiosErrorLogger from "@/components/error/axios_error";
import axiosIntercept from "@/utils/axios/axiosIntercept";

const getPrintCalculatorSettings =
  async (): Promise<PrintPricingSettings | null> => {
    const axioswithIntercept = await axiosIntercept();

    return axioswithIntercept
      .get(`/print-pricing/settings`)
      .then((res) => res.data?.data ?? null)
      .catch((error: any) => {
        axiosErrorLogger({ error });
        return null;
      });
  };

const PrintCalculatorPage = async () => {
  const settings = await getPrintCalculatorSettings();

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
          3D Print Calculator
        </h2>
        <p className="text-sm text-stone-600">
          Configure the materials and rates used by the instant quote on the 3D
          printing page. Changes show on the storefront within 5 minutes.
        </p>
      </div>
      {settings ? (
        <PrintCalculatorForm settings={settings} />
      ) : (
        <p className="text-sm text-rose-600">
          Could not load pricing settings. Please refresh the page.
        </p>
      )}
    </div>
  );
};

export default PrintCalculatorPage;
