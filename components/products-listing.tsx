"use client";

import ProductCard2 from "@/components/cards/productcard2";
import EvoPagination from "@/components/ui/evo_pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EvoDropdown from "@/components/ui/evo_dropdown";
import { DropdownItem } from "@nextui-org/dropdown";
import { useCallback } from "react";



const ProductsListing = ({ fetchedProdData, paginationMeta }: { fetchedProdData: any[]; paginationMeta: any; }) => {
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


    
    if (fetchedProdData.length === 0) {
        return (
            <div className="w-full h-[calc(100vh-300px)] flex justify-center">
                <p className="text-[13px] leading-5 font-[500] text-stone-600 my-10">{`Umm...Nothing to show`}</p>
            </div>
        );
    }


    const handlePaginationChange = (page: number) => {
        if (page !== paginationMeta.currentPage) {
            if (page === 1) {
                const newparams = removeQueryParam("page");
                router.push(`${pathname}${newparams ? `?${newparams}` : ''}`, { scroll: true });
            } else {
                router.push(`${pathname}?${createQueryString("page", page.toString())}`, { scroll: true });
            }
        }
    };

    const handlePerPageChange = (perPage: number) => {
        if (perPage !== paginationMeta.itemsPerPage) {
            if (perPage === 12) {
                let newparams = removeQueryParam("perpage");
                newparams = removeQueryParam("page", newparams);
                router.push(`${pathname}${newparams ? `?${newparams}` : ''}`, { scroll: true });
            } else {
                let newparams = createQueryString("perpage", perPage.toString());
                newparams = removeQueryParam("page", newparams);
                router.push(`${pathname}${newparams ? `?${newparams}` : ''}`, { scroll: true });
            }
        }
    };

    const paginationData = {
        currentPage: paginationMeta.currentPage,
        lastPage: paginationMeta.lastPage,
        onChange: handlePaginationChange,
    };


    return (
        <>
            <div className="w-full h-fit flex justify-end items-center px-3 py-2 gap-3 bg-white rounded-md">
                <div className="flex items-center w-fit h-fit gap-1">
                    <EvoDropdown
                        dropdownLabel="Page Size"
                        onKeyChange={(key) => {
                            handlePerPageChange(parseInt(key));
                        }}
                        selectedKey={paginationMeta.itemsPerPage.toString()}
                        ariaLabelForMenu="show items per page"
                        dropdownTriggerClassName="w-fit h-fit"
                    >
                        <DropdownItem key="12">12</DropdownItem>
                        <DropdownItem key="24">24</DropdownItem>
                        <DropdownItem key="36">36</DropdownItem>
                    </EvoDropdown>
                </div>
                <p className="w-fit h-fit text-[12px] leading-5 tracking-tight font-[400] text-stone-700">{`${paginationMeta.totalItems} Product(s)`}</p>
            </div>

            <div className="w-full h-fit grid justify-items-center grid-cols-1 min-[551px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {
                    fetchedProdData.map((prod: any, index: number) => {
                        return (
                            <ProductCard2 key={`item${index}`} eachItem={prod} />
                        );
                    })
                }
            </div>

            <div className="w-full h-fit flex justify-center items-center mt-12">
                <EvoPagination paginationProps={paginationData} />
            </div>
        </>
    );
}

export default ProductsListing;
