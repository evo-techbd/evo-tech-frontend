import { AddHeroSectionForm } from "@/components/admin/setup_config/homepage/add-update-hero-section-form";
import { HeroSectionDataTable } from "@/components/admin/setup_config/homepage/comps/hero-section-datatable";
import axiosErrorLogger from "@/components/error/axios_error";
import {
  HeroSectionDisplayType,
  HeroSectionListSchema,
} from "@/schemas/admin/setupconfig/homepage/heroSection/heroSchema";
import axiosIntercept from "@/utils/axios/axiosIntercept";
// import { unstable_noStore as noStore } from "next/cache";

const getHeroSections = async (): Promise<HeroSectionDisplayType[]> => {
  const axioswithIntercept = await axiosIntercept();

  // noStore();
  const heroSectionsData = await axioswithIntercept
    .get(`/banners`)
    .then((res) => HeroSectionListSchema.parse(res.data?.data ?? []))
    .catch((error: any) => {
      axiosErrorLogger({ error });
      return [];
    });

  return heroSectionsData;
};

const HeroSectionPage = async () => {
  const heroSectionsData = await getHeroSections();

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
          Hero Section
        </h2>
        <AddHeroSectionForm />
      </div>
      <HeroSectionDataTable heroSectionsData={heroSectionsData} />
    </div>
  );
};

export default HeroSectionPage;
