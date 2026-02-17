"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '@/store/store';
import { setFeaturedSectionsList } from "@/store/slices/featuredSectionSlice";
import { DataTable } from "@/components/ui/data-table";
import { getFeaturedSectionColumns } from "@/app/(admins)/control/setup-config/homepage-config/featured-sections/featured-section-columns";
import { FeaturedSectionDisplayType } from "@/schemas/admin/setupconfig/homepage/featuredSections/featuredSchema";

interface FeaturedSectionDataTableProps {
    featuredSectionsData: FeaturedSectionDisplayType[];
}

const LoadingSpinner: React.FC = () => (
    <div className="h-full flex justify-center items-center">
        <div className="size-4 md:size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
    </div>
);

const FeaturedSectionDataTable = ({
    featuredSectionsData
}: FeaturedSectionDataTableProps) => {
    const [isInitialized, setIsInitialized] = React.useState(false);
    const sectionsData = useSelector((state: RootState) => state.featuredSections.allSections.data);
    const dispatch = useDispatch<AppDispatch>();
    const featuredSectionColumns = React.useMemo(() => getFeaturedSectionColumns(), []);

    // Initialize Redux store with server data
    React.useEffect(() => {
        if (featuredSectionsData?.length > 0 && !isInitialized) {
            dispatch(setFeaturedSectionsList({
                data: featuredSectionsData,
                fetchedStatus: true,
            }));
            setIsInitialized(true);
        }
    }, [dispatch, featuredSectionsData, isInitialized]);

    // Loading state during initial load
    if (!isInitialized && featuredSectionsData?.length > 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full h-fit mt-4">
            <DataTable<FeaturedSectionDisplayType, any>
                columns={featuredSectionColumns}
                data={sectionsData}
                enableSelectedRowsCount={false}
            />
        </div>
    );
}

export { FeaturedSectionDataTable };
