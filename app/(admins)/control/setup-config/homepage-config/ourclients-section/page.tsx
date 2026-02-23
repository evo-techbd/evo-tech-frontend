import { AddOurClientsForm } from "@/components/admin/setup_config/homepage/add-update-ourclients-form";
import { OurClientsDataTable } from "@/components/admin/setup_config/homepage/comps/ourclients-section-datatable";
import { OurClientsDisplayType } from "@/schemas/admin/setupconfig/homepage/ourClientsSection/ourClientsSchema";
import axiosErrorLogger from "@/components/error/axios_error";
import axiosIntercept from "@/utils/axios/axiosIntercept";

const formatTimestamp = (value?: string) => {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

const parseBoolean = (value: any, fallback: boolean): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

const mapClientPayload = (client: any): OurClientsDisplayType => {
  const rawSortOrder =
    typeof client?.sortOrder === "number"
      ? client.sortOrder
      : Number(client?.sortOrder ?? 0);

  const safeSortOrder = Number.isNaN(rawSortOrder) ? 0 : rawSortOrder;

  return {
    trustedbyid: client?._id ?? client?.id ?? "",
    brand_name: client?.name ?? "",
    brand_logosrc: client?.logo ?? "",
    brand_url: client?.website ?? null,
    brand_description: client?.description ?? null,
    sortorder: safeSortOrder,
    is_active: parseBoolean(client?.isActive, true),
    last_modified_at: formatTimestamp(client?.updatedAt ?? client?.createdAt),
  };
};

const getOurClients = async (): Promise<OurClientsDisplayType[]> => {
  const axioswithIntercept = await axiosIntercept();

  const ourClientsData = await axioswithIntercept
    .get(`/clients`)
    .then((res) => {
      const rawClients = res.data?.data ?? [];
      return rawClients.map(mapClientPayload);
    })
    .catch((error: any) => {
      axiosErrorLogger({ error });
      return [];
    });

  return ourClientsData;
};

const OurClientsSectionPage = async () => {
  const ourClientsData = await getOurClients();

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
          Our Clients
        </h2>
        <AddOurClientsForm />
      </div>
      <OurClientsDataTable ourClientsData={ourClientsData} />
    </div>
  );
};

export default OurClientsSectionPage;
