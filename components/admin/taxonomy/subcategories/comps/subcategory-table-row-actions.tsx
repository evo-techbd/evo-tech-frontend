"use client";

import * as React from "react";
import type { Row } from "@tanstack/react-table";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import axios from "@/utils/axios/axios";
import { UpdateSubcategoryForm } from "@/components/admin/taxonomy/subcategories/add-update-subcategory-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { SubcategoryTableType } from "@/schemas/admin/product/taxonomySchemas";
import { removeASubcategory } from "@/store/slices/subcategorySlice";

interface RowActionProps {
  row: Row<SubcategoryTableType>;
}

const SubcategoryTableRowActions = ({ row }: RowActionProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeletePending, startDeleteTransition] = React.useTransition();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubcategoryUpdateAfterDeletion = () => {
    dispatch(
      removeASubcategory({
        subcategoryId: row.original.id,
      })
    );
  };

  const handleDelete = async () => {
    const subcategory = row.original;
    if (subcategory) {
      startDeleteTransition(async () => {
        try {
          const response = await axios.delete(
            `/api/admin/taxonomy/subcategories/${subcategory.id}`,
            {
              headers: {
                "X-Requested-With": "XMLHttpRequest",
              },
              withCredentials: true,
            }
          );

          if (response.data.success) {
            setIsDeleteOpen(false); // close on success
            toast.success("Subcategory has been deleted");
            handleSubcategoryUpdateAfterDeletion(); // update the Redux state
          }
        } catch (error: any) {
          if (error.response) {
            toast.error(
              error.response.data.message ||
                "An error occured while deleting the subcategory"
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

      <UpdateSubcategoryForm subcategoryData={row.original} />

      <DeleteDialog<SubcategoryTableType>
        rowitem={row.original}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDelete={handleDelete}
        isDeletePending={isDeletePending}
        entityName="subcategory"
      />
    </div>
  );
};

export default SubcategoryTableRowActions;
