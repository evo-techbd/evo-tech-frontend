'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import axios from '@/utils/axios/axios'
import { createStaffSchema, updateStaffSchema, CreateStaffInput, UpdateStaffInput } from '@/schemas/admin/staffSchemas'
import { AddingDialog } from '@/components/dialogs/adding-dialog'
import { EditingDialog } from '@/components/dialogs/editing-dialog'
import React, { useState } from 'react'

interface StaffDataType {
    id: string
    uuid: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    userType: 'admin' | 'employee'
    isActive: boolean
}

interface StaffFormProps {
    mode?: 'create' | 'update';
    staffData?: StaffDataType;
    onSuccess?: () => void;
}

const StaffForm = ({ mode = 'create', staffData, onSuccess }: StaffFormProps) => {
    const isUpdate = mode === 'update';
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateStaffInput | UpdateStaffInput>({
        resolver: zodResolver(isUpdate ? updateStaffSchema : createStaffSchema),
        defaultValues: (isUpdate && staffData) ? {
            firstName: staffData.firstName,
            lastName: staffData.lastName,
            email: staffData.email,
            phone: staffData.phone || '',
            userType: staffData.userType,
            isActive: staffData.isActive,
        } : {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: '',
            userType: 'employee',
            isActive: true,
        },
    })

    const onSubmit = async (values: CreateStaffInput | UpdateStaffInput) => {
        setIsSubmitting(true);

        try {
            const url = isUpdate
                ? `/users/${staffData!.id}`
                : `/users/staff`

            const method = isUpdate ? 'PUT' : 'POST'

            const response = await axios({
                method,
                url,
                data: values,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
                withCredentials: true,
            })

            if (response.data && response.data.success) {
                toast.success(isUpdate ? `Staff member updated successfully` : `Staff member created successfully`);
                form.reset();
                onSuccess?.();
            }
        } catch (error: any) {
            if (error.response) {
                toast.error(error.response.data.message || "Something went wrong")
            } else {
                toast.error("Something went wrong")
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block text-xs font-medium text-left">First Name*</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter first name"
                                        {...field}
                                        disabled={isSubmitting}
                                        className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block text-xs font-medium text-left">Last Name*</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter last name"
                                        {...field}
                                        disabled={isSubmitting}
                                        className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-xs font-medium text-left">Email*</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="Enter email address"
                                    {...field}
                                    disabled={isSubmitting || isUpdate}
                                    className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!isUpdate && (
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block text-xs font-medium text-left">Password*</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="Enter password"
                                        {...field}
                                        disabled={isSubmitting}
                                        className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-xs font-medium text-left">Phone</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter phone number (optional)"
                                    {...field}
                                    disabled={isSubmitting}
                                    className="block w-full text-xs border border-gray-300 rounded-md p-2 bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:text-xs"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-xs font-medium text-left">Role*</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isSubmitting}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full text-xs">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="employee">Employee</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-xs font-medium">Active Status</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6"
                    >
                        {isSubmitting ? (isUpdate ? 'Updating...' : 'Creating...') : (isUpdate ? 'Update Staff Member' : 'Create Staff Member')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export const AddStaffForm = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AddingDialog
            buttonText="Add Staff Member"
            dialogTitle="Add New Staff Member"
            dialogDescription="Fill in the details to add a new staff member"
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <StaffForm onSuccess={() => {
                setIsOpen(false);
                // Refresh the page to show new staff
                window.location.reload();
            }} />
        </AddingDialog>
    );
};

export const UpdateStaffForm = ({ staffData }: { staffData: StaffDataType }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <EditingDialog
            buttonText="Edit"
            dialogTitle="Update Staff Member"
            dialogDescription="Update the staff member's details"
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <StaffForm
                mode="update"
                staffData={staffData}
                onSuccess={() => {
                    setIsOpen(false);
                    // Refresh the page to show updated staff
                    window.location.reload();
                }}
            />
        </EditingDialog>
    );
};
