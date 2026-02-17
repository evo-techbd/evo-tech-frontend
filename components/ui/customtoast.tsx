"use client";

import { IoIosCloseCircle } from "react-icons/io";
import { toast } from "sonner";


const CustomToast = ({ title, description = "", toastid }: {
    title: React.ReactNode;
    description?: React.ReactNode;
    toastid: string | number;
}) => {
    return (
        <div className="flex items-center justify-between min-w-[80px] sm:min-w-[300px] w-full max-w-[300px] h-fit p-2 rounded-[8px] shadow-md gap-2">
            <div className="flex flex-col items-start w-full h-fit px-1 gap-px">
                <p className="w-full h-fit text-[12px] sm:text-[13px] leading-5 font-[500] text-stone-900">{title}</p>
                {description && <p className="w-full h-fit text-[11px] sm:text-[12px] leading-5 font-[400] text-stone-500">{description}</p>}
            </div>
            <button type="button" aria-label="close toast" onClick={() => toast.dismiss(toastid)} className="w-fit h-fit rounded-full focus:outline-none">
                <IoIosCloseCircle className="inline w-5 h-5 text-stone-800" />
            </button>
        </div>
    )
}

export { CustomToast };
