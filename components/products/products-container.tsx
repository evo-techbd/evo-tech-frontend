"use client";

import { Suspense, useEffect, useState } from "react";
import ProductsListing from "@/components/products-listing";
import { FilterToggleButton } from "@/components/product_filters/filter-toggle-button";
import { ProductFiltersContainer } from "@/components/product_filters/product-filters-container";

interface ProductsContainerProps {
    fetchedProductsData: any[];
    paginationMetaForData: any;
}

const STORAGE_KEY = "pr-filters-visibility";

const ProductsContainer = ({ fetchedProductsData, paginationMetaForData }: ProductsContainerProps) => {
    const [isOpen, setIsOpen] = useState(true);

    // Load persisted state on mount
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState !== null) {
            setIsOpen(JSON.parse(savedState));
        }
    }, []);

    // Persist state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(isOpen));
    }, [isOpen]);

    const toggleFilters = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <FilterToggleButton isOpen={isOpen} onClickChange={toggleFilters} />

            <div className="flex flex-col md:flex-row w-full h-fit gap-5">
                <div className={`transition-all duration-300 ease-in-out overflow-hidden origin-top-left hidden md:flex flex-none
                                ${isOpen ? 'w-[190px] lg:w-[220px] opacity-100 mr-0' : 'w-0 opacity-0 -mr-5'}`}
                >
                    <ProductFiltersContainer />
                </div>

                <div className="flex flex-col w-full h-fit pb-6 gap-5">
                    <Suspense
                        fallback={<div className="w-full h-[calc(100vh-100px)] flex items-center justify-center"><p className="text-[13px] leading-5 font-[500] text-stone-600">Loading...</p></div>}
                    >
                        <ProductsListing fetchedProdData={fetchedProductsData} paginationMeta={paginationMetaForData} />
                    </Suspense>
                </div>
            </div>
        </>
    );
}

export { ProductsContainer };
