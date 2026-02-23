"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '@/store/store';
import { setHeroSectionsList } from "@/store/slices/heroSectionSlice";
import { DataTable } from "@/components/ui/data-table";
import { getHeroSectionColumns } from "@/app/(admins)/control/setup-config/homepage-config/hero-section/hero-section-columns";
import { HeroSectionDisplayType } from "@/schemas/admin/setupconfig/homepage/heroSection/heroSchema";

interface HeroSectionDataTableProps {
    heroSectionsData: HeroSectionDisplayType[];
}

const LoadingSpinner: React.FC = () => (
    <div className="h-full flex justify-center items-center">
        <div className="size-4 md:size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
    </div>
);

const HeroSectionDataTable = ({
    heroSectionsData
}: HeroSectionDataTableProps) => {
    const [isInitialized, setIsInitialized] = React.useState(false);
    const sectionsData = useSelector((state: RootState) => state.heroSections.allHeroItems.data);
    const dispatch = useDispatch<AppDispatch>();
    const heroSectionColumns = React.useMemo(() => getHeroSectionColumns(), []);

    // Initialize Redux store with server data
    React.useEffect(() => {
        if (heroSectionsData?.length > 0 && !isInitialized) {
            dispatch(setHeroSectionsList({
                data: heroSectionsData,
                fetchedStatus: true,
            }));
            setIsInitialized(true);
        }
    }, [dispatch, heroSectionsData, isInitialized]);

    // Loading state during initial load
    if (!isInitialized && heroSectionsData?.length > 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full h-fit mt-4">
            <DataTable<HeroSectionDisplayType, any>
                columns={heroSectionColumns}
                data={sectionsData}
                enableSelectedRowsCount={false}
            />
        </div>
    );
}

export { HeroSectionDataTable }; 