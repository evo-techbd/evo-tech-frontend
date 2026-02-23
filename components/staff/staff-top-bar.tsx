import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { StaffDynamicBreadcrumbs } from "./staff-dynamic-breadcrumbs";


const StaffTopBar = () => {
    return (
        <header className="sticky z-10 top-0 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 bg-stone-50 border-b">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <StaffDynamicBreadcrumbs />
            </div>
        </header>
    );
}

export { StaffTopBar };
