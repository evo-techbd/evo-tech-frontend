"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { PlusCircle, Trash2, Loader2, Palette } from "lucide-react";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/evo_dialog";
import axios from "@/utils/axios/axios";

// Types
interface ColorVariation {
  _id: string;
  colorName: string;
  colorCode: string;
  stock: number;
  sortOrder: number;
}

interface ItemInfo {
  itemid: string;
  itemname: string;
}

interface AddColorVariationsFormProps {
  itemInfo: ItemInfo;
  colorVariations?: ColorVariation[];
  onRefresh?: () => void;
}

// Schema
const colorVariationSchema = z.object({
  colorName: z.string().min(1, "Color name is required"),
  colorCode: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #FF0000)"),
  stock: z.coerce.number().min(0, "Stock must be 0 or greater"),
  sortOrder: z.coerce.number().min(0, "Sort order must be 0 or greater"),
});

type ColorVariationFormValues = z.infer<typeof colorVariationSchema>;

export function AddColorVariationsForm({
  itemInfo,
  colorVariations = [],
  onRefresh,
}: AddColorVariationsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deletingColorId, setDeletingColorId] = useState<string | null>(null);
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [uniqueColors, setUniqueColors] = useState<
    Array<{ colorName: string; colorCode: string }>
  >([]);
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  const form = useForm<ColorVariationFormValues>({
    resolver: zodResolver(colorVariationSchema),
    defaultValues: {
      colorName: "",
      colorCode: "#000000",
      stock: 0,
      sortOrder: colorVariations.length,
    },
  });

  // Fetch unique colors from database
  useEffect(() => {
    const fetchUniqueColors = async () => {
      try {
        const response = await axios.get("/api/products/colors/unique");
        if (response.data.success) {
          setUniqueColors(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching unique colors:", error);
      }
    };
    fetchUniqueColors();
  }, []);

  // Reset form to add mode
  const resetToAddMode = () => {
    setEditingColorId(null);
    form.reset({
      colorName: "",
      colorCode: "#000000",
      stock: 0,
      sortOrder: colorVariations.length,
    });
  };

  // Edit a color variation
  const startEditing = (color: ColorVariation) => {
    setEditingColorId(color._id);
    form.reset({
      colorName: color.colorName,
      colorCode: color.colorCode,
      stock: color.stock,
      sortOrder: color.sortOrder,
    });
  };

  // Add or Update Color Variation
  const handleSubmit = async (values: ColorVariationFormValues) => {
    setIsLoading(true);
    try {
      if (editingColorId) {
        // Update existing
        const response = await axios.put(
          `/api/products/color-variations/${editingColorId}`,
          values,
          { withCredentials: true }
        );

        if (response.data) {
          toast.success("Color variation updated successfully");
        }
      } else {
        // Add new
        const response = await axios.post(
          `/api/products/${itemInfo.itemid}/color-variations`,
          values,
          { withCredentials: true }
        );

        if (response.data) {
          toast.success("Color variation added successfully");
        }
      }

      resetToAddMode();
      onRefresh?.();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to save color variation";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Color Variation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [colorToDelete, setColorToDelete] = useState<string | null>(null);

  const handleDeleteColor = async () => {
    if (!colorToDelete) return;

    setDeletingColorId(colorToDelete);
    try {
      const response = await axios.delete(
        `/api/products/color-variations/${colorToDelete}`,
        { withCredentials: true }
      );

      if (response.data) {
        toast.success("Color variation deleted successfully");
        if (editingColorId === colorToDelete) {
          resetToAddMode();
        }
        onRefresh?.();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete color variation";
      toast.error(message);
    } finally {
      setDeletingColorId(null);
      setDeleteDialogOpen(false);
      setColorToDelete(null);
    }
  };

  // Calculate total stock from all color variations
  const totalColorStock = colorVariations.reduce((sum, c) => sum + c.stock, 0);

  // Select color from dropdown
  const selectExistingColor = (color: {
    colorName: string;
    colorCode: string;
  }) => {
    form.setValue("colorName", color.colorName);
    form.setValue("colorCode", color.colorCode);
    setShowColorDropdown(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Product Color Variations
        </CardTitle>
        <CardDescription className="space-y-1">
          <p>
            Add different color options with individual stock tracking. Total
            color stock:{" "}
            <span className="font-semibold text-primary">
              {totalColorStock}
            </span>
          </p>
          {uniqueColors.length > 0 && (
            <p className="text-xs text-muted-foreground">
              💡 Tip: {uniqueColors.length} colors available in database for
              quick selection
            </p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="colorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Name</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="e.g., Midnight Black" {...field} />
                      </FormControl>
                      {uniqueColors.length > 0 && !editingColorId && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setShowColorDropdown(!showColorDropdown)
                          }
                          title="Select from existing colors"
                        >
                          <Palette className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {showColorDropdown && uniqueColors.length > 0 && (
                      <div className="mt-2 p-2 border rounded-md max-h-48 overflow-y-auto space-y-1 bg-background">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Select existing color:
                        </p>
                        {uniqueColors.map((color, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectExistingColor(color)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-sm transition-colors text-left"
                          >
                            <div
                              className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                              style={
                                {
                                  backgroundColor: color.colorCode,
                                } as React.CSSProperties
                              }
                            />
                            <span className="text-sm font-medium">
                              {color.colorName}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {color.colorCode}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colorCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Code</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          {...field}
                          className="w-14 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          placeholder="#000000"
                          value={field.value}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (!val.startsWith("#")) {
                              val = "#" + val;
                            }
                            field.onChange(val);
                          }}
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
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
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingColorId ? (
                  "Update Color"
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Color
                  </>
                )}
              </Button>
              {editingColorId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetToAddMode}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Existing Color Variations */}
        {colorVariations.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-3">Existing Color Variations</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {colorVariations
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((color) => (
                  <div
                    key={color._id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      editingColorId === color._id
                        ? "border-primary bg-primary/5"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border shadow-sm"
                        style={
                          {
                            backgroundColor: color.colorCode,
                          } as React.CSSProperties
                        }
                      />
                      <div>
                        <p className="font-medium text-sm">{color.colorName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{color.colorCode}</span>
                          <span>•</span>
                          <span>Stock: {color.stock}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(color)}
                        className="h-8 w-8 p-0"
                      >
                        ✏️
                      </Button>
                      <Dialog
                        open={deleteDialogOpen && colorToDelete === color._id}
                        onOpenChange={(open) => {
                          setDeleteDialogOpen(open);
                          if (!open) setColorToDelete(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingColorId === color._id}
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setColorToDelete(color._id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            {deletingColorId === color._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Color?</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete {color.colorName}?
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDeleteDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteColor}
                              disabled={deletingColorId === color._id}
                            >
                              {deletingColorId === color._id && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
