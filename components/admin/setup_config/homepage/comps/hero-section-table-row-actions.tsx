"use client";

import * as React from "react";
import { Row } from "@tanstack/react-table";
import { HeroSectionDisplayType } from "@/schemas/admin/setupconfig/homepage/heroSection/heroSchema";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { removeAHeroSection } from "@/store/slices/heroSectionSlice";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { UpdateHeroSectionForm } from "@/components/admin/setup_config/homepage/add-update-hero-section-form";
import { toast } from "sonner";
import { deleteHeroSection } from "@/actions/admin/setupConfig/homepage/heroSection";

interface HeroSectionTableRowActionsProps {
  row: Row<HeroSectionDisplayType>;
}

const HeroSectionTableRowActions = ({
  row,
}: HeroSectionTableRowActionsProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeletePending, startDeleteTransition] = React.useTransition();
  const dispatch = useDispatch<AppDispatch>();

  const heroSection = row.original;

  const handleSectionUpdateAfterDeletion = () => {
    dispatch(
      removeAHeroSection({
        bannerId: heroSection._id,
      })
    );
  };

  const handleDelete = () => {
    if (heroSection) {
      startDeleteTransition(async () => {
        const { error } = await deleteHeroSection({
          id: heroSection._id,
        });

        if (error) {
          toast.error(
            error || "An error occurred while deleting the hero section"
          );
          return;
        }

        setIsOpen(false); // Close on success
        toast.success("Hero section has been deleted");
        handleSectionUpdateAfterDeletion(); // update redux state
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
      <UpdateHeroSectionForm sectionData={heroSection} />

      <DeleteDialog<HeroSectionDisplayType>
        rowitem={row.original}
        open={isOpen}
        onOpenChange={setIsOpen}
        onDelete={handleDelete}
        isDeletePending={isDeletePending}
        entityName="hero section"
      />
    </div>
  );
};

export default HeroSectionTableRowActions;
