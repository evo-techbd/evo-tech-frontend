'use client';

import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { currencyFormatBDT } from "@/lib/all_utils";

const formatPaymentMethod = (method: string): string => {
    const methods: { [key: string]: string } = {
        'cash_on_delivery': 'Cash on Delivery',
        'bkash': 'bKash',
        'nagad': 'Nagad',
        'credit_card': 'Credit Card',
        'bank_transfer': 'Bank Transfer',
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

export async function exportOrdersToCSV(orders: OrderWithItemsType[]) {
    try {
        // CSV headers
        const headers = [
            'Order ID',
            'Customer Name',
            'Email',
            'Phone',
            'Order Date',
            'Order Status',
            'Payment Status',
            'Payment Method',
            'Shipping Type',
            'Subtotal (BDT)',
            'Discount (BDT)',
            'Delivery Charge (BDT)',
            'Additional Charge (BDT)',
            'Total (BDT)',
            'Items Count',
            'Product Categories',
            'Address',
            'Tracking Code',
            'Transaction ID',
            'Delivered At',
            'Notes'
        ];

        // Build CSV rows
        const rows = orders.map(order => {
            const fullName = `${order.firstname}${order.lastname ? ` ${order.lastname}` : ''}`;
            const address = `${order.houseStreet}, ${order.subdistrict}, ${order.city}${order.postcode ? `, ${order.postcode}` : ''}, ${order.country}`;
            const itemsCount = order.orderItems?.length || 0;
            const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : '';
            const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
            
            // Extract unique categories from order items
            const categories = order.orderItems?.map(item => {
                const product = item.product as any;
                if (product && typeof product === 'object' && product.category) {
                    return typeof product.category === 'object' ? product.category.name : '';
                }
                return '';
            }).filter(Boolean) || [];
            const uniqueCategories = [...new Set(categories)].join(', ');

            return [
                escapeCSV(order.orderNumber),
                escapeCSV(fullName),
                escapeCSV(order.email || ''),
                escapeCSV(order.phone),
                escapeCSV(orderDate),
                escapeCSV(order.orderStatus),
                escapeCSV(order.paymentStatus),
                escapeCSV(formatPaymentMethod(order.paymentMethod)),
                escapeCSV(formatShippingType(order.shippingType)),
                escapeCSV(order.subtotal),
                escapeCSV(order.discount),
                escapeCSV(order.deliveryCharge),
                escapeCSV(order.additionalCharge),
                escapeCSV(order.totalPayable),
                escapeCSV(itemsCount),
                escapeCSV(uniqueCategories || 'N/A'),
                escapeCSV(address),
                escapeCSV(order.trackingCode || ''),
                escapeCSV(order.transactionId || ''),
                escapeCSV(deliveredDate),
                escapeCSV(order.notes || '')
            ].join(',');
        });

        // Combine headers and rows
        const csvContent = [headers.join(','), ...rows].join('\n');

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

        // Prepare data for Excel
        const data = orders.map(order => {
            const fullName = `${order.firstname}${order.lastname ? ` ${order.lastname}` : ''}`;
            const address = `${order.houseStreet}, ${order.subdistrict}, ${order.city}${order.postcode ? `, ${order.postcode}` : ''}, ${order.country}`;
            const itemsCount = order.orderItems?.length || 0;
            const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : '';
            const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A';
            
            // Extract unique categories from order items
            const categories = order.orderItems?.map(item => {
                const product = item.product as any;
                if (product && typeof product === 'object' && product.category) {
                    return typeof product.category === 'object' ? product.category.name : '';
                }
                return '';
            }).filter(Boolean) || [];
            const uniqueCategories = [...new Set(categories)].join(', ');

            return {
                'Order ID': order.orderNumber,
                'Customer Name': fullName,
                'Email': order.email || '',
                'Phone': order.phone,
                'Order Date': orderDate,
                'Order Status': order.orderStatus,
                'Payment Status': order.paymentStatus,
                'Payment Method': formatPaymentMethod(order.paymentMethod),
                'Shipping Type': formatShippingType(order.shippingType),
                'Subtotal (BDT)': order.subtotal,
                'Discount (BDT)': order.discount,
                'Delivery Charge (BDT)': order.deliveryCharge,
                'Additional Charge (BDT)': order.additionalCharge,
                'Total (BDT)': order.totalPayable,
                'Items Count': itemsCount,
                'Product Categories': uniqueCategories || 'N/A',
                'Address': address,
                'Tracking Code': order.trackingCode || '',
                'Transaction ID': order.transactionId || '',
                'Delivered At': deliveredDate,
                'Notes': order.notes || ''
            };
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Set column widths
        const columnWidths = [
            { wch: 15 }, // Order ID
            { wch: 20 }, // Customer Name
            { wch: 25 }, // Email
            { wch: 15 }, // Phone
            { wch: 12 }, // Order Date
            { wch: 12 }, // Order Status
            { wch: 15 }, // Payment Status
            { wch: 18 }, // Payment Method
            { wch: 15 }, // Shipping Type
            { wch: 12 }, // Subtotal
            { wch: 12 }, // Discount
            { wch: 15 }, // Delivery Charge
            { wch: 15 }, // Additional Charge
            { wch: 12 }, // Total
            { wch: 10 }, // Items Count
            { wch: 30 }, // Product Categories
            { wch: 40 }, // Address
            { wch: 15 }, // Tracking Code
            { wch: 20 }, // Transaction ID
            { wch: 15 }, // Delivered At
            { wch: 30 }, // Notes
        ];
        worksheet['!cols'] = columnWidths;

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
