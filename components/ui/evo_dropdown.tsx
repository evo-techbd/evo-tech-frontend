"use client";

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import { cn } from "@/lib/all_utils";
import { IoChevronDown } from "react-icons/io5";

const EvoDropdown = ({ dropdownLabel, onKeyChange, children, ariaLabelForMenu, dropdownTriggerClassName = "", selectedKey }: {
    dropdownLabel: string;
    onKeyChange: (itemkey: string) => void;
    children: React.ReactElement<typeof DropdownItem> | React.ReactElement<typeof DropdownItem>[];
    ariaLabelForMenu: string;
    dropdownTriggerClassName?: string;
    selectedKey: string;
}) => {

    return (
        <Dropdown
            shouldCloseOnBlur
            offset={0}
            classNames={{
                content: "z-[1] outline-none box-border rounded-[8px] shadow-md p-1 w-fit h-fit bg-white border border-stone-300 min-w-0",
            }}
        >
            <DropdownTrigger>
                <button
                    type="button"
                    aria-label={dropdownLabel}
                    className={cn("relative z-[0] flex w-fit h-fit pl-2 pr-[24px] py-1 sm:py-1.5 text-[12px] leading-5 font-[500] text-stone-700 bg-white border border-stone-300 rounded-[6px] overflow-hidden focus-visible:outline-none",
                        dropdownTriggerClassName
                    )}
                >
                    <p className="w-full h-fit text-left truncate capitalize">
                        {dropdownLabel}
                    </p>
                    <div className="absolute z-0 inset-y-0 right-0 flex items-center w-fit px-1 py-1 bg-white">
                        <IoChevronDown className="inline w-[14px] h-[14px] text-stone-700" />
                    </div>
                </button>
            </DropdownTrigger>

            <DropdownMenu
                aria-label={ariaLabelForMenu}
                onAction={(key) => onKeyChange(key.toString())}
                selectionMode="single"
                selectedKeys={new Set([selectedKey])}
                classNames={{
                    base: "w-fit h-fit rounded-[6px] p-[2px]",
                }}
                itemClasses={{
                    base: "border border-stone-300 rounded-[3px] bg-stone-100 px-2 py-1",
                    title: "text-[12px] sm:text-[13px] leading-5 font-[500] text-stone-700",
                }}
            >
                {children as any}
            </DropdownMenu>
        </Dropdown>
    )
}

export default EvoDropdown;
