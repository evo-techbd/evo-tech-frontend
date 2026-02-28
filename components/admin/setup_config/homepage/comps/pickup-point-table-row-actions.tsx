"use client";

import * as React from "react";
import { Row } from "@tanstack/react-table";
import { PickupPointDisplayType } from "@/schemas/admin/setupconfig/homepage/pickupPoint/pickupPointSchema";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { removeAPickupPoint } from "@/store/slices/pickupPointSlice";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { UpdatePickupPointForm } from "@/components/admin/setup_config/homepage/add-update-pickup-point-form";
import { toast } from "sonner";
import { deletePickupPoint } from "@/actions/admin/setupConfig/homepage/pickupPoint";

interface PickupPointTableRowActionsProps {
  row: Row<PickupPointDisplayType>;
}

const PickupPointTableRowActions = ({
  row,
}: PickupPointTableRowActionsProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeletePending, startDeleteTransition] = React.useTransition();
  const dispatch = useDispatch<AppDispatch>();

  const pickupPoint = row.original;

  const handlePickupPointUpdateAfterDeletion = () => {
    dispatch(
      removeAPickupPoint({
        pickupPointId: pickupPoint._id,
      }),
    );
  };

  const handleDelete = () => {
    if (pickupPoint) {
      startDeleteTransition(async () => {
        const { error } = await deletePickupPoint({
          id: pickupPoint._id,
        });

        if (error) {
          toast.error(
            error || "An error occurred while deleting the pickup point",
          );
          return;
        }

        setIsOpen(false); // Close on success
        toast.success("Pickup point has been deleted");
        handlePickupPointUpdateAfterDeletion(); // update redux state
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
      <UpdatePickupPointForm pickupPointData={pickupPoint} />

      <DeleteDialog<PickupPointDisplayType>
        rowitem={row.original}
        open={isOpen}
        onOpenChange={setIsOpen}
        onDelete={handleDelete}
        isDeletePending={isDeletePending}
        entityName="pickup point"
      />
    </div>
  );
};

export default PickupPointTableRowActions;
