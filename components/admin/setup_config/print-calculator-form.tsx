"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "@/utils/axios/axios";
import { PrintMaterial } from "@/lib/print3d/types";

const amount = z.coerce
  .number({ invalid_type_error: "Enter a valid amount" })
  .min(0, "Cannot be negative");

const pricingFormSchema = z.object({
  materials: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Name is required"),
        fullName: z.string().trim(),
        description: z.string().trim(),
        density: z.coerce
          .number({ invalid_type_error: "Enter a valid density" })
          .min(0.1, "At least 0.1 g/cm³"),
        pricePerGram: amount,
        colors: z
          .string()
          .refine(
            (v) => v.split(",").some((c) => c.trim()),
            "Add at least one color",
          ),
        isActive: z.boolean(),
      }),
    )
    .min(1, "Add at least one material")
    .refine(
      (materials) =>
        new Set(materials.map((m) => m.name.trim().toLowerCase())).size ===
        materials.length,
      "Material names must be unique",
    ),
  machineRatePerHour: amount,
  setupFee: amount,
  minimumCharge: amount,
});

type PricingFormValues = z.infer<typeof pricingFormSchema>;

export interface PrintPricingSettings {
  materials: PrintMaterial[];
  machineRatePerHour: number;
  setupFee: number;
  minimumCharge: number;
}

const toFormValues = (settings: PrintPricingSettings): PricingFormValues => ({
  materials: settings.materials.map((m) => ({
    name: m.name,
    fullName: m.fullName ?? "",
    description: m.description ?? "",
    density: m.density,
    pricePerGram: m.pricePerGram,
    colors: m.colors.join(", "),
    isActive: m.isActive,
  })),
  machineRatePerHour: settings.machineRatePerHour,
  setupFee: settings.setupFee,
  minimumCharge: settings.minimumCharge,
});

export function PrintCalculatorForm({
  settings,
}: {
  settings: PrintPricingSettings;
}) {
  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: toFormValues(settings),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "materials",
  });

  const onSubmit = async (values: PricingFormValues) => {
    const payload = {
      ...values,
      materials: values.materials.map((m) => ({
        ...m,
        name: m.name.trim(),
        colors: Array.from(
          new Set(
            m.colors
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean),
          ),
        ),
      })),
    };

    try {
      const response = await axios.patch("/print-pricing", payload);
      toast.success(response?.data?.message ?? "Pricing updated");
      form.reset(toFormValues(response.data.data));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Something went wrong while saving pricing",
      );
    }
  };

  const materialsError =
    form.formState.errors.materials?.root?.message ??
    form.formState.errors.materials?.message;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 max-w-3xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Materials</CardTitle>
            <CardDescription>
              Price per piece = weight × price per gram + print hours × machine
              rate. Weight is estimated from the model volume, infill and walls
              using the material density.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-stone-200 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <FormField
                    control={form.control}
                    name={`materials.${index}.isActive`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-medium">
                          {field.value ? "Offered to customers" : "Hidden"}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <FormField
                    control={form.control}
                    name={`materials.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="text-xs"
                            placeholder="PLA"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`materials.${index}.fullName`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3">
                        <FormLabel className="text-xs font-medium">
                          Full name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="text-xs"
                            placeholder="Polylactic Acid"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`materials.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="text-xs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name={`materials.${index}.pricePerGram`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Price per gram (BDT)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            className="text-xs"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`materials.${index}.density`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Density (g/cm³)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0.1"
                            step="0.01"
                            {...field}
                            className="text-xs"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          PLA 1.24 · ABS 1.04 · PETG 1.27 · TPU 1.21
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`materials.${index}.colors`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        Colors
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="text-xs"
                          placeholder="White, Black, Red"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Comma separated, in the order customers should see them.
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            {materialsError && (
              <p className="text-xs font-medium text-destructive">
                {materialsError}
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() =>
                append({
                  name: "",
                  fullName: "",
                  description: "",
                  density: 1.24,
                  pricePerGram: 0,
                  colors: "",
                  isActive: true,
                })
              }
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add material
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order charges</CardTitle>
            <CardDescription>
              Leave at 0 to disable. All amounts in BDT.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="machineRatePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Machine rate / hour
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Makes finer layer heights cost more.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="setupFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Setup fee / order
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minimumCharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Minimum order charge
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...field}
                      className="text-xs"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="text-xs w-fit"
        >
          {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
