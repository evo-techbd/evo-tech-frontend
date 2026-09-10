"use client";

import * as React from "react";
import type { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import axios from "@/utils/axios/axios";
import { PrintingSaleType } from "./printing-sale-columns";
import { generatePrintingSalePDF } from "@/components/admin/printing-sales/generate-printing-sale-pdf";

interface RowActionProps {
    row: Row<PrintingSaleType>;
    onDataChange?: () => Promise<void>;
    onView?: (sale: PrintingSaleType) => void;
}

const PrintingSaleTableRowActions = ({ row, onDataChange, onView }: RowActionProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isDeletePending, startDeleteTransition] = React.useTransition();
    const [isPrinting, setIsPrinting] = React.useState(false);
    const router = useRouter();

    const sale = row.original;

    const handleDelete = () => {
        startDeleteTransition(async () => {
            try {
                await axios.delete(`/admin/printing-sales/${sale._id}`);
                setIsOpen(false);
                toast.success("Sale has been deleted");
                if (onDataChange) {
                    await onDataChange();
                }
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message || "Failed to delete the sale",
                );
            }
        });
    };

    const handlePrint = async () => {
        setIsPrinting(true);
        try {
            await generatePrintingSalePDF(sale);
            toast.success("Receipt downloaded successfully");
        } catch (error) {
            toast.error("Failed to generate receipt");
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <div className="px-2 flex justify-end items-center gap-1" role="group" aria-label="Actions">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-blue-100 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                aria-label="View sale details"
                onClick={() => onView?.(sale)}
            >
                <Eye className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-amber-100 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                aria-label="Edit sale"
                onClick={() => router.push(`/control/printing-sales/${sale._id}/edit`)}
            >
                <Pencil className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-green-100 text-green-600 hover:text-green-700 hover:bg-green-50"
                aria-label="Print receipt"
                onClick={handlePrint}
                disabled={isPrinting}
            >
                {isPrinting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Printer className="h-4 w-4" />
                )}
            </Button>

            <DeleteDialog<PrintingSaleType>
                rowitem={row.original}
                open={isOpen}
                onOpenChange={setIsOpen}
                onDelete={handleDelete}
                isDeletePending={isDeletePending}
                entityName="sale"
                warningTitle="Delete this sale?"
                warningDescription="This action cannot be undone. This will permanently delete the sale record and remove it from all financial calculations."
            />
        </div>
    );
};

export default PrintingSaleTableRowActions;
