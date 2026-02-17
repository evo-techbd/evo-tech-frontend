"use client";

import { ColumnDef } from "@tanstack/react-table";
import { currencyFormatBDT } from "@/lib/all_utils";

import { ProductDisplayType } from "@/schemas/admin/product/productschemas";
import ProductPublishedSwitch from "@/components/admin/products/comps/product-publish-switch";
import ProductTableRowActions from "@/components/admin/products/comps/product-table-row-actions";


export const getProductsColumns = (): ColumnDef<ProductDisplayType>[] => {

    return (
        [
            {
                accessorKey: "i_name",
                header: "Name",
                cell: ({ row }) => (
                    <div className="text-xs font-medium whitespace-nowrap">{row.getValue("i_name")}</div>
                ),
                enableHiding: false,
            },
            {
                accessorKey: "i_price",
                header: () => <div className="text-left">Price</div>,
                cell: ({ row }) => {
                    const formattedprice = currencyFormatBDT(row.getValue("i_price"));
                    return (
                        <div className="text-xs text-left font-[500] whitespace-nowrap">{`${formattedprice} Tk.`}</div>
                    )
                },
            },
            {
                accessorKey: "i_stock",
                header: () => <div className="text-left whitespace-nowrap">Stock</div>,
                cell: ({ row }) => {
                    const stockCount = row.getValue("i_stock") as number | undefined;
                    const lowStockThreshold = (row.original as any).i_lowstockthreshold || 3;
                    const isLowStock = stockCount !== undefined && stockCount <= lowStockThreshold;
                    
                    return (
                        <div className={`text-xs text-left font-medium ${isLowStock ? "text-red-600" : "text-emerald-600"}`}>
                            {stockCount !== undefined ? stockCount : "N/A"}
                        </div>
                    )
                },
            },
            {
                accessorKey: "i_category",
                header: () => <div className="text-left">Category</div>,
                cell: ({ row }) => {
                    const itemCategory = row.getValue("i_category") as string;
                    if (!itemCategory || typeof itemCategory !== 'string') {
                        return (<div className="text-xs text-left capitalize whitespace-nowrap">N/A</div>);
                    }
                    return (<div className="text-xs text-left capitalize whitespace-nowrap">{itemCategory.replaceAll('_', ' ').replaceAll('-', ' ')}</div>)
                },
            },
            {
                accessorKey: "i_subcategory",
                header: () => <div className="text-left">Subcategory</div>,
                cell: ({ row }) => {
                    const itemSubCategory = row.getValue("i_subcategory") as string;
                    if (!itemSubCategory || typeof itemSubCategory !== 'string') {
                        return (<div className="text-xs text-left capitalize whitespace-nowrap">N/A</div>);
                    }
                    return (<div className="text-xs text-left capitalize whitespace-nowrap">{itemSubCategory.replaceAll('_', ' ').replaceAll('-', ' ')}</div>)
                },
            },
            {
                accessorKey: "i_brand",
                header: () => <div className="text-left">Brand</div>,
                cell: ({ row }) => {
                    const itemBrand = row.getValue("i_brand") as string;
                    if (!itemBrand || typeof itemBrand !== 'string') {
                        return (<div className="text-xs text-left capitalize whitespace-nowrap">N/A</div>);
                    }
                    return (<div className="text-xs text-left capitalize whitespace-nowrap">{itemBrand.replaceAll('_', ' ').replaceAll('-', ' ')}</div>)
                },
            },
            {
                accessorKey: "i_published",
                header: () => <div className="text-center">Published</div>,
                cell: ({ row }) => {

                    return (
                        <div className="flex items-center justify-center">
                            <ProductPublishedSwitch
                                productId={row.original.itemid}
                                initialValue={Boolean(row.getValue("i_published"))}
                            />
                        </div>
                    )
                },
            },
            {
                id: "actions",
                cell: ({ row }) => {

                    return (
                        <ProductTableRowActions row={row} />
                    )
                },
            },
        ]
    );
}
