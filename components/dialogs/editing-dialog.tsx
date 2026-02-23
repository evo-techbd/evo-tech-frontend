"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/evo_dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Edit } from "lucide-react";


interface EditingDialogProps<T> extends React.ComponentPropsWithoutRef<typeof Dialog> {
    buttonText: string;
    children: React.ReactNode;
    showTrigger?: boolean;
    dialogTitle?: string;
    dialogDescription?: string;
}

export function EditingDialog<T>({
    buttonText,
    children,
    showTrigger = true,
    dialogTitle,
    dialogDescription,
    ...props
}: EditingDialogProps<T>) {
    const isDesktop = useMediaQuery("(min-width: 640px)");

    if (isDesktop) {
        return (
            <>
                <Dialog {...props} open={props.open} onOpenChange={props.onOpenChange}>
                    {showTrigger ? (
                        <div className="w-full flex justify-end h-fit">
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full bg-yellow-200 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
                                    aria-label={buttonText || 'Trigger button'}
                                    aria-hidden="false"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                        </div>
                    ) : null}
                    <DialogContent className="bg-stone-50">
                        <DialogHeader>
                            <DialogTitle className="mr-7 py-2 text-sm underline underline-offset-2">{dialogTitle || `Edit Item`}</DialogTitle>
                            <DialogDescription className={dialogDescription ? '' : 'sr-only'}>
                                {dialogDescription ||
                                    `Make changes to the item.`
                                }
                            </DialogDescription>
                            {children}
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <>
            <Drawer {...props} open={props.open} onOpenChange={props.onOpenChange}>
                {showTrigger ? (
                    <div className="w-full flex justify-end h-fit">
                        <DrawerTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full bg-yellow-200 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
                                aria-label={buttonText || 'Trigger button'}
                                aria-hidden="false"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </DrawerTrigger>
                    </div>
                ) : null}
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{dialogTitle || `Edit Item`}</DrawerTitle>
                        <DrawerDescription className={dialogDescription ? '' : 'sr-only'}>
                            {dialogDescription ||
                                `Make changes to the item.`
                            }
                        </DrawerDescription>
                        {children}
                    </DrawerHeader>
                </DrawerContent>
            </Drawer>
        </>
    );
}
