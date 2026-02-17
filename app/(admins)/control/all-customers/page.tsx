import axiosIntercept from "@/utils/axios/axiosIntercept";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Search, Filter, Mail, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import axiosErrorLogger from "@/components/error/axios_error";

interface Customer {
  _id: string;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: string;
  isActive: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  lastActiveAt?: string;
  rewardPoints?: number;
}

interface CustomersPageProps {
  searchParams: Promise<{
    search?: string;
    isActive?: string;
    page?: string;
    limit?: string;
  }>;
}

const getAllCustomers = async (searchParams: Awaited<CustomersPageProps['searchParams']>): Promise<Customer[]> => {
    try {
        const axiosWithIntercept = await axiosIntercept();
        
        // Build query string
        const params = new URLSearchParams();
        params.set('userType', 'user'); // Filter for customers only
        if (searchParams.search) params.set('search', searchParams.search);
        if (searchParams.isActive) params.set('isActive', searchParams.isActive);
        if (searchParams.page) params.set('page', searchParams.page);
        if (searchParams.limit) params.set('limit', searchParams.limit);

        const queryString = params.toString();
        // Call backend directly (axiosIntercept already has NEXT_PUBLIC_BACKEND_URL)
        const response = await axiosWithIntercept.get(
            `/users${queryString ? `?${queryString}` : ''}`,
            {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
            }
        );
        
        return response.data.data || [];
    } catch (error: any) {
        axiosErrorLogger({ error });
        return [];
    }
};

const AllCustomersPage = async ({ searchParams }: CustomersPageProps) => {
    const params = await searchParams;
    const customers = await getAllCustomers(params);

    // Calculate stats
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive && c.lastActiveAt).length;
    const newThisMonth = customers.filter(c => {
        const createdDate = new Date(c.createdAt);
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
    }).length;

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">All Customers</h1>
                    <p className="text-stone-600 mt-1">
                        Manage and view all customer accounts
                    </p>
                </div>
                <Button className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Customer
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Customers
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCustomers}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Customers
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCustomers}</div>
                        <p className="text-xs text-muted-foreground">
                            Active recently
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            New This Month
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{newThisMonth}</div>
                        <p className="text-xs text-muted-foreground">
                            New registrations
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Customer List</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Customer Table */}
                    {customers.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {customers.map((customer) => (
                                            <tr key={customer._id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {customer.firstName} {customer.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {customer.uuid.slice(-8)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1 text-sm text-gray-900">
                                                            <Mail className="w-3 h-3" />
                                                            {customer.email}
                                                        </div>
                                                        {customer.phone && (
                                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                                <Phone className="w-3 h-3" />
                                                                {customer.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            customer.isActive 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {customer.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                        {customer.emailVerifiedAt && (
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 text-sm text-gray-900">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link href={`/control/all-customers/${customer._id}`}>
                                                        <Button variant="outline" size="sm">
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="border rounded-lg p-8 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">No customers yet</h3>
                            <p>Customer data will appear here when users register.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AllCustomersPage;