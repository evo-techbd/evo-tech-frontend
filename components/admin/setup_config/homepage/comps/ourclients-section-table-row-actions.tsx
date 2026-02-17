"use client";

import * as React from "react";
import { Row } from "@tanstack/react-table";
import { OurClientsDisplayType } from "@/schemas/admin/setupconfig/homepage/ourClientsSection/ourClientsSchema";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { removeAClientItem } from "@/store/slices/ourClientsSlice";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { UpdateOurClientsForm } from "@/components/admin/setup_config/homepage/add-update-ourclients-form";
import { toast } from "sonner";
import { deleteOurClientItem } from "@/actions/admin/setupConfig/homepage/ourClientsSection";

interface OurClientsTableRowActionsProps {
    row: Row<OurClientsDisplayType>;
}

const OurClientsTableRowActions = ({
    row,
}: OurClientsTableRowActionsProps) => {

    const [isOpen, setIsOpen] = React.useState(false);
    const [isDeletePending, startDeleteTransition] = React.useTransition();
    const dispatch = useDispatch<AppDispatch>();

    const clientItem = row.original;

    const handleClientUpdateAfterDeletion = () => {
        dispatch(removeAClientItem({
            clientId: clientItem.trustedbyid
        }));
    };

    const handleDelete = () => {
        
        if (clientItem) {
            startDeleteTransition(async () => {
                const { error } = await deleteOurClientItem({
                    id: clientItem.trustedbyid,
                });

                if (error) {
                    toast.error(error || "An error occurred while deleting the client item");
                    return;
                }

                setIsOpen(false); // Close on success
                toast.success("Client item has been deleted");
                handleClientUpdateAfterDeletion(); // update redux state
            });
        } else {
            toast.error('Something went wrong!');
        }
    };

    return (
        <div className="px-2 flex justify-end items-center gap-1" role="group" aria-label="Actions">
            <UpdateOurClientsForm clientData={clientItem} />

            <DeleteDialog<OurClientsDisplayType>
                rowitem={row.original}
                open={isOpen}
                onOpenChange={setIsOpen}
                onDelete={handleDelete}
                isDeletePending={isDeletePending}
                entityName="our client item"
            />
        </div>
    );
};

export default OurClientsTableRowActions;
