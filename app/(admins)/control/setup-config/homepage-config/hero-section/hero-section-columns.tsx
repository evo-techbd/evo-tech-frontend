"use client";

import { ColumnDef } from "@tanstack/react-table";
import { HeroSectionDisplayType } from "@/schemas/admin/setupconfig/homepage/heroSection/heroSchema";
import HeroSectionTableRowActions from "@/components/admin/setup_config/homepage/comps/hero-section-table-row-actions";

const updatedAtFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const getHeroSectionColumns =
  (): ColumnDef<HeroSectionDisplayType>[] => {
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
        accessorKey: "subtitle",
        header: () => <div className="text-left text-xs">Subtitle</div>,
        cell: ({ row }) => {
          const subtitle = row.getValue("subtitle") as
            | string
            | null
            | undefined;
          return (
            <div className="text-left font-[500] whitespace-nowrap truncate text-xs">
              {subtitle || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: () => <div className="text-left text-xs">Description</div>,
        cell: ({ row }) => {
          const description = row.getValue("description") as
            | string
            | null
            | undefined;
          return (
            <div className="text-left font-[500] whitespace-nowrap truncate text-xs max-w-[240px]">
              {description || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "button_text",
        header: () => <div className="text-left text-xs">Button Text</div>,
        cell: ({ row }) => {
          const buttonText = row.getValue("button_text") as string | null;
          return (
            <div className="text-left font-[500] whitespace-nowrap truncate text-xs">
              {buttonText || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "button_url",
        header: () => <div className="text-left text-xs">Button URL</div>,
        cell: ({ row }) => {
          const buttonURL = row.getValue("button_url") as string | null;
          return (
            <div className="text-left font-[500] whitespace-nowrap truncate text-xs">
              {buttonURL || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "sortOrder",
        header: () => <div className="text-center text-xs">Sort Order</div>,
        cell: ({ row }) => {
          return (
            <div className="text-center text-xs">
              {row.getValue("sortOrder") as number}
            </div>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: () => <div className="text-center text-xs">Last Modified</div>,
        cell: ({ row }) => {
          const updatedAt = row.getValue("updatedAt") as string | undefined;
          const formattedDate = updatedAt
            ? updatedAtFormatter.format(new Date(updatedAt))
            : "-";
          return (
            <div className="text-center text-xs whitespace-nowrap">
              {formattedDate}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return <HeroSectionTableRowActions row={row} />;
        },
      },
    ];
  };
