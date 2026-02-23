"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RiEqualizerFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";

interface FilterToggleProps {
    isOpen: boolean;
    onClickChange: () => void;
}

const FilterToggleButton = ({ isOpen, onClickChange }: FilterToggleProps) => {

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();


    const removeQueryParam = useCallback((name: string, prevQueryString?: string) => {
        const params = new URLSearchParams(prevQueryString ? prevQueryString : searchParams.toString());
        params.delete(name);

        return params.toString();
    }, [searchParams]);



    const handleClearAllFilters = () => {
        let newparams = searchParams.toString();
        if (searchParams.has("page")) { newparams = removeQueryParam("page", newparams); }
        if (searchParams.has("instock")) { newparams = removeQueryParam("instock", newparams); }
        if (searchParams.has("minprice")) { newparams = removeQueryParam("minprice", newparams); }
        if (searchParams.has("maxprice")) { newparams = removeQueryParam("maxprice", newparams); }
        router.push(`${pathname}${newparams ? `?${newparams}` : ''}`, { scroll: false });
    };



    return (
        <div className="hidden md:flex justify-between items-center w-full max-w-[190px] lg:max-w-[220px] h-[44px] rounded-[6px] overflow-hidden bg-white p-2">
            <Button
                className="flex w-[7rem] h-fit justify-start items-center pl-1 py-1 bg-blue-50"
                variant="ghost"
                size="sm"
                onClick={onClickChange}
            >
                <RiEqualizerFill className="inline size-4 text-stone-800" />
                <p className="text-[11px] sm:text-[12px] leading-5 font-[600] tracking-tight text-stone-800 ml-0.5">
                    {isOpen ? `Hide Filters` : `Show Filters`}
                </p>
            </Button>

            {(searchParams.has("instock") || searchParams.has("minprice") || searchParams.has("maxprice")) &&
                <button type="button"
                    aria-label="clear all filters"
                    className="w-fit h-fit px-1.5 rounded-[40px] bg-[#0866FF]/10 hover:bg-[#0866FF]/20 transition-colors duration-100 ease-linear"
                    onClick={handleClearAllFilters}
                >
                    <p className="text-[12px] leading-5 font-[500] tracking-tight text-[#0866FF]">Clear All</p>
                </button>
            }
        </div>
    );
}

export { FilterToggleButton };
