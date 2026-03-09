import type { Metadata } from "next";
import { TrashPageContent } from "@/components/admin/trash/trash-page-content";

export const metadata: Metadata = {
    title: "Trash",
};

const TrashPage = () => {
    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            <TrashPageContent />
        </div>
    );
};

export default TrashPage;
