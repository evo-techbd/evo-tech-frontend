"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@nextui-org/checkbox";


const AvailabilityFilter = () => {

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback((name: string, value: string, prevQueryString?: string) => {
        const params = new URLSearchParams(prevQueryString ? prevQueryString : searchParams.toString());
        params.set(name, value);

        return params.toString();
    }, [searchParams]);

    const removeQueryParam = useCallback((name: string, prevQueryString?: string) => {
        const params = new URLSearchParams(prevQueryString ? prevQueryString : searchParams.toString());
        params.delete(name);

        return params.toString();
    }, [searchParams]);


    const handleInstockChange = (isSelected: boolean) => {
        if (isSelected) {
            let newparams = createQueryString("instock", isSelected.toString());
            newparams = removeQueryParam("page", newparams);
            router.push(`${pathname}${newparams ? `?${newparams}` : ''}`, { scroll: false });
        } else {
            let newparams = removeQueryParam("page");
            newparams = removeQueryParam("instock", newparams);
            router.push(`${pathname}${newparams ? `?${newparams}` : ''}`, { scroll: false });
        }
    };

    const handleOutofStockChange = (isSelected: boolean) => {
        if (isSelected) {
            let newparams = createQueryString("instock", (!isSelected).toString());
            newparams = removeQueryParam("page", newparams);
            router.push(`${pathname}${newparams ? `?${newparams}` : ''}`, { scroll: false });
        } else {
            let newparams = removeQueryParam("page");
            newparams = removeQueryParam("instock", newparams);
            router.push(`${pathname}${newparams ? `?${newparams}` : ''}`, { scroll: false });
        }
    };


    return (
        <div id="availability-filter" className="flex flex-col w-full h-fit rounded-[6px] overflow-hidden bg-white">
            <p className="w-full h-fit p-[10px] text-[12px] sm:text-[13px] lg:text-[14px] leading-5 font-[500] text-stone-900 border-b border-stone-300">
                Availability
            </p>
            <div className="flex flex-col w-full h-fit max-h-[300px] p-[10px] gap-2">
                <div className="flex w-full h-fit">
                    <Checkbox
                        size="sm"
                        color="primary"
                        isSelected={searchParams.has("instock") ? (searchParams.get("instock") === "true" ? true : false) : false}
                        onValueChange={handleInstockChange}
                        classNames={{
                            label: "text-[12px] sm:text-[13px] leading-5 font-[400] tracking-tight",
                        }}
                    >
                        {`In stock`}
                    </Checkbox>
                </div>

                <div className="flex w-full h-fit">
                    <Checkbox
                        size="sm"
                        color="primary"
                        isSelected={searchParams.has("instock") ? (searchParams.get("instock") === "false" ? true : false) : false}
                        onValueChange={handleOutofStockChange}
                        classNames={{
                            label: "text-[12px] sm:text-[13px] leading-5 font-[400] tracking-tight",
                        }}
                    >
                        {`Out of stock`}
                    </Checkbox>
                </div>
            </div>
        </div>
    );
}

export default AvailabilityFilter;
