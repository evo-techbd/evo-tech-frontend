"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '@/store/store';
import { setCategoriesList } from "@/store/slices/categorySlice";
import { DataTable } from "@/components/ui/data-table";
import { getCategoryColumns } from "@/app/(admins)/control/categories/category-columns";
import { CategoryTableType } from "@/schemas/admin/product/taxonomySchemas";

interface CategoriesDataTableProps {
    categoriesData: CategoryTableType[];
}

const LoadingSpinner: React.FC = () => (
    <div className="h-full flex justify-center items-center">
        <div className="size-4 md:size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
    </div>
);

const CategoriesDataTable = ({
    categoriesData
}: CategoriesDataTableProps) => {
    const [isInitialized, setIsInitialized] = React.useState(false);
    const categoriesFromStore = useSelector((state: RootState) => state.categories.allCategories.data);
    const dispatch = useDispatch<AppDispatch>();
    const categoryColumns = React.useMemo(() => getCategoryColumns(), []);

    // Initialize Redux store with server data
    React.useEffect(() => {
        if (categoriesData?.length > 0 && !isInitialized) {
            dispatch(setCategoriesList({
                data: categoriesData,
                fetchedStatus: true,
            }));
            setIsInitialized(true);
        }
    }, [dispatch, categoriesData, isInitialized]);

    // Loading state during initial load
    if (!isInitialized && categoriesData?.length > 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full h-fit mt-4">
            <DataTable<CategoryTableType, any>
                columns={categoryColumns}
                data={categoriesFromStore}
                enableSelectedRowsCount={false}
            />
        </div>
    );
}

export { CategoriesDataTable };
