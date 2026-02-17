"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SubcategoryTableType } from "@/schemas/admin/product/taxonomySchemas";
import SubcategoryTableRowActions from "@/components/admin/taxonomy/subcategories/comps/subcategory-table-row-actions";

export const getSubcategoryColumns = (): ColumnDef<SubcategoryTableType>[] => {
    return [
        {
            accessorKey: "name",
            header: () => <div className="text-left text-xs">Name</div>,
            cell: ({ row }) => (
                <div className="font-medium whitespace-nowrap text-xs">{row.getValue("name")}</div>
            ),
            enableHiding: false,
        },
        {
            accessorKey: "slug",
            header: () => <div className="text-left text-xs">Slug</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-left font-[500] whitespace-nowrap truncate text-xs text-gray-600">{row.getValue("slug")}</div>
                )
            },
        },
        {
            accessorKey: "sortorder",
            header: () => <div className="text-center text-xs">Sort Order</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-center text-xs">{row.getValue("sortorder")}</div>
                )
            },
        },
        {
            accessorKey: "active",
            header: () => <div className="text-center text-xs">Active</div>,
            cell: ({ row }) => {
                const isActive = row.getValue("active") as boolean;
                return (
                    <div className="text-center text-xs">
                        {isActive ? (
                            <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                            <span className="text-red-600 font-medium">No</span>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "url",
            header: () => <div className="text-left text-xs">URL</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-left font-[500] whitespace-nowrap truncate text-xs">{row.getValue("url")}</div>
                )
            },
        },
        {
            accessorKey: "category",
            header: () => <div className="text-left text-xs">Category</div>,
            cell: ({ row }) => {
                const category = row.getValue("category") as SubcategoryTableType['category'];
                return (
                    <div className="text-left font-[600] whitespace-nowrap truncate text-xs">
                        {category.name}
                    </div>
                )
            },
        },
        {
            accessorKey: "brands_count",
            header: () => <div className="text-center text-xs">Brands</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-center text-xs">{row.getValue("brands_count")}</div>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <SubcategoryTableRowActions row={row} />
                )
            },
        },
    ];
}
