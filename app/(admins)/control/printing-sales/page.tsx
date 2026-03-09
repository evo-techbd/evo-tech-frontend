"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
import { Plus, Search, RotateCcw } from "lucide-react";
import axios from "@/utils/axios/axios";
import {
    printingSaleColumns,
    PrintingSaleType,
} from "./printing-sale-columns";
import { ServerSidePaginationProps } from "@/utils/types_interfaces/data-table-props";

export default function PrintingSalesPage() {
    const [sales, setSales] = useState<PrintingSaleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("all");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchSales = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get("/admin/printing-sales", {
                params: {
                    page: pageIndex + 1,
                    limit: pageSize,
                    search: search || undefined,
                    paymentStatus: paymentFilter !== "all" ? paymentFilter : undefined,
                },
            });
            setSales(res.data.data || []);
            setTotalItems(res.data.meta?.total || 0);
        } catch (error) {
            console.error("Error fetching printing sales:", error);
        } finally {
            setLoading(false);
        }
    }, [pageIndex, pageSize, search, paymentFilter]);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

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
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
                        3D Printing Sales
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage custom 3D printing & design sales
                    </p>
                </div>
                <Link href="/control/printing-sales/create">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        New Sale
                    </Button>
                </Link>
            </div>

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
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
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
                    columns={printingSaleColumns}
                    data={sales}
                    enableSelectedRowsCount={false}
                    serverSidePagination={serverSidePagination}
                />
            )}
        </div>
    );
}
