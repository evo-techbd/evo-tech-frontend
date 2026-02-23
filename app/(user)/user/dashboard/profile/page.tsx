'use client';

import { useUserProfile } from '@/hooks/use-user-dashboard';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/utils/axios/axios';

export default function ProfilePage() {
    const router = useRouter();
    const currentUser = useCurrentUser();
    const { profile, loading, error, refreshProfile } = useUserProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Controlled form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    // Initialize form values when profile loads
    // Initialize form values when profile loads
    useEffect(() => {
        if (profile) {
            setFirstName(profile.firstName || '');
            setLastName(profile.lastName || '');
            setPhone(profile.phone || '');
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        if (!profile || !currentUser?.id) return;

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        try {
            // Validate required fields
            if (!firstName.trim() || !lastName.trim()) {
                setSaveError('First name and last name are required');
                setIsSaving(false);
                return;
            }

            // Basic phone validation (optional)
            if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''))) {
                setSaveError('Please enter a valid phone number');
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

            setSaveSuccess(true);
            setIsEditing(false);
            
            // Refresh profile data
            refreshProfile();
            
            // Refresh the page to update all components
            router.refresh();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000);

        } catch (err) {
            console.error('Error updating profile:', err);
            setSaveError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        // Reset form to original values
        if (profile) {
            setFirstName(profile.firstName || '');
            setLastName(profile.lastName || '');
            setPhone(profile.phone || '');
        }
        setIsEditing(false);
        setSaveError(null);
        setSaveSuccess(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isSaving) {
            e.preventDefault();
            handleSaveProfile();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    if (loading) {
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

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-8">
                        <div className="text-red-600 mb-4">Error loading profile</div>
                        <p className="text-gray-600">{error}</p>
                        <Link href="/user/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
                            ← Back to Dashboard
                        </Link>
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
                    <Link href="/user/dashboard" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Profile
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
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {profile && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-blue-600">
                                    First Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-2 border-blue-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
                                        onKeyDown={handleKeyPress}
                                        required
                                    />
                                ) : (
                                    <p className="text-gray-900 py-2 font-medium">{profile.firstName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-purple-600">
                                    Last Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-2 border-purple-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 shadow-sm hover:shadow-md"
                                        onKeyDown={handleKeyPress}
                                        required
                                    />
                                ) : (
                                    <p className="text-gray-900 py-2 font-medium">{profile.lastName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-cyan-600">
                                    Email
                                </label>
                                <p className="text-gray-900 py-2.5 px-4 bg-gradient-to-br from-cyan-50/30 to-sky-50/30 border-2 border-cyan-100 rounded-lg font-medium">{profile.email}</p>
                                <p className="text-xs text-cyan-500 mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-emerald-600">
                                    Phone
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Enter phone number"
                                        className="w-full px-4 py-2.5 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-2 border-emerald-200 rounded-lg text-sm font-medium text-gray-900 placeholder:text-emerald-400/60 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 shadow-sm hover:shadow-md"
                                        onKeyDown={handleKeyPress}
                                    />
                                ) : (
                                    <p className="text-gray-900 py-2 font-medium">{profile.phone || 'Not provided'}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {saveError && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                            {saveError}
                        </div>
                    )}

                    {saveSuccess && (
                        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
                            Profile updated successfully!
                        </div>
                    )}

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
                                <p className="text-sm text-gray-600">Your account is currently active</p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}