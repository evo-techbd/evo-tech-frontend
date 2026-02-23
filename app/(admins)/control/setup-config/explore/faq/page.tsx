import { FaqManagement } from "@/components/admin/page-content/faq-management";

const FaqPage = () => {
    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
                    FAQ Management
                </h2>
                <p className="text-sm text-stone-600">
                    Manage frequently asked questions. Each FAQ can be individually activated or deactivated.
                </p>
            </div>
            <FaqManagement />
        </div>
    );
};

export default FaqPage;
