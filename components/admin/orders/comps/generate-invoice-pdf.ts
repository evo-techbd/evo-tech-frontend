'use client';

import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { currencyFormatBDT } from "@/lib/all_utils";
import { sanitizeText } from "@/lib/sanitize";

// Dynamically import these libraries as they're client-side only
let jsPDF: any;
let QRCode: any;

// Constants for PDF layout
const PDF_CONFIG = {
    margin: 20,
    lineHeight: 6,
    sectionSpacing: 12,
    itemRowHeight: 8,
    maxItemsPerPage: 20, // Approximate, will calculate dynamically
};

// Helper functions
const formatPaymentMethod = (method: string): string => {
    const methods: { [key: string]: string } = {
        'cop': 'Cash on Pickup',
        'cod': 'Cash on Delivery',
        'bkash': 'bKash',
        'bank_transfer': 'Bank Transfer',
    };
    return methods[method] || method;
};

const formatShippingType = (type: string): string => {
    const types: { [key: string]: string } = {
        'regular_delivery': 'Regular Delivery',
        'express_delivery': 'Express Delivery',
        'pickup_point': 'Pickup Point',
    };
    return types[type] || type;
};

const getPickupPointAddress = (pickupPointId: string | number | null): string => {
    const pickupPoints: { [key: string]: string } = {
        '101': '65/15, Shwapnokunzo, Tonartek, Vashantek, Dhaka Cantt., Dhaka-1206',
    };
    return pickupPointId ? (pickupPoints[pickupPointId.toString()] || 'Unknown Pickup Point') : '';
};

