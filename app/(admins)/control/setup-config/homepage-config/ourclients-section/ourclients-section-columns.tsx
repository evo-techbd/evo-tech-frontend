"use client";

import { ColumnDef } from "@tanstack/react-table";
import { OurClientsDisplayType } from "@/schemas/admin/setupconfig/homepage/ourClientsSection/ourClientsSchema";
import OurClientsTableRowActions from "@/components/admin/setup_config/homepage/comps/ourclients-section-table-row-actions";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const getOurClientsColumns = (): ColumnDef<OurClientsDisplayType>[] => {
  return [
    {
      accessorKey: "brand_name",
      header: () => <div className="text-left text-xs">Brand</div>,
      cell: ({ row }) => {
        const brandName = row.getValue("brand_name") as string;
        const brandLogo = row.original.brand_logosrc;
        const brandDescription = row.original.brand_description;
        return (
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={brandLogo}
                alt={`${brandName} logo`}
                fill
                sizes="32px"
                className="object-contain rounded"
                priority
              />
            </div>
            <div className="flex flex-col max-w-[200px]">
              <span className="font-medium whitespace-nowrap text-xs truncate">
                {brandName}
              </span>
              {brandDescription ? (
                <span className="text-[10px] text-stone-500 leading-4 line-clamp-2">
                  {brandDescription}
                </span>
              ) : null}
            </div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "brand_url",
      header: () => <div className="text-left text-xs">Brand URL</div>,
      cell: ({ row }) => {
        const brandUrl = row.getValue("brand_url") as string | null;
        return (
          <div className="text-left font-[500] whitespace-nowrap truncate text-xs max-w-48">
            {brandUrl ? (
              <a
                href={brandUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-evoAdminAccent hover:text-evoAdminAccent/80 hover:underline"
              >
                {brandUrl}
              </a>
            ) : (
              "-"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: () => <div className="text-center text-xs">Status</div>,
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <div className="text-center">
            <Badge
              variant={isActive ? "success" : "failed"}
              className="text-xs font-medium"
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "sortorder",
      header: () => <div className="text-center text-xs">Sort Order</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center text-xs">{row.getValue("sortorder")}</div>
        );
      },
    },
    {
      accessorKey: "last_modified_at",
      header: () => <div className="text-center text-xs">Last Modified</div>,
      cell: ({ row }) => {
        const lastModified = row.getValue("last_modified_at") as string; // already formatted in the backend
        return (
          <div className="text-center text-xs whitespace-nowrap">
            {lastModified}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return <OurClientsTableRowActions row={row} />;
      },
    },
  ];
};
