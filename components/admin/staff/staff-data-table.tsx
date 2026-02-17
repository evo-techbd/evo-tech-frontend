'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, Shield, User, Key } from 'lucide-react';
import { format } from 'date-fns';
import { UpdateStaffForm } from './add-update-staff-form';
import Link from 'next/link';

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

interface StaffDataTableProps {
    staffMembers: StaffMember[];
}

export const StaffDataTable = ({ staffMembers }: StaffDataTableProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStaff = staffMembers.filter(staff => 
        staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.phone && staff.phone.includes(searchTerm))
    );

    return (
        <div>
            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search staff members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Staff Table */}
            {filteredStaff.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Staff Member
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
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
                                {filteredStaff.map((staff) => (
                                    <tr key={staff._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {staff.firstName} {staff.lastName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {staff.uuid.slice(-8)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-sm text-gray-900">
                                                    <Mail className="w-3 h-3" />
                                                    {staff.email}
                                                </div>
                                                {staff.phone && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <Phone className="w-3 h-3" />
                                                        {staff.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {staff.userType === 'admin' ? (
                                                    <>
                                                        <Shield className="w-4 h-4 text-purple-600" />
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                            Admin
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <User className="w-4 h-4 text-blue-600" />
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            Employee
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    staff.isActive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {staff.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                {staff.emailVerifiedAt && (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1 text-sm text-gray-900">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(staff.createdAt), 'MMM dd, yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <UpdateStaffForm
                                                    staffData={{
                                                        id: staff._id,
                                                        uuid: staff.uuid,
                                                        firstName: staff.firstName,
                                                        lastName: staff.lastName,
                                                        email: staff.email,
                                                        phone: staff.phone,
                                                        userType: staff.userType,
                                                        isActive: staff.isActive,
                                                    }}
                                                />
                                                {staff.userType === 'employee' && (
                                                    <Link href={`/control/staff/${staff._id}/permissions`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 hover:text-indigo-700"
                                                            title="Manage Permissions"
                                                        >
                                                            <Key className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="border rounded-lg p-8 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">
                        {searchTerm ? 'No staff members found' : 'No staff members yet'}
                    </h3>
                    <p>
                        {searchTerm 
                            ? 'Try adjusting your search criteria.' 
                            : 'Staff members will appear here when added.'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};
