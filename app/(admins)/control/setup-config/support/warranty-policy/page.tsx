import { PageContentManagement } from "@/components/admin/page-content/page-content-management";

const WarrantyPolicyPage = () => {
    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
                    Warranty Policy Management
                </h2>
                <p className="text-sm text-stone-600">
                    Manage your website&apos;s warranty policy. Only one version can be active at a time.
                </p>
            </div>
            <PageContentManagement
                contentType="warranty-policy"
                title="Warranty Policy"
                apiPath="/page-content/warranty-policy"
            />
        </div>
    );
};

export default WarrantyPolicyPage;
