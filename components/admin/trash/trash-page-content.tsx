"use client";

import * as React from "react";
import { toast } from "sonner";
import { Trash2, RotateCcw, AlertTriangle, Package, Tag, Layers, Sliders, Ticket, Star, Loader2, RefreshCw } from "lucide-react";
import axios from "@/utils/axios/axios";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/evo_dialog";

export type TrashEntityType = "product" | "brand" | "category" | "subcategory" | "coupon" | "review" | "user";

export interface TrashItemType {
    _id: string;
    entityType: TrashEntityType;
    originalId: string;
    entityLabel: string;
    deletedAt: string;
    expiresAt: string;
    deletedBy?: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

const ENTITY_LABELS: Record<TrashEntityType, string> = {
    product: "Product",
    brand: "Brand",
    category: "Category",
    subcategory: "Sub-Category",
    coupon: "Coupon",
    review: "Review",
    user: "User",
};

const ENTITY_ICONS: Record<TrashEntityType, React.ReactNode> = {
    product: <Package className="w-4 h-4" />,
    brand: <Tag className="w-4 h-4" />,
    category: <Layers className="w-4 h-4" />,
    subcategory: <Sliders className="w-4 h-4" />,
    coupon: <Ticket className="w-4 h-4" />,
    review: <Star className="w-4 h-4" />,
    user: <Tag className="w-4 h-4" />,
};

const ENTITY_COLORS: Record<TrashEntityType, string> = {
    product: "bg-blue-100 text-blue-700 border-blue-200",
    brand: "bg-purple-100 text-purple-700 border-purple-200",
    category: "bg-green-100 text-green-700 border-green-200",
    subcategory: "bg-teal-100 text-teal-700 border-teal-200",
    coupon: "bg-orange-100 text-orange-700 border-orange-200",
    review: "bg-yellow-100 text-yellow-700 border-yellow-200",
    user: "bg-red-100 text-red-700 border-red-200",
};

function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function formatExpiry(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Expired";
    if (days === 1) return "Expires tomorrow";
    return `Expires in ${days} days`;
}

export const TrashPageContent = () => {
    const [items, setItems] = React.useState<TrashItemType[]>([]);
    const [stats, setStats] = React.useState<{ total: number; byType: Record<string, number> }>({ total: 0, byType: {} });
    const [isLoading, setIsLoading] = React.useState(true);
    const [activeFilter, setActiveFilter] = React.useState<TrashEntityType | "all">("all");
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);

    // Restore state
    const [restoreTarget, setRestoreTarget] = React.useState<TrashItemType | null>(null);
    const [isRestoring, startRestoreTransition] = React.useTransition();

    // Permanent delete state
    const [deleteTarget, setDeleteTarget] = React.useState<TrashItemType | null>(null);
    const [isDeleting, startDeleteTransition] = React.useTransition();

