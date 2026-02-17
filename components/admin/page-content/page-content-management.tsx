"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import axios from "@/utils/axios/axios";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Check } from "lucide-react";
import { getAuthCookie } from "@/utils/cookies";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ContentData {
    _id: string;
    content: string;
    version: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const contentSchema = z.object({
    content: z.string().min(10, "Content must be at least 10 characters long"),
    version: z.string().optional(),
});

type ContentFormValues = z.infer<typeof contentSchema>;

interface PageContentManagementProps {
    contentType: string;
    title: string;
    apiPath: string; // e.g., "/page-content/privacy-policy"
}

export function PageContentManagement({
    contentType,
    title,
    apiPath,
}: PageContentManagementProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [contentData, setContentData] = useState<ContentData[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const token = getAuthCookie();

    const form = useForm<ContentFormValues>({
        resolver: zodResolver(contentSchema),
        defaultValues: {
            content: "",
            version: "1.0",
        },
    });

    const makeAuthRequest = React.useCallback(
        async (method: string, url: string, data?: any) => {
            return axios({
                method,
                url,
                data,
            });
        },
        []
    );

    React.useEffect(() => {
        const fetchContent = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await makeAuthRequest("GET", apiPath);
                setContentData(response.data.data || []);
            } catch (error: any) {
                console.error(`Failed to fetch ${title}:`, error);
                toast.error(`Failed to load ${title}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [makeAuthRequest, token, apiPath, title]);

    const refetchContent = async () => {
        try {
            const response = await makeAuthRequest("GET", apiPath);
            setContentData(response.data.data || []);
        } catch (error: any) {
            console.error(`Failed to fetch ${title}:`, error);
        }
    };

    const onSubmit = async (data: ContentFormValues) => {
        setIsSubmitting(true);
        try {
            if (editingId) {
                await makeAuthRequest("PATCH", `${apiPath}/${editingId}`, data);
                toast.success(`${title} updated successfully`);
            } else {
                await makeAuthRequest("POST", apiPath, data);
                toast.success(`${title} created successfully`);
            }

            form.reset();
            setEditingId(null);
            setShowForm(false);
            await refetchContent();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to save ${title}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (item: ContentData) => {
        setEditingId(item._id);
        form.setValue("content", item.content);
        form.setValue("version", item.version);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await makeAuthRequest("DELETE", `${apiPath}/${id}`);
            toast.success(`${title} deleted successfully`);
            await refetchContent();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to delete ${title}`);
        }
    };

    const handleActivate = async (id: string) => {
        try {
            await makeAuthRequest("PATCH", `${apiPath}/${id}`, { isActive: true });
            toast.success(`${title} activated successfully`);
            await refetchContent();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || `Failed to activate ${title}`
            );
        }
    };

    const handleCancel = () => {
        form.reset();
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {isLoading ? (
                <Card>
                    <CardContent className="py-12 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Form Section */}
                    {showForm ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {editingId ? "Update" : "Create New"} {title}
                                </CardTitle>
                                <CardDescription>
                                    {editingId
                                        ? `Update the existing ${title}`
                                        : `Create a new version of ${title}. This will become the active version.`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-6"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="version"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Version</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="1.0" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Version number for tracking (e.g., 1.0, 1.1, 2.0)
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="content"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Content</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={`Enter the ${title.toLowerCase()} content...`}
                                                            className="min-h-[400px] font-mono text-sm"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Enter the full content. You can use markdown
                                                        formatting.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex gap-3">
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                {editingId ? "Update" : "Create"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Version
                        </Button>
                    )}

                    {/* Content History Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{title} History</h3>
                        {contentData.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-stone-500">
                                    No {title.toLowerCase()} found. Create one to get started.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {contentData.map((item) => (
                                    <Card key={item._id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <CardTitle className="text-base">
                                                            Version {item.version}
                                                        </CardTitle>
                                                        {item.isActive && (
                                                            <Badge
                                                                variant="default"
                                                                className="bg-green-500"
                                                            >
                                                                <Check className="mr-1 h-3 w-3" />
                                                                Active
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardDescription>
                                                        Last updated:{" "}
                                                        {new Date(item.updatedAt).toLocaleDateString()} at{" "}
                                                        {new Date(item.updatedAt).toLocaleTimeString()}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!item.isActive && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleActivate(item._id)}
                                                        >
                                                            Activate
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {!item.isActive && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Version {item.version}?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete this version.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(item._id)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="rounded-md bg-stone-50 p-4 max-h-[300px] overflow-y-auto">
                                                <pre className="whitespace-pre-wrap text-sm text-stone-700 font-sans">
                                                    {item.content.substring(0, 500)}
                                                    {item.content.length > 500 && "..."}
                                                </pre>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
