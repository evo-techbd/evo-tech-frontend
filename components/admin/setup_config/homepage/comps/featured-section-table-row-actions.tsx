"use client";

import * as React from "react";
import { Row } from "@tanstack/react-table";
import { FeaturedSectionDisplayType } from "@/schemas/admin/setupconfig/homepage/featuredSections/featuredSchema";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { removeAFeaturedSection } from "@/store/slices/featuredSectionSlice";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { UpdateFeaturedSectionForm } from "@/components/admin/setup_config/homepage/add-update-feat-section-form";
import { toast } from "sonner";
import { deleteFeaturedSection } from "@/actions/admin/setupConfig/homepage/featuredSection";


interface FeaturedSectionTableRowActionsProps {
    row: Row<FeaturedSectionDisplayType>;
}

const FeaturedSectionTableRowActions = ({
    row,
}: FeaturedSectionTableRowActionsProps) => {

    const [isOpen, setIsOpen] = React.useState(false);
    const [isDeletePending, startDeleteTransition] = React.useTransition();
    const dispatch = useDispatch<AppDispatch>();

    const featuredSection = row.original;

    const handleSectionUpdateAfterDeletion = () => {
        dispatch(removeAFeaturedSection({
            sectionId: featuredSection.sectionid
        }));
    };

    const handleDelete = () => {
        
        if (featuredSection) {
            startDeleteTransition(async () => {
                const { error } = await deleteFeaturedSection({
                    id: featuredSection.sectionid,
                });

                if (error) {
                    toast.error(error || "An error occured while deleting the section");
                    return;
                }

                setIsOpen(false); // Close on success
                toast.success("Section has been deleted");
                handleSectionUpdateAfterDeletion(); // update redux state
            });
        } else {
            toast.error('Something went wrong!');
        }
    };

    return (
        <div className="px-2 flex justify-end items-center gap-1" role="group" aria-label="Actions">
            <UpdateFeaturedSectionForm sectionData={featuredSection} />

            <DeleteDialog<FeaturedSectionDisplayType>
                rowitem={row.original}
                open={isOpen}
                onOpenChange={setIsOpen}
                onDelete={handleDelete}
                isDeletePending={isDeletePending}
                entityName="featured section"
            />
        </div>
    );
};

export default FeaturedSectionTableRowActions;
