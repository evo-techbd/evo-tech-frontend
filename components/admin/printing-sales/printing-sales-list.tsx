"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import axios from "@/utils/axios/axios";
import {
    printingSaleColumns,
    PrintingSaleType,
} from "@/app/(admins)/control/printing-sales/printing-sale-columns";
import PrintingSaleTableRowActions from "@/app/(admins)/control/printing-sales/printing-sale-table-row-actions";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";
import { PrintingSaleViewModal } from "@/components/admin/printing-sales/printing-sale-view-modal";
import { PrintingSalePaymentStatusDropdown } from "@/components/admin/printing-sales/printing-sale-payment-status-dropdown";

interface PrintingSalesListProps {
    // When set, shows only the paid sales created in that month (archive view).
    // Otherwise shows active (not yet paid) sales.
    archive?: { year: number; month: number };
}

export function PrintingSalesList({ archive }: PrintingSalesListProps) {
    const [sales, setSales] = useState<PrintingSaleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedSale, setSelectedSale] = useState<PrintingSaleType | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const archiveYear = archive?.year;
    const archiveMonth = archive?.month;

    const fetchSales = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get("/admin/printing-sales", {
                params: {
                    page: pageIndex + 1,
                    limit: pageSize,
                    search: search || undefined,
                    paymentStatus:
                        !archiveYear && paymentFilter !== "all"
                            ? paymentFilter
                            : undefined,
                    year: archiveYear,
                    month: archiveMonth,
                },
            });
            setSales(res.data.data || []);
            setTotalItems(res.data.meta?.total || 0);
        } catch (error) {
            console.error("Error fetching printing sales:", error);
        } finally {
            setLoading(false);
        }
    }, [pageIndex, pageSize, search, paymentFilter, archiveYear, archiveMonth]);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const handleViewDetails = useCallback((sale: PrintingSaleType) => {
        setSelectedSale(sale);
        setIsViewOpen(true);
    }, []);

    const columnsWithRefetch = useMemo(
        () =>
            printingSaleColumns.map((col: any) => {
                const columnId = col.id || col.accessorKey;

                if (columnId === "actions") {
                    return {
                        ...col,
                        cell: ({ row }: any) => (
                            <PrintingSaleTableRowActions
                                row={row}
                                onDataChange={fetchSales}
                                onView={handleViewDetails}
                            />
                        ),
                    };
                }
                if (columnId === "paymentStatus") {
                    return {
                        ...col,
                        cell: ({ row }: any) => (
                            <PrintingSalePaymentStatusDropdown
                                saleId={row.original._id}
                                currentStatus={row.getValue("paymentStatus") as string || "pending"}
                                onDataChange={fetchSales}
                            />
                        ),
                    };
                }
                return col;
            }),
        [fetchSales, handleViewDetails],
    );

    const handleSearch = () => {
        setPageIndex(0);
        fetchSales();
    };

    const handleReset = () => {
        setSearch("");
        setPaymentFilter("all");
        setPageIndex(0);
    };

    const serverSidePagination: ServerSidePaginationProps = {
        totalRecords: totalItems,
        currentPage: pageIndex + 1,
        pageSize: pageSize,
        pageCount: Math.ceil(totalItems / pageSize) || 1,
        onPageChange: (page) => setPageIndex(page - 1),
        onPageSizeChange: (size) => {
            setPageSize(size);
            setPageIndex(0);
        },
        isLoading: loading,
    };

    return (
        <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone, email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pl-9"
                    />
                </div>
                {/* Archive is paid-only, and paid sales never show in the active list */}
                {!archive && (
                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Payment Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                <Button variant="outline" onClick={handleSearch}>
                    Filter
                </Button>
                <Button variant="ghost" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                </Button>
            </div>

            {/* Data Table */}
            {loading ? (
                <div className="h-64 flex justify-center items-center">
                    <div className="size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
                </div>
            ) : (
                <DataTable<PrintingSaleType, any>
                    columns={columnsWithRefetch}
                    data={sales}
                    enableSelectedRowsCount={false}
                    serverSidePagination={serverSidePagination}
                />
            )}

            <PrintingSaleViewModal
                sale={selectedSale}
                isOpen={isViewOpen}
                onClose={() => {
                    setIsViewOpen(false);
                    setSelectedSale(null);
                }}
            />
        </>
    );
}
