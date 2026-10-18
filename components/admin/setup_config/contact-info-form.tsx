"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "@/utils/axios/axios";
import { ContactInfo } from "@/lib/contact-info";

const PHONE_PATTERN = /^\+?[\d\s-]{6,20}$/;

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a full URL starting with https://")
  .or(z.literal(""));

const splitLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const contactFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  phones: z.string().superRefine((value, ctx) => {
    const phones = splitLines(value);
    if (!phones.length) {
      ctx.addIssue({
        code: "custom",
        message: "Add at least one phone number",
      });
    } else if (phones.length > 5) {
      ctx.addIssue({ code: "custom", message: "Add at most 5 phone numbers" });
    } else if (phones.some((phone) => !PHONE_PATTERN.test(phone))) {
      ctx.addIssue({
        code: "custom",
        message: "One of the numbers is invalid",
      });
    }
  }),
  whatsapp: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || PHONE_PATTERN.test(v),
      "Enter a valid phone number",
    ),
  address: z.string().trim().max(300),
  businessHours: z.string().trim().max(500),
  mapUrl: optionalUrl,
  facebook: optionalUrl,
  instagram: optionalUrl,
  linkedin: optionalUrl,
  youtube: optionalUrl,
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const toFormValues = (info: ContactInfo): ContactFormValues => ({
  ...info,
  phones: info.phones.join("\n"),
});

const SOCIAL_FIELDS: {
  name: keyof ContactFormValues;
  label: string;
  placeholder: string;
}[] = [
  {
    name: "facebook",
    label: "Facebook",
    placeholder: "https://www.facebook.com/...",
  },
  {
    name: "instagram",
    label: "Instagram",
    placeholder: "https://www.instagram.com/...",
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    placeholder: "https://www.linkedin.com/company/...",
  },
  {
    name: "youtube",
    label: "YouTube",
    placeholder: "https://www.youtube.com/@...",
  },
];

export function ContactInfoForm({ settings }: { settings: ContactInfo }) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: toFormValues(settings),
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const response = await axios.patch("/settings/contact", {
        ...values,
        phones: splitLines(values.phones),
      });
      toast.success(response?.data?.message ?? "Contact info updated");
      form.reset(toFormValues(response.data.data));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Something went wrong while saving contact info",
      );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact details</CardTitle>
            <CardDescription>
              Shown in the footer and on the Contact and Services pages. The
              first phone number is used for &quot;Call&quot; buttons.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Phone numbers
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} className="text-xs" />
                  </FormControl>
                  <FormDescription className="text-xs">
                    One per line, up to 5.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      WhatsApp number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="text-xs"
                        placeholder="+880 1XXX XXXXXX"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Leave empty to hide WhatsApp links.
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="text-xs" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shop location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} className="text-xs" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Business hours
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} className="text-xs" />
                  </FormControl>
                  <FormDescription className="text-xs">
                    One line per row as &quot;Days: Hours&quot;, e.g.
                    &quot;Friday: Closed&quot;.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mapUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Google Maps link
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="text-xs"
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Optional. Without it, &quot;Open in Google Maps&quot;
                    searches the address.
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Social media</CardTitle>
            <CardDescription>
              Leave a field empty to hide that link everywhere.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SOCIAL_FIELDS.map((item) => (
              <FormField
                key={item.name}
                control={form.control}
                name={item.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      {item.label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="text-xs"
                        placeholder={item.placeholder}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            ))}
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
