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


interface AddingDialogProps<T> extends React.ComponentPropsWithoutRef<typeof Dialog> {
    buttonText: string;
    children: React.ReactNode;
    showTrigger?: boolean;
    dialogTitle?: string;
    dialogDescription?: string;
}

export function AddingDialog<T>({
    buttonText,
    children,
    showTrigger = true,
    dialogTitle,
    dialogDescription,
    ...props
}: AddingDialogProps<T>) {
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
                                    className="w-fit px-7 py-2 bg-stone-800 font-[500] text-white hover:text-white rounded text-xs md:text-sm hover:bg-stone-900"
                                    aria-label={buttonText || 'Trigger button'}
                                    aria-hidden="false"
                                >
                                    {buttonText}
                                </Button>
                            </DialogTrigger>
                        </div>
                    ) : null}
                    <DialogContent className="bg-stone-50">
                        <DialogHeader>
                            <DialogTitle className="mr-7 py-2 text-sm underline underline-offset-2">{dialogTitle || `Add New Item`}</DialogTitle>
                            <DialogDescription className={dialogDescription ? '' : 'sr-only'}>
                                {dialogDescription ||
                                    `This will add a new item.`
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
                                className="px-7 py-2 bg-stone-800 font-[500] text-white hover:text-white rounded text-xs md:text-sm hover:bg-stone-900"
                                aria-label={buttonText || 'Trigger button'}
                                aria-hidden="false"
                            >
                                {buttonText}
                            </Button>
                        </DrawerTrigger>
                    </div>
                ) : null}
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{dialogTitle || `Add New Item`}</DrawerTitle>
                        <DrawerDescription className={dialogDescription ? '' : 'sr-only'}>
                            {dialogDescription ||
                                `This will add a new item.`
                            }
                        </DrawerDescription>
                        {children}
                    </DrawerHeader>
                </DrawerContent>
            </Drawer>
        </>
    );
}
