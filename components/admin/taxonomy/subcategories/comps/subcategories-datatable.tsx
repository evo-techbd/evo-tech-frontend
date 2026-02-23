"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '@/store/store';
import { setSubcategoriesList } from "@/store/slices/subcategorySlice";
import { DataTable } from "@/components/ui/data-table";
import { getSubcategoryColumns } from "@/app/(admins)/control/subcategories/subcategory-columns";
import { SubcategoryTableType } from "@/schemas/admin/product/taxonomySchemas";

interface SubcategoriesDataTableProps {
    subcategoriesData: SubcategoryTableType[];
}

const LoadingSpinner: React.FC = () => (
    <div className="h-full flex justify-center items-center">
        <div className="size-4 md:size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
    </div>
);

const SubcategoriesDataTable = ({
    subcategoriesData
}: SubcategoriesDataTableProps) => {
    const [isInitialized, setIsInitialized] = React.useState(false);
    const subcategoriesFromStore = useSelector((state: RootState) => state.subcategories.allSubcategories.data);
    const dispatch = useDispatch<AppDispatch>();
    const subcategoryColumns = React.useMemo(() => getSubcategoryColumns(), []);

    // Initialize Redux store with server data
    React.useEffect(() => {
        if (subcategoriesData?.length > 0 && !isInitialized) {
            dispatch(setSubcategoriesList({
                data: subcategoriesData,
                fetchedStatus: true,
            }));
            setIsInitialized(true);
        }
    }, [dispatch, subcategoriesData, isInitialized]);

    // Loading state during initial load
    if (!isInitialized && subcategoriesData?.length > 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full h-fit mt-4">
            <DataTable<SubcategoryTableType, any>
                columns={subcategoryColumns}
                data={subcategoriesFromStore}
                enableSelectedRowsCount={false}
            />
        </div>
    );
}

export { SubcategoriesDataTable };
