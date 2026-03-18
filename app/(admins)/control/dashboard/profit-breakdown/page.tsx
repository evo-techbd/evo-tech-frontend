"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Truck,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { getCurrentUser } from "@/utils/cookies";
import axios from "@/utils/axios/axios";
import Link from "next/link";

interface MonthData {
  month: number;
  monthName: string;
  orders: number;
  revenue: number;
  cost: number;
  profit: number;
  deliveryFees: number;
  additionalCharges: number;
  printingRevenue: number;
  printingOrders: number;
}

interface BreakdownData {
  year: number;
  months: MonthData[];
  totals: {
    orders: number;
    revenue: number;
    cost: number;
    profit: number;
    deliveryFees: number;
    additionalCharges: number;
    printingRevenue: number;
    printingOrders: number;
  };
}

interface OrderItemDetail {
  productName: string;
  sellingPrice: number;
  buyingPrice: number;
  quantity: number;
  subtotal: number;
  itemProfit: number;
  selectedColor?: string;
}

interface OrderWithProfit {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  orderDate: string;
  orderStatus: string;
  paymentStatus: string;
  revenue: number;
  cost: number;
  profit: number;
  deliveryCharge: number;
  additionalCharge: number;
  discount: number;
  amountPaid: number;
  totalPayable: number;
  itemCount: number;
  items: OrderItemDetail[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ProfitBreakdownPage = () => {
  const currentUser = getCurrentUser();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [data, setData] = useState<BreakdownData | null>(null);
  const [loading, setLoading] = useState(true);

  // Order-level state
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1,
  );
  const [orderData, setOrderData] = useState<OrderWithProfit[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `/dashboard/monthly-profit-breakdown?year=${selectedYear}`,
      );
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching profit breakdown:", error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, selectedYear]);

  const fetchOrders = useCallback(async () => {
    if (!currentUser) return;
    try {
      setOrdersLoading(true);
      const response = await axios.get(
        `/dashboard/orders-with-profit?year=${selectedYear}&month=${selectedMonth}`,
      );
      if (response.data.success) {
        setOrderData(response.data.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders with profit:", error);
    } finally {
      setOrdersLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, selectedYear, selectedMonth]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  useEffect(() => {
    fetchOrders();
    setExpandedOrders(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOrders]);

  const formatCurrency = (amount: number) => {
    return `৳${new Intl.NumberFormat("en-US", {
      minimumIntegerDigits: 1,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      confirmed: "bg-emerald-100 text-emerald-700",
      processing: "bg-blue-100 text-blue-700",
      shipped: "bg-violet-100 text-violet-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      paid: "bg-green-100 text-green-700",
      partial: "bg-amber-100 text-amber-700",
      failed: "bg-red-100 text-red-700",
      refunded: "bg-stone-100 text-stone-700",
    };
    return (
      <span
        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${colors[status] || "bg-stone-100 text-stone-600"}`}
      >
        {status}
      </span>
    );
  };

  const currentMonth = new Date().getMonth();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/control/dashboard">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Monthly Profit Breakdown
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Detailed monthly orders, revenue, cost & profit analysis
            </p>
          </div>
        </div>

        <Select
          value={selectedYear.toString()}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((yr) => (
              <SelectItem key={yr} value={yr.toString()}>
                {yr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {data && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 pointer-events-none" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-medium text-stone-500">Total Revenue</p>
              </div>
              <p className="text-xl font-bold text-stone-900">
                {formatCurrency(data.totals.revenue + data.totals.printingRevenue)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-blue-500/5 pointer-events-none" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-2 mb-1">
                {data.totals.profit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <p className="text-xs font-medium text-stone-500">Total Profit</p>
              </div>
              <p className={`text-xl font-bold ${data.totals.profit >= 0 ? "text-stone-900" : "text-red-600"}`}>
                {formatCurrency(data.totals.profit)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 to-violet-500/5 pointer-events-none" />
            <CardContent className="relative p-4">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="h-4 w-4 text-violet-600" />
                <p className="text-xs font-medium text-stone-500">Total Orders</p>
              </div>
              <p className="text-xl font-bold text-stone-900">
                {data.totals.orders + data.totals.printingOrders}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Summary Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-stone-500" />
            <CardTitle className="text-base font-semibold text-stone-900">
              {selectedYear} Monthly Breakdown
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="p-8 text-center text-stone-400">
              <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin mb-2" />
              <p className="text-sm">Loading breakdown...</p>
            </div>
          ) : data ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-stone-50/80 hover:bg-stone-50/80">
                    <TableHead className="font-semibold text-stone-700 pl-5">Month</TableHead>
                    <TableHead className="font-semibold text-stone-700 text-center">Store Orders</TableHead>
                    <TableHead className="font-semibold text-stone-700 text-center">3D Print Orders</TableHead>
                    <TableHead className="font-semibold text-stone-700 text-right">Revenue</TableHead>
                    <TableHead className="font-semibold text-stone-700 text-right">3D Print Revenue</TableHead>
                    <TableHead className="font-semibold text-stone-700 text-right">Cost</TableHead>
                    <TableHead className="font-semibold text-stone-700 text-right">Profit</TableHead>
                    {/* <TableHead className="font-semibold text-stone-700 text-right pr-5">Delivery Fees</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.months.map((month) => {
                    const hasData = month.orders > 0 || month.printingOrders > 0;
                    const isCurrentMonth =
                      selectedYear === currentYear && month.month - 1 === currentMonth;
                    const isSelected = selectedMonth === month.month;

                    return (
                      <TableRow
                        key={month.month}
                        className={`cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/70 hover:bg-blue-50/80 ring-1 ring-inset ring-blue-200"
                            : isCurrentMonth
                              ? "bg-blue-50/30 hover:bg-blue-50/50"
                              : hasData
                                ? "hover:bg-stone-50/50"
                                : "text-stone-300 hover:bg-stone-50/30"
                        }`}
                        onClick={() => {
                          if (hasData) setSelectedMonth(month.month);
                        }}
                      >
                        <TableCell className="pl-5 font-medium">
                          <div className="flex items-center gap-2">
                            {month.monthName}
                            {isCurrentMonth && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                CURRENT
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{month.orders}</TableCell>
                        <TableCell className="text-center">{month.printingOrders}</TableCell>
                        <TableCell className="text-right">{formatCurrency(month.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(month.printingRevenue)}</TableCell>
                        <TableCell className="text-right text-stone-500">{formatCurrency(month.cost)}</TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            month.profit > 0 ? "text-emerald-600" : month.profit < 0 ? "text-red-600" : ""
                          }`}
                        >
                          {formatCurrency(month.profit)}
                        </TableCell>
                        {/* <TableCell className="text-right pr-5 text-stone-400">
                          {formatCurrency(month.deliveryFees)}
                        </TableCell> */}
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-stone-100/80 hover:bg-stone-100/80 font-bold">
                    <TableCell className="pl-5 font-bold text-stone-900">Total</TableCell>
                    <TableCell className="text-center font-bold text-stone-900">{data.totals.orders}</TableCell>
                    <TableCell className="text-center font-bold text-stone-900">{data.totals.printingOrders}</TableCell>
                    <TableCell className="text-right font-bold text-stone-900">{formatCurrency(data.totals.revenue)}</TableCell>
                    <TableCell className="text-right font-bold text-stone-900">{formatCurrency(data.totals.printingRevenue)}</TableCell>
                    <TableCell className="text-right font-bold text-stone-500">{formatCurrency(data.totals.cost)}</TableCell>
                    <TableCell className={`text-right font-bold ${data.totals.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(data.totals.profit)}
                    </TableCell>
                    {/* <TableCell className="text-right pr-5 font-bold text-stone-400">
                      {formatCurrency(data.totals.deliveryFees)}
                    </TableCell> */}
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-stone-400">
              <p>No data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order-Level Profit Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-stone-500" />
              <CardTitle className="text-base font-semibold text-stone-900">
                Order Details — {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </CardTitle>
            </div>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((name, idx) => (
                  <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {ordersLoading ? (
            <div className="p-8 text-center text-stone-400">
              <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin mb-2" />
              <p className="text-sm">Loading orders...</p>
            </div>
          ) : orderData.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <p className="text-sm">
                No orders found for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-stone-50/80 hover:bg-stone-50/80">
                    <TableHead className="w-8 pl-4" />
                    <TableHead className="font-semibold text-stone-700">Order #</TableHead>
                    <TableHead className="font-semibold text-stone-700">Customer</TableHead>
                    <TableHead className="font-semibold text-stone-700 text-center">Items</TableHead>
                    <TableHead className="font-semibold text-stone-700 text-center">Status</TableHead>
                    <TableHead className="font-semibold text-stone-700 text-right">Revenue</TableHead>
                    <TableHead className="font-semibold text-stone-700 text-right">Cost</TableHead>
                    <TableHead className="font-semibold text-stone-700 text-right">Profit</TableHead>
                    {/* <TableHead className="font-semibold text-stone-700 text-right">Delivery</TableHead>*/}
                    <TableHead className="font-semibold text-stone-700 text-right pr-5">Paid</TableHead> 
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData.map((order) => {
                    const isExpanded = expandedOrders.has(order._id);
                    return (
                      <>{/* Fragment for row + expanded */}
                        <TableRow
                          key={order._id}
                          className="cursor-pointer hover:bg-stone-50/50"
                          onClick={() => toggleExpand(order._id)}
                        >
                          <TableCell className="pl-4 w-8">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-stone-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-stone-400" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-stone-600">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-stone-900 leading-none">
                                {order.customerName}
                              </p>
                              <p className="text-[11px] text-stone-400 mt-0.5">{order.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{order.itemCount}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-1 justify-center flex-wrap">
                              {getStatusBadge(order.orderStatus)}
                              {getStatusBadge(order.paymentStatus)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(order.revenue)}</TableCell>
                          <TableCell className="text-right text-stone-500">
                            {formatCurrency(order.cost)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${
                              order.profit > 0
                                ? "text-emerald-600"
                                : order.profit < 0
                                  ? "text-red-600"
                                  : ""
                            }`}
                          >
                            {formatCurrency(order.profit)}
                          </TableCell>
                          {/* <TableCell className="text-right text-stone-400">
                            {formatCurrency(order.deliveryCharge)}
                          </TableCell> */}
                          <TableCell className="text-right pr-5">
                            {formatCurrency(order.amountPaid)}
                          </TableCell>
                        </TableRow>

                        {/* Expanded: item-level details */}
                        {isExpanded && (
                          <TableRow
                            key={`${order._id}-items`}
                            className="bg-stone-50/60 hover:bg-stone-50/60"
                          >
                            <TableCell colSpan={10} className="p-0">
                              <div className="px-8 py-3">
                                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                                  Order Items
                                </p>
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-stone-500">
                                      <th className="text-left pb-1.5 font-medium">Product</th>
                                      <th className="text-center pb-1.5 font-medium">Qty</th>
                                      <th className="text-right pb-1.5 font-medium">Selling Price</th>
                                      <th className="text-right pb-1.5 font-medium">Buying Price</th>
                                      <th className="text-right pb-1.5 font-medium">Subtotal</th>
                                      <th className="text-right pb-1.5 font-medium">Profit</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item, idx) => (
                                      <tr key={idx} className="border-t border-stone-200/60">
                                        <td className="py-1.5 text-stone-700">
                                          {item.productName}
                                          {item.selectedColor && (
                                            <span className="text-stone-400 ml-1">
                                              ({item.selectedColor})
                                            </span>
                                          )}
                                        </td>
                                        <td className="text-center py-1.5">{item.quantity}</td>
                                        <td className="text-right py-1.5">
                                          {formatCurrency(item.sellingPrice)}
                                        </td>
                                        <td className="text-right py-1.5 text-stone-500">
                                          {formatCurrency(item.buyingPrice)}
                                        </td>
                                        <td className="text-right py-1.5">
                                          {formatCurrency(item.subtotal)}
                                        </td>
                                        <td
                                          className={`text-right py-1.5 font-medium ${
                                            item.itemProfit > 0
                                              ? "text-emerald-600"
                                              : item.itemProfit < 0
                                                ? "text-red-600"
                                                : ""
                                          }`}
                                        >
                                          {formatCurrency(item.itemProfit)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {order.discount > 0 && (
                                  <p className="text-[11px] text-stone-400 mt-2">
                                    Discount applied: {formatCurrency(order.discount)}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-stone-100/80 hover:bg-stone-100/80">
                    <TableCell colSpan={5} className="pl-4 font-bold text-stone-900">
                      Total ({orderData.length} orders)
                    </TableCell>
                    <TableCell className="text-right font-bold text-stone-900">
                      {formatCurrency(orderData.reduce((s, o) => s + o.revenue, 0))}
                    </TableCell>
                    <TableCell className="text-right font-bold text-stone-500">
                      {formatCurrency(orderData.reduce((s, o) => s + o.cost, 0))}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        orderData.reduce((s, o) => s + o.profit, 0) >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatCurrency(orderData.reduce((s, o) => s + o.profit, 0))}
                    </TableCell>
                    {/* <TableCell className="text-right font-bold text-stone-400">
                      {formatCurrency(orderData.reduce((s, o) => s + o.deliveryCharge, 0))}
                    </TableCell> */}
                    <TableCell className="text-right pr-5 font-bold text-stone-900">
                      {formatCurrency(orderData.reduce((s, o) => s + o.amountPaid, 0))}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Note */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Revenue = Product subtotal − Discounts.
          Delivery fees and additional charges are excluded from revenue since they are
          passed to the delivery service company. Profit = Revenue − Cost of Goods
          (buying price × quantity). Click any month row above to filter orders below,
          or use the month dropdown. Click an order row to expand item-level profit.
        </p>
      </div>
    </div>
  );
};

export default ProfitBreakdownPage;
