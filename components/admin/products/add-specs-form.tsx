"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
interface Specification {
  _id: string;
  title: string;
  value: string;
  sortOrder: number;
}

interface ItemInfo {
  itemid: string;
  itemname: string;
}

interface AddSpecsFormProps {
  itemInfo: ItemInfo;
  specifications?: Specification[];
  onRefresh?: () => void;
}

// Schema
const specificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  value: z.string().min(1, "Value is required"),
  sortOrder: z.coerce.number().min(0, "Sort order must be 0 or greater"),
});

type SpecificationFormValues = z.infer<typeof specificationSchema>;

export function AddProductSpecsForm({
  itemInfo,
  specifications = [],
  onRefresh,
}: AddSpecsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deletingSpecId, setDeletingSpecId] = useState<string | null>(null);

  const form = useForm<SpecificationFormValues>({
    resolver: zodResolver(specificationSchema),
    defaultValues: {
      title: "",
      value: "",
      sortOrder: specifications.length,
    },
  });

  // Add Specification
  const handleAddSpecification = async (values: SpecificationFormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `/api/products/${itemInfo.itemid}/specifications`,
        values
      );

      if (response.data.success) {
        toast.success("Specification added successfully");
        form.reset({
          title: "",
          value: "",
          sortOrder: specifications.length + 1,
        });
        onRefresh?.();
      } else {
        throw new Error(response.data.message || "Failed to add specification");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Failed to add specification");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Specification
  const handleDeleteSpecification = async (specId: string) => {
    setDeletingSpecId(specId);
    try {
      const response = await axios.delete(`/api/products/specifications/${specId}`);

      if (response.data.success) {
        toast.success("Specification deleted successfully");
        onRefresh?.();
      } else {
        throw new Error(response.data.message || "Failed to delete specification");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Failed to delete specification");
    } finally {
      setDeletingSpecId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Product Specifications</CardTitle>
        <CardDescription>
          Add technical specifications for this product (e.g., Build Volume:
          256×256×256 mm)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleAddSpecification)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Build Volume" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 256×256×256 mm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Specification
            </Button>
          </form>
        </Form>

        {/* Existing Specifications */}
        {specifications.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Existing Specifications</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Label</th>
                    <th className="text-left p-3 text-sm font-medium">Value</th>
                    <th className="text-center p-3 text-sm font-medium w-20">
                      Order
                    </th>
                    <th className="text-right p-3 text-sm font-medium w-20">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {specifications
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((spec, index) => (
                      <tr
                        key={spec._id}
                        className={
                          index % 2 === 0 ? "bg-background" : "bg-muted/50"
                        }
                      >
                        <td className="p-3 text-sm font-medium">
                          {spec.title}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {spec.value}
                        </td>
                        <td className="p-3 text-sm text-center">
                          {spec.sortOrder}
                        </td>
                        <td className="p-3 text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deletingSpecId === spec._id}
                              >
                                {deletingSpecId === spec._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Specification?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;
                                  {spec.title}&quot;? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteSpecification(spec._id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Backward compatibility export
export { AddProductSpecsForm as AddSpecsForm };
