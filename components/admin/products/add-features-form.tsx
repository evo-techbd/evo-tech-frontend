"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { PlusCircle, Trash2, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import axios from "@/utils/axios/axios";

// Types
interface FeaturesSectionHeader {
  _id: string;
  title: string;
  sortOrder: number;
  bannerImage?: string;
}

interface FeaturesSectionSubsection {
  _id: string;
  title: string;
  content?: string;
  imageUrl?: string;
  sortOrder: number;
}

interface ItemInfo {
  itemid: string;
  itemname: string;
}

interface AddFeaturesFormProps {
  itemInfo: ItemInfo;
  headers?: FeaturesSectionHeader[];
  subsections?: FeaturesSectionSubsection[];
  onRefresh?: () => void;
}

// Schemas
const headerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sortOrder: z.coerce.number().min(0, "Sort order must be 0 or greater"),
});

const subsectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  sortOrder: z.coerce.number().min(0, "Sort order must be 0 or greater"),
});

type HeaderFormValues = z.infer<typeof headerSchema>;
type SubsectionFormValues = z.infer<typeof subsectionSchema>;

export function AddProductFeaturesForm({
  itemInfo,
  headers = [],
  subsections = [],
  onRefresh,
}: AddFeaturesFormProps) {
  const [isHeaderLoading, setIsHeaderLoading] = useState(false);
  const [isSubsectionLoading, setIsSubsectionLoading] = useState(false);
  const [deletingHeaderId, setDeletingHeaderId] = useState<string | null>(null);
  const [deletingSubsectionId, setDeletingSubsectionId] = useState<
    string | null
  >(null);
  
  // Edit mode state for subsections
  const [editingSubsectionId, setEditingSubsectionId] = useState<string | null>(null);

  // Header banner image state
  const [headerBannerImage, setHeaderBannerImage] = useState<File | null>(null);
  const [headerBannerPreview, setHeaderBannerPreview] = useState<string | null>(null);

  // Subsection image state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Header form
  const headerForm = useForm<HeaderFormValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      title: "",
      sortOrder: headers.length,
    },
  });

  // Subsection form
  const subsectionForm = useForm<SubsectionFormValues>({
    resolver: zodResolver(subsectionSchema),
    defaultValues: {
      title: "",
      description: "",
      sortOrder: subsections.length,
    },
  });

  // Handle header banner image selection
  const handleHeaderBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeaderBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear header banner image
  const clearHeaderBanner = () => {
    setHeaderBannerImage(null);
    setHeaderBannerPreview(null);
  };

  // Handle subsection image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear subsection image selection
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Add Header with optional banner image
  const handleAddHeader = async (values: HeaderFormValues) => {
    setIsHeaderLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("sortOrder", values.sortOrder.toString());

      if (headerBannerImage) {
        formData.append("bannerImage", headerBannerImage);
      }

      const response = await axios.post(
        `/api/products/${itemInfo.itemid}/feature-headers`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Feature header added successfully");
        headerForm.reset({ title: "", sortOrder: headers.length + 1 });
        clearHeaderBanner();
        onRefresh?.();
      } else {
        throw new Error(response.data.message || "Failed to add header");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Failed to add header");
    } finally {
      setIsHeaderLoading(false);
    }
  };

  // Delete Header
  const handleDeleteHeader = async (headerId: string) => {
    setDeletingHeaderId(headerId);
    try {
      const response = await axios.delete(
        `/api/products/feature-headers/${headerId}`
      );

      if (response.data.success) {
        toast.success("Feature header deleted successfully");
        onRefresh?.();
      } else {
        throw new Error(response.data.message || "Failed to delete header");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Failed to delete header");
    } finally {
      setDeletingHeaderId(null);
    }
  };

  // Add Subsection
  const handleAddSubsection = async (values: SubsectionFormValues) => {
    setIsSubsectionLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("content", values.description);
      formData.append("sortOrder", values.sortOrder.toString());

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await axios.post(
        `/api/products/${itemInfo.itemid}/feature-subsections`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Feature subsection added successfully");
        subsectionForm.reset({
          title: "",
          description: "",
          sortOrder: subsections.length + 1,
        });
        clearImage();
        onRefresh?.();
      } else {
        throw new Error(response.data.message || "Failed to add subsection");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Failed to add subsection");
    } finally {
      setIsSubsectionLoading(false);
    }
  };

  // Delete Subsection
  const handleDeleteSubsection = async (subsectionId: string) => {
    setDeletingSubsectionId(subsectionId);
    try {
      const response = await axios.delete(
        `/api/products/feature-subsections/${subsectionId}`
      );

      if (response.data.success) {
        toast.success("Feature subsection deleted successfully");
        onRefresh?.();
      } else {
        throw new Error(response.data.message || "Failed to delete subsection");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Failed to delete subsection");
    } finally {
      setDeletingSubsectionId(null);
    }
  };

  // Edit Subsection - populate form with existing data
  const handleEditSubsection = (subsection: FeaturesSectionSubsection) => {
    setEditingSubsectionId(subsection._id);
    subsectionForm.reset({
      title: subsection.title,
      description: subsection.content || "",
      sortOrder: subsection.sortOrder,
    });
    
    // Set image preview if exists
    if (subsection.imageUrl) {
      setImagePreview(subsection.imageUrl);
    }
    
    // Scroll to form
    const formElement = document.getElementById("subsection-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Update Subsection
  const handleUpdateSubsection = async (data: SubsectionFormValues) => {
    if (!editingSubsectionId) return;
    
    setIsSubsectionLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.description);
      formData.append("sortOrder", data.sortOrder.toString());

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await axios.put(
        `/api/products/feature-subsections/${editingSubsectionId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Feature subsection updated successfully");
        subsectionForm.reset({
          title: "",
          description: "",
          sortOrder: subsections.length + 1,
        });
        clearImage();
        setEditingSubsectionId(null);
        onRefresh?.();
      } else {
        throw new Error(response.data.message || "Failed to update subsection");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Failed to update subsection");
    } finally {
      setIsSubsectionLoading(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSubsectionId(null);
    subsectionForm.reset({
      title: "",
      description: "",
      sortOrder: subsections.length + 1,
    });
    clearImage();
  };

  return (
    <div className="space-y-6">
      {/* Add Header Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Feature Section Header</CardTitle>
          <CardDescription>
            Create a header to group feature subsections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...headerForm}>
            <form
              onSubmit={headerForm.handleSubmit(handleAddHeader)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={headerForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Header Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Design & Build" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={headerForm.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Banner Image Upload */}
              <div className="space-y-2">
                <Label>Banner Image (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  This image will be displayed as a banner at the top of the features section.
                </p>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderBannerChange}
                    className="max-w-xs"
                  />
                  {headerBannerPreview && (
                    <div className="relative">
                      <Image
                        src={headerBannerPreview}
                        alt="Banner Preview"
                        width={120}
                        height={60}
                        unoptimized
                        className="h-16 w-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={clearHeaderBanner}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={isHeaderLoading}>
                {isHeaderLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Header
              </Button>
            </form>
          </Form>

          {/* Existing Headers */}
          {headers.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Existing Headers</h4>
              <div className="space-y-2">
                {headers
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((header) => (
                    <div
                      key={header._id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {header.bannerImage && (
                          <Image
                            src={header.bannerImage}
                            alt={`${header.title} banner`}
                            width={80}
                            height={40}
                            unoptimized
                            className="h-10 w-20 object-cover rounded"
                          />
                        )}
                        <div>
                          <span className="font-medium">{header.title}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            (Order: {header.sortOrder})
                          </span>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingHeaderId === header._id}
                          >
                            {deletingHeaderId === header._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Header?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will also delete all subsections under this
                              header. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteHeader(header._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Subsection Form */}
      <Card id="subsection-form">
        <CardHeader>
          <CardTitle className="text-lg">
            {editingSubsectionId ? "Update Feature Subsection" : "Add Feature Subsection"}
          </CardTitle>
          <CardDescription>
            {editingSubsectionId 
              ? "Update the feature subsection details" 
              : "Add detailed feature information under a header"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...subsectionForm}>
            <form
              onSubmit={subsectionForm.handleSubmit(
                editingSubsectionId ? handleUpdateSubsection : handleAddSubsection
              )}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={subsectionForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Advanced Print Quality"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={subsectionForm.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={subsectionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of this feature..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Feature Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="max-w-xs"
                  />
                  {imagePreview && (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={80}
                        height={80}
                        unoptimized
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={clearImage}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubsectionLoading || headers.length === 0}
                >
                  {isSubsectionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingSubsectionId ? (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Update Subsection
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Subsection
                    </>
                  )}
                </Button>
                {editingSubsectionId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSubsectionLoading}
                  >
                    Cancel
                  </Button>
                )}
              </div>
              {headers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Please add a header first before adding subsections.
                </p>
              )}
            </form>
          </Form>

          {/* Existing Subsections */}
          {subsections.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Existing Subsections</h4>
              <div className="space-y-3">
                {subsections
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((subsection) => (
                    <div
                      key={subsection._id}
                      className="flex items-start justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex gap-4 flex-1">
                        {subsection.imageUrl && (
                          <Image
                            src={subsection.imageUrl}
                            alt={subsection.title}
                            width={64}
                            height={64}
                            unoptimized
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {subsection.title}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {subsection.content}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            Order: {subsection.sortOrder}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSubsection(subsection)}
                          disabled={isSubsectionLoading || deletingSubsectionId === subsection._id}
                        >
                          {editingSubsectionId === subsection._id ? (
                            <>Editing...</>
                          ) : (
                            <>Edit</>
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deletingSubsectionId === subsection._id}
                            >
                              {deletingSubsectionId === subsection._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Subsection?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteSubsection(subsection._id)
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
