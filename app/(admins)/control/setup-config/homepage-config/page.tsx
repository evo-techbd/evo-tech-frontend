import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomePageSectionsForAdmin } from "@/dal/staticdata/admin-homepage-sections";

export const metadata: Metadata = {
    title: "Home Page Config",
    description: "Manage Home Page Content",
};

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


const HomepageConfigPage = async () => {

    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-6 gap-4 font-inter">
            <div className="flex flex-col gap-4">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">Home Page Config</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full mt-3 gap-4">
                {
                    HomePageSectionsForAdmin.map((section, idx) => (
                        <SectionCard
                            key={`sections-hp-${idx}`}
                            title={section.title}
                            description={section.description}
                            href={section.href}
                        />
                    ))
                }
            </div>
        </div>
    );
}

export default HomepageConfigPage;
