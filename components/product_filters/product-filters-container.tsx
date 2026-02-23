"use client";

import { Suspense } from "react";
import AvailabilityFilter from "@/components/product_filters/availability-filter";
import PriceRangeFilter from "@/components/product_filters/price-range-filter";

const ProductFiltersContainer = () => {
    
    return (
        <div className="flex flex-col flex-none w-[190px] lg:w-[220px] h-fit text-stone-700 gap-4">
            <Suspense fallback={<div className="w-full h-[100px] flex items-center justify-center"><p className="text-[13px] leading-5 font-[500] text-stone-600">...</p></div>}>
                <AvailabilityFilter />
                {/* <PriceRangeFilter /> */}
            </Suspense>
        </div>
    )
}

export { ProductFiltersContainer };
