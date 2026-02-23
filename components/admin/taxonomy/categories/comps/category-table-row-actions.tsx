"use client";

import * as React from "react";
import type { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import axios from "@/utils/axios/axios";
import { UpdateCategoryForm } from "@/components/admin/taxonomy/categories/add-update-category-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { CategoryTableType } from "@/schemas/admin/product/taxonomySchemas";
import { removeACategory } from "@/store/slices/categorySlice";

interface RowActionProps {
  row: Row<CategoryTableType>;
}

const CategoryTableRowActions = ({ row }: RowActionProps) => {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeletePending, startDeleteTransition] = React.useTransition();
  const dispatch = useDispatch<AppDispatch>();

  const handleCategoryUpdateAfterDeletion = () => {
    dispatch(
      removeACategory({
        categoryId: row.original.id,
      })
    );
  };

  const handleDelete = async () => {
    const category = row.original;
    if (category) {
      startDeleteTransition(async () => {
        try {
          const response = await axios.delete(
            `/api/admin/taxonomy/categories/${category.id}`,
            {
              headers: {
                "X-Requested-With": "XMLHttpRequest",
              },
              withCredentials: true,
            }
          );

          if (response.data.success) {
            setIsDeleteOpen(false); // close on success
            toast.success("Category has been deleted");
            handleCategoryUpdateAfterDeletion(); // update the Redux state
            router.refresh(); // Refresh to update server components
          }
        } catch (error: any) {
          if (error.response) {
            toast.error(
              error.response.data.message ||
                "An error occured while deleting the category"
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

      <UpdateCategoryForm categoryData={row.original} />

      <DeleteDialog<CategoryTableType>
        rowitem={row.original}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDelete={handleDelete}
        isDeletePending={isDeletePending}
        entityName="category"
      />
    </div>
  );
};

export default CategoryTableRowActions;
