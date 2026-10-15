import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Archive, Plus } from "lucide-react";
import { PrintingSalesList } from "@/components/admin/printing-sales/printing-sales-list";

export default function PrintingSalesPage() {
    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
                        3D Printing Sales
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage custom 3D printing & design sales. Paid sales move to the archive.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" className="whitespace-nowrap">
                        <Link href="/control/printing-sales/archive">
                            <Archive className="h-4 w-4 mr-1" />
                            Sales Archive
                        </Link>
                    </Button>
                    <Link href="/control/printing-sales/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            New Sale
                        </Button>
                    </Link>
                </div>
            </div>

            <PrintingSalesList />
        </div>
    );
}
