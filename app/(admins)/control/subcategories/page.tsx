import { AddSubcategoryForm } from "@/components/admin/taxonomy/subcategories/add-update-subcategory-form";
import { SubcategoriesDataTable } from "@/components/admin/taxonomy/subcategories/comps/subcategories-datatable";
import axiosErrorLogger from "@/components/error/axios_error";
import { SubcategoryTableType } from "@/schemas/admin/product/taxonomySchemas";
import axios from "@/utils/axios/axios";
// import { unstable_noStore as noStore } from "next/cache";

const getSubcategories = async (): Promise<SubcategoryTableType[]> => {
    // noStore();
    const subcategoriesData = await axios.get(`/subcategories`)
        .then((res) => {
            // Transform backend data to frontend format (map _id to id)
            const subcategories = res.data.data || [];
            return subcategories
                .filter((subcategory: any) => {
                    // Filter out subcategories with null/undefined categories
                    return subcategory.category != null;
                })
                .map((subcategory: any) => ({
                    id: subcategory._id,
                    name: subcategory.name,
                    slug: subcategory.slug,
                    sortorder: subcategory.sortOrder || 0,
                    active: subcategory.isActive,
                    category: {
                        id: typeof subcategory.category === 'object' ? subcategory.category._id : subcategory.category,
                        name: typeof subcategory.category === 'object' ? subcategory.category.name : '',
                        slug: typeof subcategory.category === 'object' ? subcategory.category.slug : '',
                        active: typeof subcategory.category === 'object' ? subcategory.category.isActive : true,
                    },
                    url: subcategory.url || `/${subcategory.slug}`,
                    brands_count: subcategory.brands_count || 0,
                    created_at: subcategory.createdAt,
                    updated_at: subcategory.updatedAt,
                }));
        })
        .catch((error: any) => {
            axiosErrorLogger({ error });
            return [];
        });

    return subcategoriesData;
};

const SubcategoriesPage = async () => {
    const subcategoriesData = await getSubcategories();

    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">Subcategories</h2>
                <AddSubcategoryForm />
            </div>
            <SubcategoriesDataTable subcategoriesData={subcategoriesData} />
        </div>
    )
}

export default SubcategoriesPage;
