"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { PlusCircle, Trash2, Loader2, Star, Edit2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/evo_dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import axios from "@/utils/axios/axios";

// Types
interface Review {
  _id: string;
  userName: string;
  userImage?: string;
  rating: number;
  reviewText: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface ItemInfo {
  itemid: string;
  itemname: string;
}

interface AddReviewsFormProps {
  itemInfo: ItemInfo;
  reviews?: Review[];
  onRefresh?: () => void;
}

// Schema
const reviewSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  rating: z.coerce.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  reviewText: z.string().min(10, "Review text must be at least 10 characters"),
  isVerifiedPurchase: z.boolean().default(false),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export function AddReviewsForm({
  itemInfo,
  reviews = [],
  onRefresh,
}: AddReviewsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      userName: "",
      rating: 5,
      reviewText: "",
      isVerifiedPurchase: false,
    },
  });

  // Load review data for editing
  useEffect(() => {
    if (editingReviewId) {
      const reviewToEdit = reviews.find((r) => r._id === editingReviewId);
      if (reviewToEdit) {
        form.reset({
          userName: reviewToEdit.userName,
          rating: reviewToEdit.rating,
          reviewText: reviewToEdit.reviewText,
          isVerifiedPurchase: reviewToEdit.isVerifiedPurchase,
        });
        setEditingImageUrl(reviewToEdit.userImage || null);
      }
    }
  }, [editingReviewId, reviews, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setEditingImageUrl(null);
  };

  const onSubmit = async (data: ReviewFormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("userName", data.userName);
      formData.append("rating", data.rating.toString());
      formData.append("reviewText", data.reviewText);
      formData.append("isVerifiedPurchase", data.isVerifiedPurchase.toString());
      
      if (imageFile) {
        formData.append("userImage", imageFile);
      }

      if (editingReviewId) {
        // Update existing review
        await axios.put(`/reviews/${editingReviewId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Review updated successfully");
      } else {
        // Add new review
        await axios.post(
          `/products/${itemInfo.itemid}/reviews`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Review added successfully");
      }

      form.reset();
      setImageFile(null);
      setImagePreview(null);
      setEditingImageUrl(null);
      setEditingReviewId(null);
      setIsDialogOpen(false);
      onRefresh?.();
    } catch (error: any) {
      console.error("Error saving review:", error);
      toast.error(
        error.response?.data?.message || "Failed to save review"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setDeletingReviewId(reviewId);
    try {
      await axios.delete(`/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      onRefresh?.();
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete review"
      );
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReviewId(review._id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReviewId(null);
    setImageFile(null);
    setImagePreview(null);
    setEditingImageUrl(null);
    form.reset();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Reviews
            </CardTitle>
            <CardDescription>
              Manage reviews for {itemInfo.itemname}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setEditingReviewId(null);
                  form.reset();
                  setImageFile(null);
                  setImagePreview(null);
                  setEditingImageUrl(null);
                }}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle>
                  {editingReviewId ? "Edit Review" : "Add New Review"}
                </DialogTitle>
                <DialogDescription>
                  {editingReviewId
                    ? "Update the review details below"
                    : "Create a new review for this product"}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="userImage">User Image (Optional)</Label>
                    <div className="flex gap-4 items-start">
                      <Input
                        id="userImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1"
                      />
                      {(imagePreview || editingImageUrl) && (
                        <div className="relative">
                          <Image
                            src={imagePreview || editingImageUrl || ""}
                            alt="Preview"
                            width={64}
                            height={64}
                            unoptimized
                            className="w-16 h-16 object-cover rounded-full border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 w-6 h-6"
                            onClick={handleRemoveImage}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <FormDescription>
                      Upload a profile picture for the reviewer
                    </FormDescription>
                  </div>

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value?.toString()}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rating" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                <div className="flex items-center gap-2">
                                  {renderStars(rating)}
                                  <span>({rating} {rating === 1 ? 'star' : 'stars'})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reviewText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Text</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write the review here..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isVerifiedPurchase"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Verified Purchase</FormLabel>
                          <FormDescription>
                            Mark this review as from a verified purchase
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingReviewId ? "Update" : "Add"} Review
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No reviews yet. Add your first review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review._id} className="border-l-4 border-l-yellow-400">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {review.userImage && (
                      <Image
                        src={review.userImage}
                        alt={review.userName}
                        width={48}
                        height={48}
                        unoptimized
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    )}
                    {!review.userImage && (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{review.userName}</p>
                            {review.isVerifiedPurchase && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(review)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(review._id)}
                            disabled={deletingReviewId === review._id}
                          >
                            {deletingReviewId === review._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.reviewText}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
