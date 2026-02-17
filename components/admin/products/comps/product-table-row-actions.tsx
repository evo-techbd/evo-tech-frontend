"use client";

import * as React from "react";
import type { Row } from "@tanstack/react-table";
import { ProductDisplayType } from "@/schemas/admin/product/productschemas";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from '@/store/store';
import { removeAProduct } from "@/store/slices/productSlice";
import { deleteItem } from "@/actions/admin/products";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { ProductDetailsModal } from "./product-details-modal";


interface RowActionProps {
    row: Row<ProductDisplayType>;
}

const ProductTableRowActions = ({ row }: RowActionProps) => {

    const [isOpen, setIsOpen] = React.useState(false);
    const [isDeletePending, startDeleteTransition] = React.useTransition();
    const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();


    const handleProductsUpdateAfterDeletion = () => {
        dispatch(removeAProduct({
            productId: row.original.itemid,
        }));
    };

    const handleDelete = () => {
        const item = row.original;
        if (item) {
            startDeleteTransition(async () => {
                const { error } = await deleteItem({
                    id: item.itemid,
                });

                if (error) {
                    toast.error(error || "An error occured while deleting the item");
                    return;
                }

                setIsOpen(false); // Close on success
                toast.success("Item has been deleted");
                handleProductsUpdateAfterDeletion(); // update redux state
            });
        } else {
            toast.error('Something went wrong!');
        }
    };

    return (
        <div className="px-2 flex justify-end items-center gap-1" role="group" aria-label="Actions">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-blue-100 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                aria-label={`View details of ${row.original.i_name || 'item'}`}
                onClick={() => setIsDetailsModalOpen(true)}
            >
                <Eye className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-yellow-200 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
                aria-label={`Update ${row.original.i_name || 'item'}`}
                onClick={() => router.push(`/control/products/update/${row.original.i_slug}`)}
            >
                <Edit className="h-4 w-4" />
            </Button>

            <DeleteDialog<ProductDisplayType>
                rowitem={row.original}
                open={isOpen}
                onOpenChange={setIsOpen}
                onDelete={handleDelete}
                isDeletePending={isDeletePending}
                entityName="product"
            />

            <ProductDetailsModal
                productSlug={row.original.i_slug}
                open={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
            />
        </div>
    );
}

export default ProductTableRowActions;
