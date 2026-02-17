import { CreateCouponForm } from "@/components/admin/coupons/comps/create-coupon-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Coupon",
    description: "Create a new discount coupon",
};

const CreateCouponPage = () => {
    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">Create New Coupon</h2>
            </div>

            <CreateCouponForm />
        </div>
    );
}

export default CreateCouponPage;
