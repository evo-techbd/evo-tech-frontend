import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AdminDynamicBreadcrumbs } from "@/components/admin/admin-dynamic-breadcrumbs";


const AdminTopBar = () => {
    return (
        <header className="sticky z-10 top-0 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 bg-stone-50 border-b">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <AdminDynamicBreadcrumbs />
            </div>
        </header>
    );
}

export { AdminTopBar };
