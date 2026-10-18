'use client';

import { OrderWithItemsType, OrderedItemType } from "@/schemas/admin/sales/orderSchema";

const formatPaymentMethod = (method: string): string => {
    const methods: { [key: string]: string } = {
        'cash_on_delivery': 'Cash on Delivery',
        'bkash': 'bKash',
        'nagad': 'Nagad',
        'credit_card': 'Credit Card',
        'bank_transfer': 'Bank Transfer',
        'eps': 'Online Payment (EPS)',
    };
    return methods[method] || method;
};

const formatShippingType = (type: string): string => {
    const types: { [key: string]: string } = {
        'home_delivery': 'Home Delivery',
        'pickup_point': 'Pickup Point',
        'express_delivery': 'Express Delivery',
    };
    return types[type] || type;
};

const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // Escape double quotes and wrap in quotes if contains comma, newline, or quote
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

type Cell = string | number | null;

// Each order is exported as one row per ordered product. Order-level columns
// are filled only on the order's first row (and merged across its rows in
// Excel), so column sums like Total stay correct for manual calculation.
const ORDER_LEADING_COLUMNS = [
    { header: 'Order ID', wch: 22 },
    { header: 'Customer Name', wch: 22 },
];

const ITEM_COLUMNS = [
    { header: 'Product', wch: 40 },
    { header: 'Category', wch: 20 },
    { header: 'Qty', wch: 6 },
    { header: 'Unit Price (BDT)', wch: 15 },
    { header: 'Item Total (BDT)', wch: 15 },
];

const ORDER_TRAILING_COLUMNS = [
    { header: 'Email', wch: 28 },
    { header: 'Phone', wch: 15 },
    { header: 'Order Date', wch: 12 },
    { header: 'Order Status', wch: 12 },
    { header: 'Payment Status', wch: 15 },
    { header: 'Payment Method', wch: 20 },
    { header: 'Shipping Type', wch: 15 },
    { header: 'Subtotal (BDT)', wch: 14 },
    { header: 'Discount (BDT)', wch: 14 },
    { header: 'Delivery Charge (BDT)', wch: 18 },
    { header: 'Additional Charge (BDT)', wch: 20 },
    { header: 'Total (BDT)', wch: 14 },
    { header: 'Items Count', wch: 10 },
    { header: 'Address', wch: 40 },
    { header: 'Tracking Code', wch: 15 },
    { header: 'Transaction ID', wch: 20 },
    { header: 'Delivered At', wch: 12 },
    { header: 'Notes', wch: 30 },
];

const ALL_COLUMNS = [...ORDER_LEADING_COLUMNS, ...ITEM_COLUMNS, ...ORDER_TRAILING_COLUMNS];
const HEADERS = ALL_COLUMNS.map(col => col.header);

const getItemCategory = (item: OrderedItemType): string => {
    const product = item.product as any;
    if (product && typeof product === 'object' && product.category && typeof product.category === 'object') {
        return product.category.name || '';
    }
    return '';
};

const getItemCells = (item?: OrderedItemType): Cell[] => {
    if (!item) return ['', '', null, null, null];
    const name = item.selectedColor ? `${item.productName} (${item.selectedColor})` : item.productName;
    return [
        name,
        getItemCategory(item) || 'N/A',
        item.quantity,
        item.productPrice,
        item.subtotal,
    ];
};

const getOrderCells = (order: OrderWithItemsType) => {
    const fullName = `${order.firstname}${order.lastname ? ` ${order.lastname}` : ''}`;
    const address = `${order.houseStreet}, ${order.subdistrict}, ${order.city}${order.postcode ? `, ${order.postcode}` : ''}, ${order.country}`;
    const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : '';
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';

    const leading: Cell[] = [order.orderNumber, fullName];
    const trailing: Cell[] = [
        order.email || '',
        order.phone,
        orderDate,
        order.orderStatus,
        order.paymentStatus,
        formatPaymentMethod(order.paymentMethod),
        formatShippingType(order.shippingType),
        order.subtotal,
        order.discount,
        order.deliveryCharge,
        order.additionalCharge,
        order.totalPayable,
        order.orderItems?.length || 0,
        address,
        order.trackingCode || '',
        order.transactionId || '',
        deliveredDate,
        order.notes || '',
    ];
    return { leading, trailing };
};

// Returns the data rows (header excluded) grouped per order: one row per product.
const buildOrderRowGroups = (orders: OrderWithItemsType[]): Cell[][][] => {
    const emptyLeading: Cell[] = ORDER_LEADING_COLUMNS.map(() => null);
    const emptyTrailing: Cell[] = ORDER_TRAILING_COLUMNS.map(() => null);

    return orders.map(order => {
        const { leading, trailing } = getOrderCells(order);
        const items: (OrderedItemType | undefined)[] = order.orderItems?.length ? order.orderItems : [undefined];

        return items.map((item, index) => [
            ...(index === 0 ? leading : emptyLeading),
            ...getItemCells(item),
            ...(index === 0 ? trailing : emptyTrailing),
        ]);
    });
};

export async function exportOrdersToCSV(orders: OrderWithItemsType[]) {
    try {
        const rows = buildOrderRowGroups(orders).flat().map(row => row.map(escapeCSV).join(','));

        // Combine headers and rows
        const csvContent = [HEADERS.join(','), ...rows].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
    } catch (error) {
        console.error('Error exporting orders:', error);
        throw new Error('Failed to export orders to CSV');
    }
}

export async function exportOrdersToExcel(orders: OrderWithItemsType[]) {
    try {
        // Dynamically import xlsx library
        const XLSX = await import('xlsx');

        const groups = buildOrderRowGroups(orders);
        const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...groups.flat()]);

        // Merge order-level cells vertically across each order's product rows
        const itemColStart = ORDER_LEADING_COLUMNS.length;
        const itemColEnd = itemColStart + ITEM_COLUMNS.length - 1;
        const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [];
        let rowIndex = 1; // row 0 is the header

        for (const group of groups) {
            if (group.length > 1) {
                for (let c = 0; c < ALL_COLUMNS.length; c++) {
                    if (c >= itemColStart && c <= itemColEnd) continue;
                    merges.push({ s: { r: rowIndex, c }, e: { r: rowIndex + group.length - 1, c } });
                }
            }
            rowIndex += group.length;
        }

        worksheet['!merges'] = merges;
        worksheet['!cols'] = ALL_COLUMNS.map(col => ({ wch: col.wch }));

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

        // Generate filename
        const filename = `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Save file
        XLSX.writeFile(workbook, filename);

        return true;
    } catch (error) {
        console.error('Error exporting orders to Excel:', error);
        throw new Error('Failed to export orders to Excel');
    }
}
