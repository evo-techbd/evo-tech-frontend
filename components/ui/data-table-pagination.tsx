import { Table } from "@tanstack/react-table";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/all_utils";
import { Label } from "@/components/ui/label";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";

interface DataTablePaginationProps<TData> {
    table: Table<TData>
    enableSelectedRowsCount?: boolean
    serverSidePagination?: ServerSidePaginationProps
}

export function DataTablePagination<TData>({
    table,
    enableSelectedRowsCount = true,
    serverSidePagination,
}: DataTablePaginationProps<TData>) {


    return (
        <div className={cn("flex items-center px-4",
            (enableSelectedRowsCount ? "justify-between" : "justify-end"),
        )}>

            {
                enableSelectedRowsCount &&
                (<div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                    {serverSidePagination ? (
                        `${table.getFilteredSelectedRowModel().rows.length} of ${serverSidePagination.totalRecords} row(s) selected.`
                    ) : (
                        `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
                    )}
                </div>)
            }

            <div className="flex w-full items-center gap-8 lg:w-fit py-1">
                <div className="hidden items-center gap-2 lg:flex">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium pointer-events-none">Rows</Label>
                    <Select
                        name="rows-per-page"
                        value={serverSidePagination ? `${serverSidePagination.pageSize}` : `${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            if (serverSidePagination) {
                                serverSidePagination.onPageSizeChange(Number(value));
                            } else {
                                table.setPageSize(Number(value))
                            }
                        }}
                        disabled={serverSidePagination?.isLoading}
                    >
                        <SelectTrigger className="w-20" id="rows-per-page">
                            <SelectValue
                                placeholder={serverSidePagination ? serverSidePagination.pageSize : table.getState().pagination.pageSize}
                            />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={`pagesize-${pageSize}`} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex w-fit items-center justify-center text-sm font-medium">
                    Page {serverSidePagination ? serverSidePagination.currentPage : table.getState().pagination.pageIndex + 1}{"/"}
                    {serverSidePagination ? serverSidePagination.pageCount : table.getPageCount()}
                </div>

                {/* pagination buttons */}
                <div className="ml-auto flex items-center gap-1 lg:ml-0">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => {
                            if (serverSidePagination) {
                                serverSidePagination.onPageChange(1);
                            } else {
                                table.setPageIndex(0);
                            }
                        }}
                        disabled={
                            (serverSidePagination?.isLoading) || 
                            (serverSidePagination ? serverSidePagination.currentPage === 1 : !table.getCanPreviousPage())
                        }
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeftIcon />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => {
                            if (serverSidePagination) {
                                serverSidePagination.onPageChange(serverSidePagination.currentPage - 1);
                            } else {
                                table.previousPage();
                            }
                        }}
                        disabled={
                            (serverSidePagination?.isLoading) || 
                            (serverSidePagination ? serverSidePagination.currentPage === 1 : !table.getCanPreviousPage())
                        }
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeftIcon />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => {
                            if (serverSidePagination) {
                                serverSidePagination.onPageChange(serverSidePagination.currentPage + 1);
                            } else {
                                table.nextPage();
                            }
                        }}
                        disabled={
                            (serverSidePagination?.isLoading) || 
                            (serverSidePagination ? serverSidePagination.currentPage === serverSidePagination.pageCount : !table.getCanNextPage())
                        }
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRightIcon />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() => {
                            if (serverSidePagination) {
                                serverSidePagination.onPageChange(serverSidePagination.pageCount);
                            } else {
                                table.setPageIndex(table.getPageCount() - 1);
                            }
                        }}
                        disabled={
                            (serverSidePagination?.isLoading) || 
                            (serverSidePagination ? serverSidePagination.currentPage === serverSidePagination.pageCount : !table.getCanNextPage())
                        }
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRightIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
}
