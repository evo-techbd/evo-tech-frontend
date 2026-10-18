import { ContactInfoForm } from "@/components/admin/setup_config/contact-info-form";
import axiosErrorLogger from "@/components/error/axios_error";
import { ContactInfo, withContactDefaults } from "@/lib/contact-info";
import axiosIntercept from "@/utils/axios/axiosIntercept";

const getContactSettings = async (): Promise<ContactInfo | null> => {
  const axioswithIntercept = await axiosIntercept();

  return axioswithIntercept
    .get(`/settings/contact`)
    .then((res) => withContactDefaults(res.data?.data))
    .catch((error: any) => {
      axiosErrorLogger({ error });
      return null;
    });
};

const ContactInfoPage = async () => {
  const settings = await getContactSettings();

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
          Contact Info
        </h2>
        <p className="text-sm text-stone-600">
          Phone numbers, WhatsApp, email, address and social links shown across
          the storefront. Changes appear within 5 minutes.
        </p>
      </div>
      {settings ? (
        <ContactInfoForm settings={settings} />
      ) : (
        <p className="text-sm text-rose-600">
          Could not load contact info. Please refresh the page.
        </p>
      )}
    </div>
  );
};

export default ContactInfoPage;
