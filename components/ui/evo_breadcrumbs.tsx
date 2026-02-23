"use client";

import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { BreadCrumbItems } from "@/utils/types_interfaces/shared_interfaces";


const EvoBreadcrumbs = ({ breadcrumbitemsdata }: { breadcrumbitemsdata: BreadCrumbItems[]; }) => {

    return (
        <Breadcrumbs
            variant="light"
            underline="none"
            maxItems={4}
            itemsBeforeCollapse={2}
            itemsAfterCollapse={2}
            classNames={{
                base: "w-full h-fit py-1",
            }}
            itemClasses={{
                item: "font-inter text-[11px] sm:text-[12px] leading-5 font-[400] text-stone-600 data-[current=true]:text-stone-600 gap-1 opacity-60 data-[current=true]:opacity-100 hover:opacity-100 active:opacity-100",
                separator: "px-[1px] text-stone-500",
            }}
        >
            {
                breadcrumbitemsdata.map((breadcrumbitem, idx) => {
                    return (
                        <BreadcrumbItem key={`bcrumbitem${idx}`}
                            href={breadcrumbitem.href}
                            startContent={breadcrumbitem.beforecontent ? breadcrumbitem.beforecontent : null}
                            endContent={breadcrumbitem.aftercontent ? breadcrumbitem.aftercontent : null}
                        >
                            {breadcrumbitem.content}
                        </BreadcrumbItem>
                    )
                })
            }
        </Breadcrumbs>
    );
}

export default EvoBreadcrumbs;
