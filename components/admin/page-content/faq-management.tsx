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
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
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

interface FaqData {
    _id: string;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const faqSchema = z.object({
    question: z.string().min(5, "Question must be at least 5 characters long"),
    answer: z.string().min(5, "Answer must be at least 5 characters long"),
    order: z.coerce.number().int().min(0, "Order must be 0 or greater"),
});

type FaqFormValues = z.infer<typeof faqSchema>;

export function FaqManagement() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [faqData, setFaqData] = useState<FaqData[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const token = getAuthCookie();

    const form = useForm<FaqFormValues>({
        resolver: zodResolver(faqSchema),
        defaultValues: {
            question: "",
            answer: "",
            order: 0,
        },
    });

    const makeAuthRequest = React.useCallback(
        async (method: string, url: string, data?: any) => {
            return axios({ method, url, data });
        },
        []
    );

    React.useEffect(() => {
        const fetchFaqs = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await makeAuthRequest("GET", "/faqs");
                setFaqData(response.data.data || []);
            } catch (error: any) {
                console.error("Failed to fetch FAQs:", error);
                toast.error("Failed to load FAQs");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFaqs();
    }, [makeAuthRequest, token]);

    const refetchFaqs = async () => {
        try {
            const response = await makeAuthRequest("GET", "/faqs");
            setFaqData(response.data.data || []);
        } catch (error: any) {
            console.error("Failed to fetch FAQs:", error);
        }
    };

    const onSubmit = async (data: FaqFormValues) => {
        setIsSubmitting(true);
        try {
            if (editingId) {
                await makeAuthRequest("PATCH", `/faqs/${editingId}`, data);
                toast.success("FAQ updated successfully");
            } else {
                await makeAuthRequest("POST", "/faqs", data);
                toast.success("FAQ created successfully");
            }

            form.reset();
            setEditingId(null);
            setShowForm(false);
            await refetchFaqs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save FAQ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (faq: FaqData) => {
        setEditingId(faq._id);
        form.setValue("question", faq.question);
        form.setValue("answer", faq.answer);
        form.setValue("order", faq.order ?? 0);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await makeAuthRequest("DELETE", `/faqs/${id}`);
            toast.success("FAQ deleted successfully");
            await refetchFaqs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete FAQ");
        }
    };

    const handleToggleActive = async (faq: FaqData) => {
        try {
            await makeAuthRequest("PATCH", `/faqs/${faq._id}`, {
                isActive: !faq.isActive,
            });
            toast.success(
                faq.isActive ? "FAQ deactivated" : "FAQ activated"
            );
            await refetchFaqs();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update FAQ");
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
                    {showForm ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {editingId ? "Update" : "Create New"} FAQ
                                </CardTitle>
                                <CardDescription>
                                    {editingId
                                        ? "Update the FAQ question and answer"
                                        : "Create a new FAQ entry"}
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
                                            name="question"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Question</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter the FAQ question..."
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="answer"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Answer</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter the FAQ answer..."
                                                            className="min-h-[200px] text-sm"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="order"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Display Order</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            placeholder="0"
                                                            {...field}
                                                        />
                                                    </FormControl>
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
                            Add New FAQ
                        </Button>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            All FAQs ({faqData.length})
                        </h3>
                        {faqData.length === 0 ? (
                            <Card>
                                <CardContent className="py-8 text-center text-stone-500">
                                    No FAQs found. Create one to get started.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {faqData.map((faq) => (
                                    <Card key={faq._id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <CardTitle className="text-base">
                                                            {faq.question}
                                                        </CardTitle>
                                                        <Badge
                                                            variant={faq.isActive ? "default" : "secondary"}
                                                            className={
                                                                faq.isActive ? "bg-green-500" : "bg-stone-400"
                                                            }
                                                        >
                                                            {faq.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription>
                                                        Updated:{" "}
                                                        {new Date(faq.updatedAt).toLocaleDateString()} at{" "}
                                                        {new Date(faq.updatedAt).toLocaleTimeString()}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(faq)}
                                                        title={faq.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {faq.isActive ? (
                                                            <span className="text-red-600">Deactivate</span>
                                                        ) : (
                                                            <span className="text-green-600">Activate</span>
                                                        )}
                                                    </Button>
                                                    {/* <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(faq)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button> */}
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
                                                                <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete this FAQ.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(faq._id)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="rounded-md bg-stone-50 p-4">
                                                <p className="text-sm text-stone-700 whitespace-pre-wrap">
                                                    {faq.answer}
                                                </p>
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
