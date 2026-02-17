"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CategoryTableType } from "@/schemas/admin/product/taxonomySchemas";
import CategoryTableRowActions from "@/components/admin/taxonomy/categories/comps/category-table-row-actions";

export const getCategoryColumns = (): ColumnDef<CategoryTableType>[] => {
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
            accessorKey: "subcategories_count",
            header: () => <div className="text-center text-xs">Subcategories</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-center text-xs">{row.getValue("subcategories_count")}</div>
                )
            },
        },
        {
            accessorKey: "brands_count",
            header: () => <div className="text-center text-xs">Direct Brands</div>,
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
                    <CategoryTableRowActions row={row} />
                )
            },
        },
    ];
}
