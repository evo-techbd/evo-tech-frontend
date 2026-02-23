import { AddCategoryForm } from "@/components/admin/taxonomy/categories/add-update-category-form";
import { CategoriesDataTable } from "@/components/admin/taxonomy/categories/comps/categories-datatable";
import axiosErrorLogger from "@/components/error/axios_error";
import { CategoryTableType } from "@/schemas/admin/product/taxonomySchemas";
import axios from "@/utils/axios/axios";
// import { unstable_noStore as noStore } from "next/cache";

const getCategories = async (): Promise<CategoryTableType[]> => {
    // noStore();
    const categoriesData = await axios.get(`/categories`)
        .then((res) => {
            // Transform backend data to frontend format (map _id to id)
            const categories = res.data.data || [];
            return categories.map((category: any) => ({
                id: category._id,
                name: category.name,
                slug: category.slug,
                sortorder: category.sortOrder || 0,
                active: category.isActive,
                url: category.url || `/${category.slug}`,
                image: category.image,
                subcategories_count: category.subcategories_count || 0,
                brands_count: category.brands_count || 0,
                created_at: category.createdAt,
                updated_at: category.updatedAt,
            }));
        })
        .catch((error: any) => {
            axiosErrorLogger({ error });
            return [];
        });

    return categoriesData;
};

const CategoriesPage = async () => {
    const categoriesData = await getCategories();

    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">Categories</h2>
                <AddCategoryForm />
            </div>
            <CategoriesDataTable categoriesData={categoriesData} />
        </div>
    )
}

export default CategoriesPage;
