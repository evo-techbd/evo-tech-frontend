'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/utils/axios/axios';
import { toast } from 'sonner';

export default function EmployeeProfilePage() {
    const router = useRouter();
    const currentUser = useCurrentUser();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Controlled form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    // Initialize form values when session loads
    useEffect(() => {
        if (currentUser) {
            setFirstName(currentUser.firstName || '');
            setLastName(currentUser.lastName || '');
            setPhone(currentUser.phone || '');
        }
    }, [currentUser]);

    const handleSaveProfile = async () => {
        if (!currentUser || !currentUser.id) return;

        setIsSaving(true);

        try {
            // Validate required fields
            if (!firstName.trim() || !lastName.trim()) {
                toast.error('First name and last name are required');
                setIsSaving(false);
                return;
            }

            // Basic phone validation (optional)
            if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''))) {
                toast.error('Please enter a valid phone number');
                setIsSaving(false);
                return;
            }

            const updatedData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: phone.trim() || null,
            };

            // Call the backend API to update user profile
            const response = await axios.put(`/users/${currentUser.id}`, updatedData);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to update profile');
            }

            // Dispatch auth change event to update useCurrentUser hook
            window.dispatchEvent(new Event('authChange'));

            toast.success('Profile updated successfully!');
            setIsEditing(false);
            
            // Refresh the page to update all components
            router.refresh();

        } catch (err) {
            console.error('Error updating profile:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset form to original values
        if (currentUser) {
            setFirstName(currentUser.firstName || '');
            setLastName(currentUser.lastName || '');
            setPhone(currentUser.phone || '');
        }
        setIsEditing(false);
    };

    if (!currentUser) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/employee/dashboard" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Employee Profile
                    </h1>
                    <p className="text-gray-600">
                        Manage your personal information and account settings.
                    </p>
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Personal Information
                        </h2>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Edit Profile
                            </button>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <label className="absolute left-2 -top-2 px-2 text-xs font-[700] text-blue-600 bg-white z-10">
                                First Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter first name"
                                    className="w-full h-[42px] px-4 py-2.5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-2 border-blue-200 rounded-lg text-sm font-medium text-gray-900 placeholder:text-blue-400/60 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
                                    required
                                />
                            ) : (
                                <div className="w-full h-[42px] px-4 py-2.5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-2 border-blue-200 rounded-lg text-sm font-medium text-gray-900 flex items-center shadow-sm">{currentUser.firstName}</div>
                            )}
                        </div>

                        <div className="relative">
                            <label className="absolute left-2 -top-2 px-2 text-xs font-[700] text-purple-600 bg-white z-10">
                                Last Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter last name"
                                    className="w-full h-[42px] px-4 py-2.5 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-2 border-purple-200 rounded-lg text-sm font-medium text-gray-900 placeholder:text-purple-400/60 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 shadow-sm hover:shadow-md"
                                    required
                                />
                            ) : (
                                <div className="w-full h-[42px] px-4 py-2.5 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-2 border-purple-200 rounded-lg text-sm font-medium text-gray-900 flex items-center shadow-sm">{currentUser.lastName}</div>
                            )}
                        </div>

                        <div className="relative">
                            <label className="absolute left-2 -top-2 px-2 text-xs font-[700] text-cyan-600 bg-white z-10">
                                Email
                            </label>
                            <div className="w-full h-[42px] px-4 py-2.5 bg-gradient-to-br from-cyan-50/50 to-sky-50/50 border-2 border-cyan-200 rounded-lg text-sm font-medium text-gray-900 flex items-center shadow-sm">{currentUser.email}</div>
                            <p className="text-xs text-cyan-500 mt-1 ml-1">Email cannot be changed</p>
                        </div>

                        <div className="relative">
                            <label className="absolute left-2 -top-2 px-2 text-xs font-[700] text-emerald-600 bg-white z-10">
                                Phone
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter phone number"
                                    className="w-full h-[42px] px-4 py-2.5 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-2 border-emerald-200 rounded-lg text-sm font-medium text-gray-900 placeholder:text-emerald-400/60 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 shadow-sm hover:shadow-md"
                                />
                            ) : (
                                <div className="w-full h-[42px] px-4 py-2.5 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-2 border-emerald-200 rounded-lg text-sm font-medium text-gray-900 flex items-center shadow-sm">{currentUser.phone || 'Not provided'}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <p className="text-gray-900 py-2 capitalize">{currentUser.role || 'Employee'}</p>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-6 pt-6 border-t">
                            <div className="flex space-x-4">
                                <button 
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Account Settings
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">Account Status</h3>
                                <p className="text-sm text-gray-600">Your employee account is currently active</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                Active
                            </span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                                <h3 className="font-medium text-gray-900">Access Level</h3>
                                <p className="text-sm text-gray-600">Employee privileges</p>
                            </div>
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                Employee
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
