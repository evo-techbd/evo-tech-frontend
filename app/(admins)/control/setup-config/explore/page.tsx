import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
    title: "Explore Management",
    description: "Manage Explore Pages Content",
};

const exploreSections = [
    {
        title: "Shop & Shape Tomorrow",
        description: "Manage Shop & Shape Tomorrow page content",
        href: "/control/setup-config/explore/shop-shape-tomorrow",
    },
    {
        title: "Student Discount",
        description: "Manage Student Discount page content",
        href: "/control/setup-config/explore/student-discount",
    },
    {
        title: "FAQ Management",
        description: "Manage Frequently Asked Questions",
        href: "/control/setup-config/explore/faq",
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

const ExplorePage = async () => {
    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-6 gap-4 font-inter">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">Explore Management</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full mt-3 gap-4">
                {exploreSections.map((section, idx) => (
                    <SectionCard
                        key={`explore-section-${idx}`}
                        title={section.title}
                        description={section.description}
                        href={section.href}
                    />
                ))}
            </div>
        </div>
    );
};

export default ExplorePage;