export async function generateInvoicePDF(order: OrderWithItemsType) {
    try {
        // Dynamically import the libraries
        if (!jsPDF || !QRCode) {
            const [jsPDFModule, QRCodeModule] = await Promise.all([
                import('jspdf'),
                import('qrcode'),
            ]);
            jsPDF = jsPDFModule.default;
            QRCode = QRCodeModule;
        }

        // Create PDF instance
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // PDF dimensions
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - (PDF_CONFIG.margin * 2);

        let currentY = PDF_CONFIG.margin;

        // Set default font
        pdf.setFont('helvetica');

        // Generate QR code for order tracking
        let qrCodeDataUrl: string | null = null;
        try {
            const qrData = `Order ID: ${order.orderNumber}\nAmount: ${currencyFormatBDT(order.totalPayable)} BDT\nWebsite: https://evo-techbd.com`;
            qrCodeDataUrl = await QRCode.toDataURL(qrData, {
                errorCorrectionLevel: 'M',
                margin: 1,
                width: 100,
                color: {
                    dark: '#1f2937',
                    light: '#ffffff'
                }
            });
        } catch (err) {
            console.error('QRCode generation error:', err);
        }

        // HEADER: Company Details and Invoice Title
        const addHeader = (): number => {
            let y = PDF_CONFIG.margin;

            // Company name and invoice title
            pdf.setFontSize(16);
            // make only this text bold
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(31, 41, 55); // gray-800
            pdf.text('EVO-TECH BANGLADESH', PDF_CONFIG.margin, y);

            // make text normal
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.setTextColor(59, 130, 246); // blue-500
            pdf.text('INVOICE', pageWidth - PDF_CONFIG.margin, y, { align: 'right' });

            y += 8;

            // Company details (left side)
            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128); // gray-500
            pdf.text('65/15, Shwapnokunzo, Tonartek', PDF_CONFIG.margin, y);
            pdf.text('Vashantek, Dhaka Cantt.', PDF_CONFIG.margin, y + 5);
            pdf.text('Dhaka-1206, Bangladesh', PDF_CONFIG.margin, y + 10);
            pdf.text('Email: 3dprint.bd22@gmail.com', PDF_CONFIG.margin, y + 15);

            // QR Code (right side)
            if (qrCodeDataUrl) {
                pdf.addImage(qrCodeDataUrl, 'PNG', pageWidth - PDF_CONFIG.margin - 25, y - 5, 25, 25);
            }

            y += 25;

            // Separator line
            pdf.setDrawColor(229, 231, 235); // gray-200
            pdf.line(PDF_CONFIG.margin, y, pageWidth - PDF_CONFIG.margin, y);

            return y + PDF_CONFIG.sectionSpacing;
        };

        // ORDER INFORMATION SECTION
        const addOrderInfo = (startY: number): number => {
            let y = startY;

            // Section title
            pdf.setFontSize(12);
            pdf.setTextColor(31, 41, 55); // gray-800
            pdf.text('Order Information', PDF_CONFIG.margin, y);
            y += 8;

            // Order details in two columns
            pdf.setFontSize(10);

            const leftColumnX = PDF_CONFIG.margin;
            const rightColumnX = PDF_CONFIG.margin + (contentWidth / 2) + 10;

            // Left column
            pdf.setTextColor(31, 41, 55); // gray-800
            pdf.text('Order ID:', leftColumnX, y);
            pdf.setTextColor(59, 130, 246); // blue-500
            pdf.text(order.orderNumber, leftColumnX + 25, y);
            y += PDF_CONFIG.lineHeight;

            pdf.setTextColor(31, 41, 55);
            pdf.text('Order Date:', leftColumnX, y);
            pdf.setTextColor(107, 114, 128);
            pdf.text(order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A', leftColumnX + 25, y);
            y += PDF_CONFIG.lineHeight;

            // Right column
            let rightY = startY + 8;
            pdf.setTextColor(31, 41, 55);
            pdf.text('Shipping Type:', rightColumnX, rightY);
            pdf.setTextColor(107, 114, 128);
            pdf.text(formatShippingType(order.shippingType), rightColumnX + 35, rightY);
            rightY += PDF_CONFIG.lineHeight;

            pdf.setTextColor(31, 41, 55);
            pdf.text('Payment Method:', rightColumnX, rightY);
            pdf.setTextColor(107, 114, 128);
            pdf.text(formatPaymentMethod(order.paymentMethod), rightColumnX + 35, rightY);
            rightY += PDF_CONFIG.lineHeight;

            y = Math.max(y, rightY) + PDF_CONFIG.lineHeight;

            // Delivery date if available
            if (order.deliveredAt) {
                pdf.setTextColor(31, 41, 55);
                pdf.text('Delivery Date:', leftColumnX, y);
                pdf.setTextColor(107, 114, 128);
                pdf.text(new Date(order.deliveredAt).toLocaleDateString(), leftColumnX + 25, y);
                y += PDF_CONFIG.lineHeight;
            }

            // Pickup point if applicable
            if (order.shippingType === 'pickup_point' && order.pickupPointId) {
                const pickupAddress = getPickupPointAddress(order.pickupPointId);
                if (pickupAddress) {
                    pdf.setTextColor(31, 41, 55);
                    pdf.text('Pickup Point:', leftColumnX, y);
                    y += PDF_CONFIG.lineHeight;
                    pdf.setTextColor(107, 114, 128);
                    const lines = pdf.splitTextToSize(pickupAddress, contentWidth - 20);
                    pdf.text(lines, leftColumnX, y);
                    y += lines.length * PDF_CONFIG.lineHeight;
                }
            }

            return y + PDF_CONFIG.sectionSpacing;
        };

        // CUSTOMER INFORMATION SECTION
        const addCustomerInfo = (startY: number): number => {
            let y = startY;

            // Section title
            pdf.setFontSize(12);
            pdf.setTextColor(31, 41, 55);
            pdf.text('Customer Information', PDF_CONFIG.margin, y);
            y += 8;

            pdf.setFontSize(9);

            // Customer name
            pdf.setTextColor(31, 41, 55);
            pdf.text('Name:', PDF_CONFIG.margin, y);
            const fullName = `${order.firstname}${order.lastname ? ` ${order.lastname}` : ''}`;
            pdf.text(sanitizeText(fullName), PDF_CONFIG.margin + 20, y);
            y += PDF_CONFIG.lineHeight;

            // Contact details
            if (order.email) {
                pdf.setTextColor(31, 41, 55);
                pdf.text('Email:', PDF_CONFIG.margin, y);
                pdf.text(sanitizeText(order.email), PDF_CONFIG.margin + 20, y);
                y += PDF_CONFIG.lineHeight;
            }

            pdf.setTextColor(31, 41, 55);
            pdf.text('Phone:', PDF_CONFIG.margin, y);
            pdf.text(order.phone, PDF_CONFIG.margin + 20, y);
            y += PDF_CONFIG.lineHeight + 2;

            // Address
            pdf.setTextColor(31, 41, 55);
            // Format address properly
            const addressLines = [
                `House/Street: ${sanitizeText(order.houseStreet)}`,
                `Thana: ${sanitizeText(order.subdistrict)}`,
                `District: ${sanitizeText(order.city)}`,
                ...(order.postcode
                    ? [`Postcode: ${sanitizeText(order.postcode)}`]
                    : []),
                `Country: ${sanitizeText(order.country)}`,
            ];

            addressLines.forEach(line => {
                pdf.text(line, PDF_CONFIG.margin, y);
                y += PDF_CONFIG.lineHeight;
            });

            return y + PDF_CONFIG.sectionSpacing;
        };

        // ORDER ITEMS TABLE HEADER
        const addItemsTableHeader = (startY: number): number => {
            let y = startY;

            // Section title
            pdf.setFontSize(12);
            pdf.setTextColor(31, 41, 55);
            pdf.text('ORDERED ITEMS', PDF_CONFIG.margin, y);
            y += 8;

            // Table header background
            pdf.setFillColor(243, 244, 246); // gray-100
            pdf.rect(PDF_CONFIG.margin, y - 2, contentWidth, 8, 'F');

            // Table headers
            pdf.setFontSize(10);
            pdf.setTextColor(31, 41, 55);
            pdf.text('Item Description', PDF_CONFIG.margin + 2, y + 3);
            pdf.text('Qty', PDF_CONFIG.margin + contentWidth * 0.65, y + 3, { align: 'center' });
            pdf.text('Price', PDF_CONFIG.margin + contentWidth * 0.75, y + 3, { align: 'center' });
            pdf.text('Total', pageWidth - PDF_CONFIG.margin - 1, y + 3, { align: 'right' });

            // Header border
            pdf.setDrawColor(229, 231, 235);
            pdf.line(PDF_CONFIG.margin, y + 6, pageWidth - PDF_CONFIG.margin, y + 6);

            return y + 10;
        };

        // ADD SINGLE ITEM ROW
        const addItemRow = (item: any, y: number): number => {
            pdf.setFontSize(9);

            const yoffset = y + 2;

            // Item name and color
            pdf.setTextColor(31, 41, 55);
            const itemText = sanitizeText(item.productName);
            const itemLines = pdf.splitTextToSize(itemText, contentWidth * 0.6);
            pdf.text(itemLines, PDF_CONFIG.margin + 2, yoffset);

            let rowHeight = itemLines.length * 4;

            // Color if available
            if (item.selectedColor) {
                const colorY = yoffset + (itemLines.length * 4);
                pdf.setTextColor(107, 114, 128);
                pdf.text(`Color: ${sanitizeText(item.selectedColor)}`, PDF_CONFIG.margin + 2, colorY);
                rowHeight += 4;
            }

            // Quantity, Price, Total
            // Total should be aligned to the most right without any space at the right side
            pdf.setTextColor(31, 41, 55);
            pdf.text(item.quantity.toString(), PDF_CONFIG.margin + contentWidth * 0.65, yoffset, { align: 'center' });
            pdf.text(currencyFormatBDT(item.productPrice), PDF_CONFIG.margin + contentWidth * 0.75, yoffset, { align: 'center' });
            pdf.text(currencyFormatBDT(item.productPrice * item.quantity), pageWidth - PDF_CONFIG.margin, yoffset, { align: 'right' });

            // Row separator
            const finalY = yoffset + Math.max(rowHeight, PDF_CONFIG.itemRowHeight);
            pdf.setDrawColor(243, 244, 246);
            pdf.line(PDF_CONFIG.margin, finalY, pageWidth - PDF_CONFIG.margin, finalY);

            return finalY + 2;
        };

        // ORDER SUMMARY
        const addOrderSummary = (startY: number): number => {
            let y = startY + 5;

            const summaryX = pageWidth - PDF_CONFIG.margin;
            const labelX = summaryX - 60;

            pdf.setFontSize(10);

            // Subtotal
            pdf.setTextColor(107, 114, 128);
            pdf.text('Subtotal:', labelX, y);
            pdf.setTextColor(31, 41, 55);
            pdf.text(currencyFormatBDT(order.subtotal), summaryX, y, { align: 'right' });
            y += PDF_CONFIG.lineHeight;

            // Discount
            pdf.setTextColor(107, 114, 128);
            pdf.text('Discount:', labelX, y);
            pdf.setTextColor(239, 68, 68); // red
            pdf.text(`-${currencyFormatBDT(order.discount)}`, summaryX, y, { align: 'right' });
            y += PDF_CONFIG.lineHeight;

            // Delivery charge
            pdf.setTextColor(107, 114, 128);
            pdf.text('Delivery:', labelX, y);
            pdf.setTextColor(31, 41, 55);
            pdf.text(order.deliveryCharge === 0 ? 'Free' : currencyFormatBDT(order.deliveryCharge), summaryX, y, { align: 'right' });
            y += PDF_CONFIG.lineHeight;

            // Additional charge
            if (order.additionalCharge > 0) {
                pdf.setTextColor(107, 114, 128);
                pdf.text('Additional:', labelX, y);
                pdf.setTextColor(31, 41, 55);
                pdf.text(currencyFormatBDT(order.additionalCharge), summaryX, y, { align: 'right' });
                y += PDF_CONFIG.lineHeight;
            }

            // Total separator
            pdf.setDrawColor(31, 41, 55);
            pdf.line(labelX - 5, y + 1, summaryX, y + 1);
            y += 5;

            // Total
            pdf.setFontSize(12);
            pdf.setTextColor(31, 41, 55);
            pdf.text('TOTAL:', labelX, y);
            pdf.text(currencyFormatBDT(order.totalPayable), summaryX, y, { align: 'right' });

            return y + 10;
        };

        // FOOTER
        const addFooter = (y: number): void => {
            const footerY = pageHeight - 20;

            pdf.setFontSize(9);
            pdf.setTextColor(107, 114, 128);
            pdf.text('Thank you for choosing Evo-Tech Bangladesh!', pageWidth / 2, footerY - 10, { align: 'center' });
            pdf.text('For support: 3dprint.bd22@gmail.com | Visit: https://evo-techbd.com', pageWidth / 2, footerY - 5, { align: 'center' });

            // Page number
            const pageNumber = pdf.internal.getNumberOfPages();
            if (pageNumber > 1) {
                pdf.text(`Page ${pdf.internal.getCurrentPageInfo().pageNumber} of ${pageNumber}`, pageWidth - PDF_CONFIG.margin, footerY, { align: 'right' });
            }
        };

        // MAIN PDF GENERATION
        currentY = addHeader();
        currentY = addOrderInfo(currentY);
        currentY = addCustomerInfo(currentY);

        // Add items table header
        currentY = addItemsTableHeader(currentY);

        // Add items with pagination
        if (order.orderItems && order.orderItems.length > 0) {
            for (let i = 0; i < order.orderItems.length; i++) {
                const item = order.orderItems[i];

                // Check if we need a new page (reserve space for summary and footer)
                if (currentY > pageHeight - 80) {
                    addFooter(currentY);
                    pdf.addPage();
                    currentY = addItemsTableHeader(PDF_CONFIG.margin);
                }

                currentY = addItemRow(item, currentY);
            }
        }

        // Add order summary
        currentY = addOrderSummary(currentY);

        // Add footer
        addFooter(currentY);

        // Save the PDF
        const filename = `Invoice_${sanitizeText(order.orderNumber)}_EvoTechBD.pdf`;
        pdf.save(filename);

        return true;

    } catch (error) {
        throw new Error('Failed to generate invoice PDF');
    }
}
