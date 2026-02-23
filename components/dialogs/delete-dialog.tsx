"use client";

import type { Row } from "@tanstack/react-table";
import { Loader, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/evo_dialog";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

import { useMediaQuery } from "@/hooks/use-media-query";


interface DeleteDialogProps<T> extends React.ComponentPropsWithoutRef<typeof Dialog> {
    rowitem: Row<T>["original"];
    onDelete: () => void;
    isDeletePending: boolean;
    showTrigger?: boolean;
    entityName?: string;
    warningTitle?: string;
    warningDescription?: string;
}

export function DeleteDialog<T>({
    rowitem,
    onDelete,
    isDeletePending,
    showTrigger = true,
    entityName,
    warningTitle,
    warningDescription,
    ...props
}: DeleteDialogProps<T>) {
    const isDesktop = useMediaQuery("(min-width: 640px)");

    if (!rowitem) {
        return null;
    }

    if (isDesktop) {
        return (
            <>
                <Dialog {...props} open={props.open} onOpenChange={props.onOpenChange}>
                    {showTrigger ? (
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full bg-red-100 text-red-500 hover:text-red-600 hover:bg-red-50"
                                aria-label={`Delete ${entityName || 'icon'}`}
                                aria-hidden="false"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                    ) : null}
                    <DialogContent className="bg-stone-50">
                        <DialogHeader>
                            <DialogTitle className="mr-7 py-2">{warningTitle || `Are you sure?`}</DialogTitle>
                            <DialogDescription>
                                {warningDescription ||
                                    `This action cannot be undone. This will permanently delete the selected item from records.`
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:space-x-0">
                            <DialogClose asChild>
                                <Button variant="outline" aria-hidden="false" aria-label="Cancel button">Cancel</Button>
                            </DialogClose>
                            <Button
                                aria-label="Delete button"
                                aria-hidden="false"
                                variant="destructive"
                                onClick={onDelete}
                                disabled={isDeletePending}
                            >
                                {isDeletePending && (
                                    <Loader
                                        className="mr-2 size-4 animate-spin"
                                    />
                                )}
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <>
            <Drawer {...props} open={props.open} onOpenChange={props.onOpenChange}>
                {showTrigger ? (
                    <DrawerTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full bg-red-100 text-red-500 hover:text-red-600 hover:bg-red-50"
                            aria-label={`Delete ${entityName || 'icon'}`}
                            aria-hidden="false"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </DrawerTrigger>
                ) : null}
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{warningTitle || `Are you sure?`}</DrawerTitle>
                        <DrawerDescription>
                            {warningDescription ||
                                `This action cannot be undone. This will permanently delete the selected item from records.`
                            }
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter className="gap-2 sm:space-x-0">
                        <DrawerClose asChild>
                            <Button variant="outline" aria-hidden="false" aria-label="Cancel button">Cancel</Button>
                        </DrawerClose>
                        <Button
                            aria-label="Delete button"
                            aria-hidden="false"
                            variant="destructive"
                            onClick={onDelete}
                            disabled={isDeletePending}
                        >
                            {isDeletePending && (
                                <Loader className="mr-2 size-4 animate-spin" aria-hidden="true" />
                            )}
                            Delete
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
