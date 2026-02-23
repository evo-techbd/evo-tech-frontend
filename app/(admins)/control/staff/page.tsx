import axiosIntercept from "@/utils/axios/axiosIntercept";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, User } from "lucide-react";
import { AddStaffForm } from "@/components/admin/staff/add-update-staff-form";
import { StaffDataTable } from "@/components/admin/staff/staff-data-table";
import axiosErrorLogger from "@/components/error/axios_error";

interface StaffMember {
    _id: string;
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    userType: 'admin' | 'employee';
    isActive: boolean;
    emailVerifiedAt?: string;
    createdAt: string;
    updatedAt: string;
    lastActiveAt?: string;
}

const getAllStaff = async (): Promise<StaffMember[]> => {
    try {
        const axiosWithIntercept = await axiosIntercept();
        
        // Build query string to get both admin and employee
        const params = new URLSearchParams();
        params.set('userType', 'admin,employee'); // Filter for staff only
        
        // Call backend directly (axiosIntercept already has NEXT_PUBLIC_BACKEND_URL)
        const response = await axiosWithIntercept.get(`/users?${params.toString()}`, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
        
        return response.data.data || [];
    } catch (error: any) {
        axiosErrorLogger({ error });
        return [];
    }
};

const StaffPage = async () => {
    const staffMembers = await getAllStaff();

    // Calculate stats
    const totalStaff = staffMembers.length;
    const admins = staffMembers.filter(s => s.userType === 'admin').length;
    const employees = staffMembers.filter(s => s.userType === 'employee').length;
    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Staff Management</h1>
                    <p className="text-stone-600 mt-1">
                        Manage all staff members and their roles
                    </p>
                </div>
                <AddStaffForm />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Staff
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStaff}</div>
                        <p className="text-xs text-muted-foreground">
                            All staff members
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Admins
                        </CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{admins}</div>
                        <p className="text-xs text-muted-foreground">
                            Admin roles
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Employees
                        </CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employees}</div>
                        <p className="text-xs text-muted-foreground">
                            Employee roles
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Staff List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Staff List</CardTitle>
                </CardHeader>
                <CardContent>
                    <StaffDataTable staffMembers={staffMembers} />
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffPage;