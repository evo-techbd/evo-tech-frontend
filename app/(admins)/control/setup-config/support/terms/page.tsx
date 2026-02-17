import { TermsManagement } from "@/components/admin/terms/terms-management";

const SupportTermsPage = () => {
    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
                    Terms & Conditions Management
                </h2>
                <p className="text-sm text-stone-600">
                    Manage your website&apos;s terms and conditions. Only one version can be active at a time.
                </p>
            </div>
            <TermsManagement />
        </div>
    );
};

export default SupportTermsPage;
