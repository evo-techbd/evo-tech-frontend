"use client";

import { usePathname } from "next/navigation";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";

const HorizontalMenu = ({ menuitems, segmentLevelBelowLayout, routePrefix }: {
    menuitems: { name: string; href: string; }[];
    segmentLevelBelowLayout: number;
    routePrefix: string;
}) => {

    const pathName = usePathname();

    const pathSegments = pathName.split("/").filter(Boolean);
    let filteredMenuItems: { name: string; href: string; }[] = [];

    if (menuitems.length > 0 && pathSegments.length > 0) {
        filteredMenuItems = menuitems.filter(menuitem => pathSegments[segmentLevelBelowLayout] !== menuitem.href);
    }

    if (filteredMenuItems.length === 0) return null;
    
    return (
        <>
            <Breadcrumbs
                hideSeparator
                classNames={{
                    list: "flex flex-wrap w-full h-fit gap-2",
                }}
                itemClasses={{
                    item: "flex w-fit h-fit px-5 py-2 hover:bg-[#006CD7] rounded-[50px] text-[12px] sm:text-[13px] leading-5 font-[600] text-stone-800 hover:text-white border border-stone-500 hover:border-[#006CD7] transition-colors duration-100 ease-linear",
                }}
            >
                {
                    filteredMenuItems.map((f_menuitem, idx) => {
                        return (
                            <BreadcrumbItem key={`hrmenuitem${idx}`}
                                href={`${routePrefix}${f_menuitem.href}`}
                                isCurrent={pathSegments[segmentLevelBelowLayout] === f_menuitem.href}
                            >
                                {f_menuitem.name}
                            </BreadcrumbItem>
                        )
                    })
                }
            </Breadcrumbs>
        </>
    );
}

export default HorizontalMenu;
