"use client";

const PriceRangeFilter = () => {

    return (
        <div id="price-filter" className="flex flex-col w-full h-fit rounded-[6px] overflow-hidden bg-white">
            <p className="w-full h-fit p-[10px] text-[12px] sm:text-[13px] lg:text-[14px] leading-5 font-[500] text-stone-900 border-b border-stone-300">
                Price
            </p>
            <div className="flex flex-col w-full h-fit max-h-[300px] p-[10px] text-sm">
                {/* add a range slider to change price */}
                slider here
            </div>
        </div>
    );
}

export default PriceRangeFilter;