    // Clear all state
    const [showClearConfirm, setShowClearConfirm] = React.useState(false);
    const [isClearing, setIsClearing] = React.useState(false);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "20");
            if (activeFilter !== "all") params.set("entityType", activeFilter);

            const [itemsRes, statsRes] = await Promise.all([
                axios.get(`/api/admin/trash?${params.toString()}`),
                axios.get(`/api/admin/trash/stats`),
            ]);

            setItems(itemsRes.data.data || []);
            setTotalPages(itemsRes.data.meta?.totalPages || 1);
            setStats(statsRes.data.data || { total: 0, byType: {} });
        } catch {
            toast.error("Failed to load trash items");
        } finally {
            setIsLoading(false);
        }
    }, [activeFilter, page]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRestore = (item: TrashItemType) => setRestoreTarget(item);

    const confirmRestore = () => {
        if (!restoreTarget) return;
        startRestoreTransition(async () => {
            try {
                const res = await axios.post(`/api/admin/trash/${restoreTarget._id}/restore`, {}, {
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                    withCredentials: true,
                });
                if (res.data.success) {
                    toast.success(`${ENTITY_LABELS[restoreTarget.entityType]} "${restoreTarget.entityLabel}" restored successfully`);
                    setRestoreTarget(null);
                    fetchData();
                }
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to restore item");
            }
        });
    };

    const handlePermanentDelete = (item: TrashItemType) => setDeleteTarget(item);

    const confirmPermanentDelete = () => {
        if (!deleteTarget) return;
        startDeleteTransition(async () => {
            try {
                const res = await axios.delete(`/api/admin/trash/${deleteTarget._id}`, {
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                    withCredentials: true,
                });
                if (res.data.success) {
                    toast.success(`Item permanently deleted`);
                    setDeleteTarget(null);
                    fetchData();
                }
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to delete item");
            }
        });
    };

    const handleClearTrash = async () => {
        setIsClearing(true);
        try {
            const params = activeFilter !== "all" ? `?entityType=${activeFilter}` : "";
            await axios.delete(`/api/admin/trash${params}`, {
                headers: { "X-Requested-With": "XMLHttpRequest" },
                withCredentials: true,
            });
            toast.success("Trash cleared successfully");
            setShowClearConfirm(false);
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to clear trash");
        } finally {
            setIsClearing(false);
        }
    };

    const filteredItems = items;
    const displayStats = stats.byType;

    return (
        <div className="w-full flex flex-col gap-6 font-inter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-stone-600" />
                        Trash
                        {stats.total > 0 && (
                            <span className="text-sm font-normal text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                                {stats.total} item{stats.total !== 1 ? "s" : ""}
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-stone-500 mt-0.5">
                        Deleted items are kept for 30 days before permanent removal.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchData}
                        disabled={isLoading}
                        className="gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    {stats.total > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowClearConfirm(true)}
                            className="gap-1.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {activeFilter === "all" ? "Empty Trash" : `Clear ${ENTITY_LABELS[activeFilter as TrashEntityType]}s`}
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {(Object.keys(ENTITY_LABELS) as TrashEntityType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => { setActiveFilter(type); setPage(1); }}
                        className={`p-3 rounded-lg border text-left transition-all ${activeFilter === type
                            ? "border-stone-900 bg-stone-50 shadow-sm"
                            : "border-stone-200 bg-white hover:border-stone-300"
                            }`}
                    >
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border mb-1.5 ${ENTITY_COLORS[type]}`}>
                            {ENTITY_ICONS[type]}
                            {ENTITY_LABELS[type]}
                        </div>
                        <div className="text-xl font-bold text-stone-900">
                            {displayStats[type] || 0}
                        </div>
                    </button>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => { setActiveFilter("all"); setPage(1); }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeFilter === "all"
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                >
                    All ({stats.total})
                </button>
                {(Object.keys(ENTITY_LABELS) as TrashEntityType[]).filter(t => (displayStats[t] || 0) > 0).map(type => (
                    <button
                        key={type}
                        onClick={() => { setActiveFilter(type); setPage(1); }}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${activeFilter === type
                            ? "bg-stone-900 text-white"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            }`}
                    >
                        {ENTITY_ICONS[type]}
                        {ENTITY_LABELS[type]}s ({displayStats[type]})
                    </button>
                ))}
            </div>

            {/* Items List */}
            <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                        <Trash2 className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-lg font-semibold text-stone-500">Trash is empty</p>
                        <p className="text-sm text-stone-400">
                            {activeFilter === "all"
                                ? "No deleted items found."
                                : `No deleted ${ENTITY_LABELS[activeFilter as TrashEntityType].toLowerCase()}s found.`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-stone-100">
                        {/* Table header */}
                        <div className="hidden sm:grid grid-cols-[1fr_140px_160px_140px] px-4 py-2.5 bg-stone-50 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                            <span>Item</span>
                            <span>Type</span>
                            <span>Deleted</span>
                            <span className="text-right">Actions</span>
                        </div>
                        {filteredItems.map((item) => (
                            <TrashItemRow
                                key={item._id}
                                item={item}
                                onRestore={handleRestore}
                                onDelete={handlePermanentDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                        Previous
                    </Button>
                    <span className="text-sm text-stone-600">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                        Next
                    </Button>
                </div>
            )}

            {/* Restore Confirmation Dialog */}
            <Dialog open={!!restoreTarget} onOpenChange={(open) => !open && setRestoreTarget(null)}>
                <DialogContent className="bg-stone-50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-green-600" />
                            Restore Item
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to restore{" "}
                            <span className="font-semibold text-stone-900">
                                &quot;{restoreTarget?.entityLabel}&quot;
                            </span>
                            ? It will be re-added to its original location.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:space-x-0">
                        <Button variant="outline" onClick={() => setRestoreTarget(null)} disabled={isRestoring}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmRestore}
                            disabled={isRestoring}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isRestoring ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                            Restore
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Permanent Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="bg-stone-50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Permanently Delete
                        </DialogTitle>
                        <DialogDescription>
                            This action <span className="font-semibold text-red-600">cannot be undone</span>. The item{" "}
                            <span className="font-semibold text-stone-900">
                                &quot;{deleteTarget?.entityLabel}&quot;
                            </span>{" "}
                            will be permanently deleted from the system.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:space-x-0">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmPermanentDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete Forever
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clear Trash Confirmation Dialog */}
            <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                <DialogContent className="bg-stone-50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            {activeFilter === "all" ? "Empty Trash" : `Clear All ${ENTITY_LABELS[activeFilter as TrashEntityType]}s`}
                        </DialogTitle>
                        <DialogDescription>
                            This will <span className="font-semibold text-red-600">permanently delete</span>{" "}
                            {activeFilter === "all"
                                ? `all ${stats.total} item${stats.total !== 1 ? "s" : ""} in the trash`
                                : `all ${ENTITY_LABELS[activeFilter as TrashEntityType].toLowerCase()}s in trash`
                            }. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:space-x-0">
                        <Button variant="outline" onClick={() => setShowClearConfirm(false)} disabled={isClearing}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleClearTrash} disabled={isClearing}>
                            {isClearing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Yes, Clear Trash
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const TrashItemRow = ({
    item,
    onRestore,
    onDelete,
}: {
    item: TrashItemType;
    onRestore: (item: TrashItemType) => void;
    onDelete: (item: TrashItemType) => void;
}) => {
    const expiryText = formatExpiry(item.expiresAt);
    const isExpiringSoon = new Date(item.expiresAt).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_160px_140px] px-4 py-3 hover:bg-stone-50 transition-colors items-center gap-2 sm:gap-0">
            {/* Label */}
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold text-stone-900 truncate">
                    {item.entityLabel}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                    {item.deletedBy && (
                        <span className="text-xs text-stone-400">
                            by {item.deletedBy.firstName} {item.deletedBy.lastName}
                        </span>
                    )}
                    <span className={`text-xs font-medium ${isExpiringSoon ? "text-red-500" : "text-stone-400"}`}>
                        {expiryText}
                    </span>
                </div>
            </div>

            {/* Type badge */}
            <div className="sm:block">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${ENTITY_COLORS[item.entityType]}`}>
                    {ENTITY_ICONS[item.entityType]}
                    {ENTITY_LABELS[item.entityType]}
                </span>
            </div>

            {/* Deleted time */}
            <div className="text-xs text-stone-500">
                {formatTimeAgo(item.deletedAt)}
                <span className="block text-stone-400 text-[11px]">
                    {new Date(item.deletedAt).toLocaleDateString()}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1.5">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRestore(item)}
                    className="h-8 gap-1 text-green-700 hover:text-green-800 hover:bg-green-50"
                    title="Restore item"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden md:inline text-xs">Restore</span>
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="h-8 p-0 w-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                    title="Delete permanently"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
};
