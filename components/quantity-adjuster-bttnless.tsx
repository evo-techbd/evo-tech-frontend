"use client";

import { cn } from "@/lib/all_utils";


const QuantityAdjusterBttnless = ({ itemQuantity, qtyIncrement, qtyDecrement, handleQuantityChange, handleQuantityPaste, className }: {
    itemQuantity: string | number;
    qtyIncrement: () => void;
    qtyDecrement: () => void;
    handleQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleQuantityPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    className?: string;
}) => {

    return (
        <div className={cn(`w-fit h-fit flex`, className)}>
            <button
                type="button"
                aria-label="decrement button for quantity"
                onClick={qtyDecrement}
                disabled={Number(itemQuantity) < 2}
                className="inline-flex justify-center items-center w-[30px] h-8 sm:h-9 md:h-[40px] px-2 text-[16px] leading-4 font-[500] text-stone-600 disabled:text-stone-400 bg-transparent border-y border-l border-[#aeaeae] rounded-l-[4px] focus:outline-none"
            >
                -
            </button>
            <input
                id="itemquantity"
                name="itemquantity"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={itemQuantity}
                readOnly
                aria-label="item quantity"
                className="text-center w-[40px] h-8 sm:h-9 md:h-[40px] p-0 text-[12px] sm:text-[13px] leading-6 font-[500] text-stone-800 bg-transparent border-y border-[#aeaeae] focus:outline-none cursor-default"
            />
            <button
                type="button"
                aria-label="increment button for quantity"
                onClick={qtyIncrement}
                disabled={Number(itemQuantity) > 9998}
                className="inline-flex justify-center items-center w-[30px] h-8 sm:h-9 md:h-[40px] px-2 text-[16px] leading-4 font-[500] text-stone-600 disabled:text-stone-400 bg-transparent border-y border-r border-[#aeaeae] rounded-r-[4px] focus:outline-none"
            >
                +
            </button>
        </div>
    );
}

export default QuantityAdjusterBttnless;
