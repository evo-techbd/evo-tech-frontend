"use client";

import { Pagination } from "@nextui-org/pagination";

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    onChange: (page: number) => void;
}

const EvoPagination = ({ paginationProps, shouldbeDisabled = false }: { paginationProps: PaginationProps; shouldbeDisabled?: boolean; }) => {
    const { currentPage = 1, lastPage = 1, onChange } = paginationProps;

    return (
        <Pagination
            showControls
            isDisabled={shouldbeDisabled}
            boundaries={0}
            page={currentPage}
            total={lastPage}
            onChange={onChange}
            classNames={{
                base: "w-fit h-fit rounded-[6px] overflow-hidden p-1 bg-transparent",
                wrapper: "w-fit h-fit rounded-[6px] gap-2",
                prev: "min-w-6 sm:min-w-8 w-fit h-6 sm:h-8 text-[12px] rounded-[6px] bg-white border border-stone-300 data-[disabled=true]:text-stone-400",
                next: "min-w-6 sm:min-w-8 w-fit h-6 sm:h-8 text-[12px] rounded-[6px] bg-white border border-stone-300 data-[disabled=true]:text-stone-400",
                item: "min-w-6 sm:min-w-8 w-fit h-6 sm:h-8 text-[11px] sm:text-[12px] font-[500] rounded-[6px] bg-white data-[active=true]:bg-gradient-to-b data-[active=true]:from-[#3399FF] data-[active=true]:to-[#0035FF] data-[active=true]:text-white",
                cursor: "hidden",
            }}
        />
    );
}

export default EvoPagination;
