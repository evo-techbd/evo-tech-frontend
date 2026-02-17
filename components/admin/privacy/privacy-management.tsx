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
import { getAuthCookie, getCurrentUser } from "@/utils/cookies";

interface PrivacyData {
  _id: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const privacySchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters long"),
  version: z.string().optional(),
});

type PrivacyFormValues = z.infer<typeof privacySchema>;

export function PrivacyManagement() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [privacyData, setPrivacyData] = useState<PrivacyData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const token = getAuthCookie();

  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacySchema),
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
        url, // relative path, e.g. "/privacy"
        data,
      });
    },
    []
  );

  // Fetch privacy data on component mount
  React.useEffect(() => {
    const fetchPrivacy = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await makeAuthRequest("GET", "/privacy");
        setPrivacyData(response.data.data || []);
      } catch (error: any) {
        console.error("Failed to fetch privacy:", error);
        toast.error("Failed to load privacy policy");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacy();
  }, [makeAuthRequest, token]);

  const refetchPrivacy = async () => {
    try {
      const response = await makeAuthRequest("GET", "/privacy");
      setPrivacyData(response.data.data || []);
    } catch (error: any) {
      console.error("Failed to fetch privacy:", error);
    }
  };

  const onSubmit = async (data: PrivacyFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await makeAuthRequest("PATCH", `/privacy/${editingId}`, data);
        toast.success("Privacy policy updated successfully");
      } else {
        await makeAuthRequest("POST", "/privacy", data);
        toast.success("Privacy policy created successfully");
      }

      form.reset();
      setEditingId(null);
      setShowForm(false);
      await refetchPrivacy();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save privacy policy"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (privacy: PrivacyData) => {
    setEditingId(privacy._id);
    form.setValue("content", privacy.content);
    form.setValue("version", privacy.version);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      toast.warning("Click delete again to confirm");
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await makeAuthRequest("DELETE", `/privacy/${id}`);
      toast.success("Privacy policy deleted successfully");
      setDeleteConfirm(null);
      await refetchPrivacy();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete privacy policy"
      );
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await makeAuthRequest("PATCH", `/privacy/${id}`, { isActive: true });
      toast.success("Privacy policy activated successfully");
      await refetchPrivacy();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to activate privacy policy"
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
                  {editingId ? "Update" : "Create New"} Privacy Policy
                </CardTitle>
                <CardDescription>
                  {editingId
                    ? "Update the existing privacy policy"
                    : "Create a new version of privacy policy. This will become the active version."}
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
                              placeholder="Enter the privacy policy content..."
                              className="min-h-[400px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the full privacy policy. You can use
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

          {/* Privacy History Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Privacy Policy History
            </h3>
            {privacyData.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-stone-500">
                  No privacy policy found. Create one to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {privacyData.map((privacy) => (
                  <Card key={privacy._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                              Version {privacy.version}
                            </CardTitle>
                            {privacy.isActive && (
                              <Badge variant="default" className="bg-green-500">
                                <Check className="mr-1 h-3 w-3" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            Last updated:{" "}
                            {new Date(privacy.updatedAt).toLocaleDateString()} at{" "}
                            {new Date(privacy.updatedAt).toLocaleTimeString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {!privacy.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(privacy._id)}
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(privacy)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!privacy.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                deleteConfirm === privacy._id
                                  ? "text-red-600 border-red-600"
                                  : "text-red-600"
                              }
                              onClick={() => handleDelete(privacy._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md bg-stone-50 p-4 max-h-[300px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-stone-700 font-sans">
                          {privacy.content.substring(0, 500)}
                          {privacy.content.length > 500 && "..."}
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
