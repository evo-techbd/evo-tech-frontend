"use client";

import { Toaster, ToasterProps } from "sonner";

const EvoToaster = ({ ...props }: ToasterProps) => {

    return (
        <Toaster
            className="toaster group max-w-[300px]"
            position="bottom-left"
            theme="light"
            expand={false}
            visibleToasts={2}
            duration={4000}
            richColors
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-stone-50 group-[.toaster]:text-stone-800 group-[.toaster]:border group-[.toaster]:border-stone-400 group-[.toaster]:shadow-md group-[.toaster]:rounded-[8px] group-[.toaster]:overflow-hidden group-[.toaster]:text-[12px] sm:group-[.toaster]:text-[13px] group-[.toaster]:leading-5 group-[.toaster]:font-[500]",
                    description: "group-[.toast]:text-stone-500 group-[.toast]:text-[11px] sm:group-[.toast]:text-[12px]",
                    actionButton:
                        "group-[.toast]:bg-stone-800 group-[.toast]:text-stone-50",
                    cancelButton:
                        "group-[.toast]:bg-stone-800 group-[.toast]:text-stone-50",
                },
            }}
            {...props}
        />
    )
}

export { EvoToaster };
