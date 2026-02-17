"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '@/store/store';
import { setOurClientsList } from "@/store/slices/ourClientsSlice";
import { DataTable } from "@/components/ui/data-table";
import { getOurClientsColumns } from "@/app/(admins)/control/setup-config/homepage-config/ourclients-section/ourclients-section-columns";
import { OurClientsDisplayType } from "@/schemas/admin/setupconfig/homepage/ourClientsSection/ourClientsSchema";

interface OurClientsDataTableProps {
    ourClientsData: OurClientsDisplayType[];
}

const LoadingSpinner: React.FC = () => (
    <div className="h-full flex justify-center items-center">
        <div className="size-4 md:size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
    </div>
);

const OurClientsDataTable = ({
    ourClientsData
}: OurClientsDataTableProps) => {
    const [isInitialized, setIsInitialized] = React.useState(false);
    const clientsData = useSelector((state: RootState) => state.ourClients.allClientItems.data);
    const dispatch = useDispatch<AppDispatch>();
    const ourClientsColumns = React.useMemo(() => getOurClientsColumns(), []);

    // Initialize Redux store with server data
    React.useEffect(() => {
        if (ourClientsData?.length > 0 && !isInitialized) {
            dispatch(setOurClientsList({
                data: ourClientsData,
                fetchedStatus: true,
            }));
            setIsInitialized(true);
        }
    }, [dispatch, ourClientsData, isInitialized]);

    // Loading state during initial load
    if (!isInitialized && ourClientsData?.length > 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full h-fit mt-4">
            <DataTable<OurClientsDisplayType, any>
                columns={ourClientsColumns}
                data={clientsData}
                enableSelectedRowsCount={false}
            />
        </div>
    );
}

export { OurClientsDataTable };
