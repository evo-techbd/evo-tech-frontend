"use client";

import type { ProductDisplayType } from "@/schemas/admin/product/productschemas";
import type { Row } from "@tanstack/react-table";
import * as React from "react";
import { toast } from "sonner";
import CustomModal from "@/components/custom-modal";

import { deleteItem } from "@/actions/admin/products";

interface DeleteItemCustomDialogProps {
    item: Row<ProductDisplayType>["original"] | null;
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function DeleteItemCustomDialog({
    item,
    open,
    onClose,
    onSuccess,
}: DeleteItemCustomDialogProps) {
    const [isDeletePending, startDeleteTransition] = React.useTransition();

    const onDelete = () => {
        if (item) {
            startDeleteTransition(async () => {
                const { error } = await deleteItem({
                    id: item.itemid,
                });

                if (error) {
                    toast.error(error);
                    return;
                }

                toast.success("Item deleted");
                onSuccess?.();
            });
        }
    };

    if (!item) {
        return null;
    }

    return (
        <CustomModal
            isOpen={open}
            onClose={onClose}
            onConfirm={onDelete}
            isDeletePending={isDeletePending}
        />
    );
}
