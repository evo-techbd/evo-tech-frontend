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

interface WarrantyData {
  _id: string;
  content: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const warrantySchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters long"),
  version: z.string().optional(),
});

type WarrantyFormValues = z.infer<typeof warrantySchema>;

export function WarrantyManagement() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [warrantyData, setWarrantyData] = useState<WarrantyData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const token = getAuthCookie();

  const form = useForm<WarrantyFormValues>({
    resolver: zodResolver(warrantySchema),
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
        url, // relative path, e.g. "/warranty"
        data,
      });
    },
    []
  );

  // Fetch warranty data on component mount
  React.useEffect(() => {
    const fetchWarranty = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await makeAuthRequest("GET", "/warranty");
        setWarrantyData(response.data.data || []);
      } catch (error: any) {
        console.error("Failed to fetch warranty:", error);
        toast.error("Failed to load warranty information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarranty();
  }, [makeAuthRequest, token]);

  const refetchWarranty = async () => {
    try {
      const response = await makeAuthRequest("GET", "/warranty");
      setWarrantyData(response.data.data || []);
    } catch (error: any) {
      console.error("Failed to fetch warranty:", error);
    }
  };

  const onSubmit = async (data: WarrantyFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await makeAuthRequest("PATCH", `/warranty/${editingId}`, data);
        toast.success("Warranty information updated successfully");
      } else {
        await makeAuthRequest("POST", "/warranty", data);
        toast.success("Warranty information created successfully");
      }

      form.reset();
      setEditingId(null);
      setShowForm(false);
      await refetchWarranty();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save warranty information"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (warranty: WarrantyData) => {
    setEditingId(warranty._id);
    form.setValue("content", warranty.content);
    form.setValue("version", warranty.version);
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
      await makeAuthRequest("DELETE", `/warranty/${id}`);
      toast.success("Warranty information deleted successfully");
      setDeleteConfirm(null);
      await refetchWarranty();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete warranty information"
      );
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await makeAuthRequest("PATCH", `/warranty/${id}`, { isActive: true });
      toast.success("Warranty information activated successfully");
      await refetchWarranty();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to activate warranty information"
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
                  {editingId ? "Update" : "Create New"} Warranty Information
                </CardTitle>
                <CardDescription>
                  {editingId
                    ? "Update the existing warranty information"
                    : "Create a new version of warranty information. This will become the active version."}
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
                              placeholder="Enter the warranty information content..."
                              className="min-h-[400px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the full warranty information. You can use
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

          {/* Warranty History Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Warranty Information History
            </h3>
            {warrantyData.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-stone-500">
                  No warranty information found. Create one to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {warrantyData.map((warranty) => (
                  <Card key={warranty._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">
                              Version {warranty.version}
                            </CardTitle>
                            {warranty.isActive && (
                              <Badge variant="default" className="bg-green-500">
                                <Check className="mr-1 h-3 w-3" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            Last updated:{" "}
                            {new Date(warranty.updatedAt).toLocaleDateString()} at{" "}
                            {new Date(warranty.updatedAt).toLocaleTimeString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {!warranty.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivate(warranty._id)}
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(warranty)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!warranty.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                deleteConfirm === warranty._id
                                  ? "text-red-600 border-red-600"
                                  : "text-red-600"
                              }
                              onClick={() => handleDelete(warranty._id)}
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
                          {warranty.content.substring(0, 500)}
                          {warranty.content.length > 500 && "..."}
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
