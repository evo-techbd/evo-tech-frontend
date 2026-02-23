"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BrandTableType } from "@/schemas/admin/product/taxonomySchemas";
import BrandTableRowActions from "@/components/admin/taxonomy/brands/comps/brand-table-row-actions";

export const getBrandColumns = (): ColumnDef<BrandTableType>[] => {
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
            accessorKey: "categories_count",
            header: () => <div className="text-center text-xs">Categories</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-center text-xs">{row.getValue("categories_count")}</div>
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
            accessorKey: "total_associations",
            header: () => <div className="text-center text-xs">Total</div>,
            cell: ({ row }) => {
                return (
                    <div className="text-center text-xs font-medium">{row.getValue("total_associations")}</div>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <BrandTableRowActions row={row} />
                )
            },
        },
    ];
}
