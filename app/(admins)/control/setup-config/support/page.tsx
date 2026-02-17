import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Support Management",
    description: "Manage Support Pages Content",
};

const supportSections = [
    {
        title: "Terms & Conditions",
        description: "Manage Terms & Conditions content of the website",
        href: "/control/setup-config/support/terms",
    },
    {
        title: "Privacy Policy",
        description: "Manage Privacy Policy content of the website",
        href: "/control/setup-config/support/privacy-policy",
    },
    {
        title: "Warranty Policy",
        description: "Manage Warranty Policy content of the website",
        href: "/control/setup-config/support/warranty-policy",
    },
    {
        title: "Shipping & Return Policy",
        description: "Manage Shipping & Return Policy content of the website",
        href: "/control/setup-config/support/shipping-return-policy",
    },
];

interface SectionCardProps {
    title: string;
    description: string;
    href: string;
}

const SectionCard = ({ title, description, href }: SectionCardProps) => {
    return (
        <Link href={href}>
            <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-stone-500 text-xs">{description}</div>
                </CardContent>
            </Card>
        </Link>
    );
};

const SupportPage = async () => {
    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-6 gap-4 font-inter">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">Support Management</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full mt-3 gap-4">
                {supportSections.map((section, idx) => (
                    <SectionCard
                        key={`support-section-${idx}`}
                        title={section.title}
                        description={section.description}
                        href={section.href}
                    />
                ))}
            </div>
        </div>
    );
};

export default SupportPage;
