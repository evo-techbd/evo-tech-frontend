import { AddBrandForm } from "@/components/admin/taxonomy/brands/add-update-brand-form";
import { BrandsDataTable } from "@/components/admin/taxonomy/brands/comps/brands-datatable";
import axiosErrorLogger from "@/components/error/axios_error";
import { BrandTableType } from "@/schemas/admin/product/taxonomySchemas";
import axios from "@/utils/axios/axios";
// import { unstable_noStore as noStore } from "next/cache";

const getBrands = async (): Promise<BrandTableType[]> => {
    // noStore();
    const brandsData = await axios.get(`/brands`)
        .then((res) => {
            // Transform backend data to frontend format (map _id to id)
            const brands = res.data.data || [];
            return brands.map((brand: any) => ({
                id: brand._id,
                name: brand.name,
                slug: brand.slug,
                sortorder: brand.sortOrder || 0,
                active: brand.isActive,
                url: brand.url || `/${brand.slug}`,
                categories_count: brand.categories_count || 0,
                subcategories_count: brand.subcategories_count || 0,
                categories: (brand.categories || []).map((cat: any) => ({
                    id: cat._id,
                    name: cat.name,
                    slug: cat.slug,
                    active: cat.isActive,
                })),
                subcategories: (brand.subcategories || []).map((subcat: any) => ({
                    id: subcat._id,
                    name: subcat.name,
                    slug: subcat.slug,
                    active: subcat.isActive,
                })),
                total_associations: (brand.categories_count || 0) + (brand.subcategories_count || 0),
                created_at: brand.createdAt,
                updated_at: brand.updatedAt,
            }));
        })
        .catch((error: any) => {
            axiosErrorLogger({ error });
            return [];
        });

    return brandsData;
};

const BrandsPage = async () => {
    const brandsData = await getBrands();

    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">Brands</h2>
                <AddBrandForm />
            </div>
            <BrandsDataTable brandsData={brandsData} />
        </div>
    )
}

export default BrandsPage;
