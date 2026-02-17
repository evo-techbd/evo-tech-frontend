"use client"

import * as React from "react"

import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

import { DataTableProps } from "@/utils/types_interfaces/data-table-props";


export function DataTable<TData, TValue>({
  data: initialData,
  columns,
  enableRowSelection = true,
  enableSelectedRowsCount,
  onDataChange,
  defaultPageSize,
  serverSidePagination,
}: DataTableProps<TData, TValue>) {

  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  
  // For client-side pagination
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: defaultPageSize ?? 10,
  })

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: serverSidePagination 
        ? { 
            pageIndex: serverSidePagination.currentPage - 1, // Convert 1-based to 0-based
            pageSize: serverSidePagination.pageSize ?? 10,
          }
        : pagination,
    },
    enableRowSelection: enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: serverSidePagination ? undefined : setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: serverSidePagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Server-side pagination configuration
    ...(serverSidePagination && {
      manualPagination: true,
      pageCount: serverSidePagination.pageCount,
    }),
  })

  return (
    <Tabs
      defaultValue="outline"
      className="flex w-full flex-col justify-start gap-6"
    >

      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto"
      >
        {/* table view */}
        <div className="relative overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="relative bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-stone-300">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-stone-300"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-stone-300">
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nothing found here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination 
          table={table} 
          enableSelectedRowsCount={enableSelectedRowsCount}
          serverSidePagination={serverSidePagination}
        />
      </TabsContent>
    </Tabs>
  )
}
