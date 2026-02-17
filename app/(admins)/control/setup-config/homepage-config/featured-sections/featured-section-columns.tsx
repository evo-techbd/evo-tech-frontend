"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FeaturedSectionDisplayType } from "@/schemas/admin/setupconfig/homepage/featuredSections/featuredSchema";
import FeaturedSectionTableRowActions from "@/components/admin/setup_config/homepage/comps/featured-section-table-row-actions";

export const getFeaturedSectionColumns =
  (): ColumnDef<FeaturedSectionDisplayType>[] => {
    return [
      {
        accessorKey: "title",
        header: () => <div className="text-left text-xs">Title</div>,
        cell: ({ row }) => (
          <div className="font-medium whitespace-nowrap text-xs">
            {row.getValue("title")}
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "view_more_url",
        header: () => <div className="text-left text-xs">View More URL</div>,
        cell: ({ row }) => {
          const url = row.getValue("view_more_url") as string;
          // Display the actual slug/path instead of ID
          const displayText = url ? url : "—";
          return (
            <div
              className="text-left font-[500] whitespace-nowrap truncate text-xs"
              title={url}
            >
              {displayText}
            </div>
          );
        },
      },
      {
        accessorKey: "sortorder",
        header: () => <div className="text-center text-xs">Sort Order</div>,
        cell: ({ row }) => {
          return (
            <div className="text-center text-xs">
              {row.getValue("sortorder")}
            </div>
          );
        },
      },
      {
        accessorKey: "items_count",
        header: () => <div className="text-center text-xs">Items Count</div>,
        cell: ({ row }) => {
          return (
            <div className="text-center text-xs">
              {row.getValue("items_count")}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return <FeaturedSectionTableRowActions row={row} />;
        },
      },
    ];
  };
