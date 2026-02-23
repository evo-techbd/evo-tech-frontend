"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '@/store/store';
import { setBrandsList } from "@/store/slices/brandSlice";
import { DataTable } from "@/components/ui/data-table";
import { getBrandColumns } from "@/app/(admins)/control/brands/brand-columns";
import { BrandTableType } from "@/schemas/admin/product/taxonomySchemas";

interface BrandsDataTableProps {
    brandsData: BrandTableType[];
}

const LoadingSpinner: React.FC = () => (
    <div className="h-full flex justify-center items-center">
        <div className="size-4 md:size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
    </div>
);

const BrandsDataTable = ({
    brandsData
}: BrandsDataTableProps) => {
    const [isInitialized, setIsInitialized] = React.useState(false);
    const brandsFromStore = useSelector((state: RootState) => state.brands.allBrands.data);
    const dispatch = useDispatch<AppDispatch>();
    const brandColumns = React.useMemo(() => getBrandColumns(), []);

    // Initialize Redux store with server data
    React.useEffect(() => {
        if (brandsData && !isInitialized) {
            dispatch(setBrandsList({
                data: brandsData,
                fetchedStatus: true,
            }));
            setIsInitialized(true);
        }
    }, [dispatch, brandsData, isInitialized]);

    // Loading state during initial load
    if (!isInitialized && brandsData) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full h-fit mt-4">
            <DataTable<BrandTableType, any>
                columns={brandColumns}
                data={brandsFromStore}
                enableSelectedRowsCount={false}
            />
        </div>
    );
}

export { BrandsDataTable }; 