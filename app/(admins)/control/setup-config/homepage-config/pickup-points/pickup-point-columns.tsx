"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PickupPointDisplayType } from "@/schemas/admin/setupconfig/homepage/pickupPoint/pickupPointSchema";
import PickupPointTableRowActions from "@/components/admin/setup_config/homepage/comps/pickup-point-table-row-actions";

const updatedAtFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const getPickupPointColumns =
  (): ColumnDef<PickupPointDisplayType>[] => {
    return [
      {
        accessorKey: "name",
        header: () => <div className="text-left text-xs">Name</div>,
        cell: ({ row }) => (
          <div className="font-medium whitespace-nowrap text-xs">
            {row.getValue("name")}
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "address",
        header: () => <div className="text-left text-xs">Address</div>,
        cell: ({ row }) => (
          <div className="text-left font-[500] text-xs max-w-[300px]">
            {row.getValue("address")}
          </div>
        ),
      },
      {
        accessorKey: "city",
        header: () => <div className="text-left text-xs">City</div>,
        cell: ({ row }) => {
          const city = row.getValue("city") as string | null | undefined;
          return (
            <div className="text-left font-[500] whitespace-nowrap text-xs">
              {city || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: () => <div className="text-left text-xs">Phone</div>,
        cell: ({ row }) => {
          const phone = row.getValue("phone") as string | null | undefined;
          return (
            <div className="text-left font-[500] whitespace-nowrap text-xs">
              {phone || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "hours",
        header: () => <div className="text-left text-xs">Hours</div>,
        cell: ({ row }) => {
          const hours = row.getValue("hours") as string | null | undefined;
          return (
            <div className="text-left font-[500] whitespace-nowrap text-xs">
              {hours || "-"}
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
        accessorKey: "isActive",
        header: () => <div className="text-center text-xs">Status</div>,
        cell: ({ row }) => {
          const isActive = row.getValue("isActive") as boolean;
          return (
            <div className="text-center text-xs">
              <span
                className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                  isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
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
          return <PickupPointTableRowActions row={row} />;
        },
      },
    ];
  };
