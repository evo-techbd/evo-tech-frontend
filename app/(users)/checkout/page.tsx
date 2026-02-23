import { BreadCrumbItems } from "@/utils/types_interfaces/shared_interfaces";
import EvoBreadcrumbs from "@/components/ui/evo_breadcrumbs";
import { BsFillBagCheckFill } from "react-icons/bs";
import CheckoutParts from "./checkout_csr";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Checkout",
};

const CheckOutPage = () => {

    const breadcrumbData: BreadCrumbItems[] = [
        {
            content: <span>Home</span>,
            href: "/",
        },
        {
            content: <span>Cart</span>,
            href: `/cart`,
        },
        {
            content: <span>Checkout</span>,
            href: `/checkout`,
        },
    ];

    return (
        <>
            <div className="w-full min-h-[60px] sm:min-h-[68px] bg-gradient-to-br from-stone-950 via-stone-600 via-60% to-stone-900 translate-y-[-60px] sm:translate-y-[-68px] mb-[-60px] sm:mb-[-68px]">
            </div>

            <div className="w-full max-w-[1440px] h-fit pb-12 flex flex-col items-center font-inter">
                <div className="flex flex-col w-full h-fit px-4 sm:px-8 md:px-12 pt-3 pb-8 sm:pb-12 gap-4">
                    <EvoBreadcrumbs breadcrumbitemsdata={breadcrumbData} />

                    <div className="flex flex-col w-full min-h-[400px] text-[12px] sm:text-[13px] leading-5 font-[500] text-stone-800 gap-2">
                        <div className="flex justify-center items-center w-full h-fit px-4 py-2 text-[14px] sm:text-[16px] leading-6 font-[500] text-stone-900 bg-stone-50 rounded-md"><BsFillBagCheckFill className="inline w-4 h-4 text-stone-800 mr-1" />Checkout</div>

                        <CheckoutParts />
                    </div>
                </div>
            </div>
        </>
    );
}

export default CheckOutPage;
