import axiosIntercept from "@/utils/axios/axiosIntercept";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Calendar, User, MapPin } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import axiosErrorLogger from "@/components/error/axios_error";
import { notFound } from "next/navigation";

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
  contactNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

const getCustomer = async (id: string): Promise<Customer | null> => {
  try {
    const axiosWithIntercept = await axiosIntercept();
    const response = await axiosWithIntercept.get(`/users/${id}`, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

    return response.data.data || null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    axiosErrorLogger({ error });
    return null;
  }
};

const CustomerDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    return notFound();
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/control/all-customers">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Customer Details
          </h1>
          <p className="text-stone-500 text-sm">
            View full profile information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-stone-50 rounded-lg">
              <div className="h-16 w-16 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-stone-900">
                  {customer.firstName} {customer.lastName}
                </h3>
                <p className="text-stone-500 text-sm">ID: {customer._id}</p>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full items-center ${
                      customer.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {customer.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 items-center">
                    {customer.userType.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-stone-500">
                  Email Address
                </label>
                <div className="flex items-center gap-2 text-stone-900">
                  <Mail className="h-4 w-4 text-stone-400" />
                  {customer.email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-stone-500">
                  Phone Number
                </label>
                <div className="flex items-center gap-2 text-stone-900">
                  <Phone className="h-4 w-4 text-stone-400" />
                  {customer.phone || customer.contactNumber || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-stone-500">
                  Joined Date
                </label>
                <div className="flex items-center gap-2 text-stone-900">
                  <Calendar className="h-4 w-4 text-stone-400" />
                  {format(new Date(customer.createdAt), "MMMM dd, yyyy")}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-stone-500">
                  Last Active
                </label>
                <div className="text-stone-900">
                  {customer.lastActiveAt
                    ? format(new Date(customer.lastActiveAt), "MMM dd, yyyy HH:mm")
                    : "Never"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info/Stats Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-sm text-stone-600">Reward Points</span>
                <span className="font-semibold text-stone-900">
                  {customer.rewardPoints || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-sm text-stone-600">Email Verified</span>
                <span className="font-semibold text-stone-900">
                  {customer.emailVerifiedAt ? "Yes" : "No"}
                </span>
              </div>
            </CardContent>
          </Card>
          
           {/* Address Card (Placeholder if data structure exists) */}
           <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
                {customer.address ? (
                   <div className="text-sm text-stone-700 space-y-1">
                        <div className="flex gap-2">
                             <MapPin className="h-4 w-4 text-stone-400 shrink-0" />
                             <div>
                                <p>{customer.address.street}</p>
                                <p>{customer.address.city}, {customer.address.state} {customer.address.zipCode}</p>
                                <p>{customer.address.country}</p>
                             </div>
                        </div>
                   </div>
                ) : (
                    <p className="text-sm text-stone-500 italic">No address information available.</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
