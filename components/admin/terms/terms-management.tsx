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
import { useRouter } from "next/navigation";
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
import { getAuthCookie, getCurrentUser } from "@/utils/cookies";

interface TermsData {
  _id: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const termsSchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters long"),
  version: z.string().optional(),
});

type TermsFormValues = z.infer<typeof termsSchema>;

export function TermsManagement() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [termsData, setTermsData] = useState<TermsData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const token = getAuthCookie();

  const form = useForm<TermsFormValues>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      content: "",
      version: "1.0",
    },
  });

  // Helper function to make authenticated requests
  const makeAuthRequest = React.useCallback(
    async (method: string, url: string, data?: any) => {
      // Configured axios already has baseURL and interceptors for token
      return axios({
        method,
        url, // relative path, e.g. "/terms"
        data,
      });
    },
    []
  );

  // Fetch terms data on component mount
  React.useEffect(() => {
    const fetchTerms = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await makeAuthRequest("GET", "/terms");
        setTermsData(response.data.data || []);
      } catch (error: any) {
        console.error("Failed to fetch terms:", error);
        toast.error("Failed to load terms and conditions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, [makeAuthRequest, token]);

  const refetchTerms = async () => {
    try {
      const response = await makeAuthRequest("GET", "/terms");
      setTermsData(response.data.data || []);
    } catch (error: any) {
      console.error("Failed to fetch terms:", error);
    }
  };

  const onSubmit = async (data: TermsFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await makeAuthRequest("PATCH", `/terms/${editingId}`, data);
        toast.success("Terms and conditions updated successfully");
      } else {
        await makeAuthRequest("POST", "/terms", data);
        toast.success("Terms and conditions created successfully");
      }

      form.reset();
      setEditingId(null);
      setShowForm(false);
      await refetchTerms();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save terms and conditions"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (terms: TermsData) => {
    setEditingId(terms._id);
    form.setValue("content", terms.content);
    form.setValue("version", terms.version);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await makeAuthRequest("DELETE", `/terms/${id}`);
      toast.success("Terms and conditions deleted successfully");
      await refetchTerms();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete terms and conditions"
      );
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await makeAuthRequest("PATCH", `/terms/${id}`, { isActive: true });
      toast.success("Terms and conditions activated successfully");
      await refetchTerms();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        "Failed to activate terms and conditions"
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
                  {editingId ? "Update" : "Create New"} Terms & Conditions
                </CardTitle>
                <CardDescription>
                  {editingId
                    ? "Update the existing terms and conditions"
                    : "Create a new version of terms and conditions. This will become the active version."}
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
                              placeholder="Enter the terms and conditions content..."
                              className="min-h-[400px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the full terms and conditions. You can use
                            markdown formatting.
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

          {/* Terms History Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Terms & Conditions History
            </h3>
            {termsData.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-stone-500">
                  No terms and conditions found. Create one to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {termsData.map((terms) => (
                  <Card key={terms._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                              Version {terms.version}
                            </CardTitle>
                            {terms.isActive && (
                              <Badge variant="default" className="bg-green-500">
                                <Check className="mr-1 h-3 w-3" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            Last updated:{" "}
                            {new Date(terms.updatedAt).toLocaleDateString()} at{" "}
                            {new Date(terms.updatedAt).toLocaleTimeString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {!terms.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(terms._id)}
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(terms)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!terms.isActive && (
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
                                  <AlertDialogTitle>Delete Version {terms.version}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this version of the terms and conditions.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(terms._id)}
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
                          {terms.content.substring(0, 500)}
                          {terms.content.length > 500 && "..."}
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
