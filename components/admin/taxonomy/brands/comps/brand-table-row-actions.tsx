"use client";

import * as React from "react";
import type { Row } from "@tanstack/react-table";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import axios from "@/utils/axios/axios";
import { UpdateBrandForm } from "@/components/admin/taxonomy/brands/add-update-brand-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { BrandTableType } from "@/schemas/admin/product/taxonomySchemas";
import { removeABrand } from "@/store/slices/brandSlice";

interface RowActionProps {
  row: Row<BrandTableType>;
}

const BrandTableRowActions = ({ row }: RowActionProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeletePending, startDeleteTransition] = React.useTransition();
  const dispatch = useDispatch<AppDispatch>();

  const handleBrandUpdateAfterDeletion = () => {
    dispatch(
      removeABrand({
        brandId: row.original.id,
      })
    );
  };

  const handleDelete = async () => {
    const brand = row.original;
    if (brand) {
      startDeleteTransition(async () => {
        try {
          const response = await axios.delete(
            `/api/admin/taxonomy/brands/${brand.id}`,
            {
              headers: {
                "X-Requested-With": "XMLHttpRequest",
              },
              withCredentials: true,
            }
          );

          if (response.data.success) {
            setIsDeleteOpen(false); // close on success
            toast.success("Brand has been deleted");
            handleBrandUpdateAfterDeletion(); // update the Redux state
          }
        } catch (error: any) {
          if (error.response) {
            toast.error(
              error.response.data.message ||
                "An error occurred while deleting the brand"
            );
          } else {
            toast.error("Something went wrong");
          }
        }
      });
    } else {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div
      className="px-2 flex justify-end items-center gap-1"
      role="group"
      aria-label="Actions"
    >
      {/* TODO: add a view details button later if needed */}

      <UpdateBrandForm brandData={row.original} />

      <DeleteDialog<BrandTableType>
        rowitem={row.original}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDelete={handleDelete}
        isDeletePending={isDeletePending}
        entityName="brand"
      />
    </div>
  );
};

export default BrandTableRowActions;
