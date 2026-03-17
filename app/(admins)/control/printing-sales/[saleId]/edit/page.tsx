"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "@/utils/axios/axios";
import { toast } from "sonner";

interface LineItem {
    productName: string;
    unitPrice: number;
    quantity: number;
}

const BANGLADESH_CITIES = [
    "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet",
    "Rangpur", "Barisal", "Mymensingh", "Comilla", "Gazipur",
    "Narayanganj", "Bogra", "Cox's Bazar", "Jessore", "Dinajpur",
];

export default function EditPrintingSalePage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Customer info
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("Bangladesh");
    const [notes, setNotes] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "cancelled">("pending");

    // Line items
    const [items, setItems] = useState<LineItem[]>([
        { productName: "", unitPrice: 0, quantity: 1 },
    ]);

    const fetchSale = useCallback(async () => {
        try {
            setFetching(true);
            const res = await axios.get(`/admin/printing-sales/${params.saleId}`);
            const sale = res.data.data;
            
            setCustomerName(sale.customerName || "");
            setPhone(sale.phone || "");
            setEmail(sale.email || "");
            setAddress(sale.address || "");
            setCity(sale.city || "");
            setCountry(sale.country || "Bangladesh");
            setNotes(sale.notes || "");
            setPaymentStatus(sale.paymentStatus || "pending");
            
            if (sale.items && sale.items.length > 0) {
                setItems(sale.items.map((item: any) => ({
                    productName: item.productName,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                })));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load sale details");
            router.push("/control/printing-sales");
        } finally {
            setFetching(false);
        }
    }, [params.saleId, router]);

    useEffect(() => {
        fetchSale();
    }, [fetchSale]);

    const addItem = () => {
        setItems([...items, { productName: "", unitPrice: 0, quantity: 1 }]);
    };

    const removeItem = (index: number) => {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
        const updated = [...items];
        if (field === "productName") {
            updated[index].productName = value as string;
        } else {
            updated[index][field] = Number(value) || 0;
        }
        setItems(updated);
    };

    const getLineTotal = (item: LineItem) => item.unitPrice * item.quantity;
    const grandTotal = items.reduce((sum, item) => sum + getLineTotal(item), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!customerName.trim()) return toast.error("Customer name is required");
        if (!phone.trim()) return toast.error("Phone number is required");
        if (!address.trim()) return toast.error("Address is required");
        if (!city) return toast.error("City is required");
        if (items.some((item) => !item.productName.trim()))
            return toast.error("All items must have a product name");
        if (items.some((item) => item.unitPrice <= 0))
            return toast.error("All items must have a valid unit price");
        if (items.some((item) => item.quantity < 1))
            return toast.error("All items must have a quantity of at least 1");

        try {
            setLoading(true);
            const payload = {
                customerName: customerName.trim(),
                phone: phone.trim(),
                email: email.trim() || undefined,
                address: address.trim(),
                city,
                country,
                notes: notes.trim() || undefined,
                paymentStatus,
                items: items.map((item) => ({
                    productName: item.productName.trim(),
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    price: item.unitPrice * item.quantity,
                })),
                totalPrice: grandTotal,
            };

            await axios.patch(`/admin/printing-sales/${params.saleId}`, payload);
            toast.success("Sale updated successfully!");
            router.push(`/control/printing-sales/${params.saleId}`);
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Failed to update sale"
            );
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="p-8 flex justify-center items-center h-64">
                <div className="size-5 border border-t-stone-700 border-b-stone-300 animate-spin bg-gradient-to-b from-stone-700 to-stone-300" />
            </div>
        );
    }

    return (
        <div className="w-full h-fit flex flex-col px-5 md:px-7 py-8 gap-6 font-inter">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/control/printing-sales/${params.saleId}`}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-lg lg:text-xl font-bold tracking-tight text-stone-900">
                        Edit 3D Printing Sale
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Update existing sale details
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                1
                            </span>
                            Customer Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customerName">Name *</Label>
                                <Input
                                    id="customerName"
                                    placeholder="Enter customer name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input
                                        id="phone"
                                        placeholder="Enter phone number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Email (optional)"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input
                                id="address"
                                placeholder="Enter your address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City/District *</Label>
                                <Select value={city} onValueChange={setCity}>
                                    <SelectTrigger id="city">
                                        <SelectValue placeholder="Select City/District" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BANGLADESH_CITIES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={country}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Enter any notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Product Items */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                    2
                                </span>
                                Product Items
                            </CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Add Item
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Table header */}
                        <div className="hidden md:grid grid-cols-[2fr_1fr_0.8fr_1fr_auto] gap-3 pb-2 px-1 text-xs font-medium text-muted-foreground border-b">
                            <div>Product Name</div>
                            <div>Unit Price</div>
                            <div>Quantity</div>
                            <div>Price</div>
                            <div className="w-8"></div>
                        </div>

                        {/* Items */}
                        <div className="space-y-3 mt-3">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 md:grid-cols-[2fr_1fr_0.8fr_1fr_auto] gap-3 items-end md:items-center p-3 md:p-1 bg-muted/30 md:bg-transparent rounded-lg md:rounded-none"
                                >
                                    <div>
                                        <Label className="md:hidden text-xs mb-1 block">
                                            Product Name
                                        </Label>
                                        <Input
                                            placeholder="e.g. 3D Printed Plane"
                                            value={item.productName}
                                            onChange={(e) =>
                                                updateItem(index, "productName", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label className="md:hidden text-xs mb-1 block">
                                            Unit Price
                                        </Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={item.unitPrice || ""}
                                            onChange={(e) =>
                                                updateItem(index, "unitPrice", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label className="md:hidden text-xs mb-1 block">
                                            Quantity
                                        </Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="1"
                                            value={item.quantity || ""}
                                            onChange={(e) =>
                                                updateItem(index, "quantity", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-semibold text-stone-800">
                                            BDT{" "}
                                            {new Intl.NumberFormat("en-US").format(getLineTotal(item))}
                                        </span>
                                    </div>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length <= 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-end items-center gap-4 mt-6 pt-4 border-t">
                            <span className="text-sm font-medium text-muted-foreground">
                                Total Price:
                            </span>
                            <span className="text-xl font-bold text-stone-900">
                                BDT {new Intl.NumberFormat("en-US").format(grandTotal)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Status & Submit */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                3
                            </span>
                            Payment & Submit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                            <div className="space-y-2 w-full sm:w-48">
                                <Label>Payment Status</Label>
                                <Select
                                    value={paymentStatus}
                                    onValueChange={(v) => setPaymentStatus(v as "pending" | "paid" | "cancelled")}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                type="submit"
                                disabled={loading || grandTotal <= 0}
                                className="min-w-[160px]"
                            >
                                {loading ? "Updating..." : "Update Sale"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
