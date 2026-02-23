import { PageContentManagement } from "@/components/admin/page-content/page-content-management";

const StudentDiscountPage = () => {
    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
                    Student Discount Management
                </h2>
                <p className="text-sm text-stone-600">
                    Manage the Student Discount page content. Only one version can be active at a time.
                </p>
            </div>
            <PageContentManagement
                contentType="student-discount"
                title="Student Discount"
                apiPath="/page-content/student-discount"
            />
        </div>
    );
};

export default StudentDiscountPage;
