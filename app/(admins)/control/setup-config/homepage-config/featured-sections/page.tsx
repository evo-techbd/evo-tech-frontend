import { AddFeaturedSectionForm } from "@/components/admin/setup_config/homepage/add-update-feat-section-form";
import { FeaturedSectionDataTable } from "@/components/admin/setup_config/homepage/comps/featured-section-datatable";
import axiosErrorLogger from "@/components/error/axios_error";
import { FeaturedSectionDisplayType } from "@/schemas/admin/setupconfig/homepage/featuredSections/featuredSchema";
import axiosIntercept from "@/utils/axios/axiosIntercept";
// import { unstable_noStore as noStore } from "next/cache";

const getFeaturedSections = async (): Promise<FeaturedSectionDisplayType[]> => {
  const axioswithIntercept = await axiosIntercept();

  // noStore();
  const featSectionsData = await axioswithIntercept
    .get(`/products/featured-sections`)
    .then((res) => {
      // Map backend response to frontend format
      const data = res.data.data || [];
      return data.map((section: any) => ({
        sectionid: section._id,
        title: section.title,
        view_more_url: section.category?.slug || "",
        sortorder: section.sortOrder,
        items_count: section.products?.length || 0,
      }));
    })
    .catch((error: any) => {
      axiosErrorLogger({ error });
      return [];
    });

  return featSectionsData;
};

const FeaturedSectionsPage = async () => {
  const featuredSectionsData = await getFeaturedSections();

  return (
    <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
          Featured Sections
        </h2>
        <AddFeaturedSectionForm />
      </div>
      <FeaturedSectionDataTable featuredSectionsData={featuredSectionsData} />
    </div>
  );
};

export default FeaturedSectionsPage;
