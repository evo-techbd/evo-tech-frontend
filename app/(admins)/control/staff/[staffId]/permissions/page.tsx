import { Metadata } from "next";
import axiosIntercept from "@/utils/axios/axiosIntercept";
import { ManageStaffPermissions } from "@/components/admin/staff/manage-staff-permissions";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Staff Permissions",
  description: "Manage staff permissions",
};

export default async function StaffPermissionsPage({ params }: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await params;

  try {
    const axiosWithIntercept = await axiosIntercept();
    const response = await axiosWithIntercept.get(`/users/${staffId}`);

    if (!response.data.success) {
      notFound();
    }

    const staff = response.data.data;

    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            <div className="flex flex-col gap-2">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
                    Staff Permissions
                </h2>
                <p className="text-sm text-gray-600">
                    Manage what {staff.firstName} {staff.lastName} can access in the dashboard
                </p>
            </div>

            <ManageStaffPermissions 
                staffUuid={staff.uuid}
                staffName={`${staff.firstName} ${staff.lastName}`}
            />
        </div>
    );
  } catch (error) {
    console.error("Error fetching staff:", error);
    notFound();
  }
}
