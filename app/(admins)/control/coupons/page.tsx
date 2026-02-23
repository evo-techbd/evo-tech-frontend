"use client";

import Link from "next/link";
import { Metadata } from "next";
import { useCouponsData } from "../../../../hooks/use-coupons-data";
import { CouponsCount } from "../../../../components/admin/coupons/comps/coupons-count";
import { CouponsDataTable } from "../../../../components/admin/coupons/comps/coupons-data-table";

const AdminCouponsPage = () => {
    // Call hook once in parent component
    const { coupons, isLoading, error, refetch, serverSidePagination } = useCouponsData();

    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">Coupons</h2>
                        <CouponsCount serverSidePagination={serverSidePagination} isLoading={isLoading} />
                    </div>
                    <Link href="/control/coupons/create" className="px-7 py-2 bg-stone-800 font-[500] text-white rounded text-xs md:text-sm hover:bg-stone-900">
                        Create New Coupon
                    </Link>
                </div>
            </div>

            <CouponsDataTable 
                coupons={coupons}
                isLoading={isLoading}
                error={error}
                refetch={refetch}
                serverSidePagination={serverSidePagination}
            />
        </div>
    );
}

export default AdminCouponsPage;
