'use client';

import { OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { currencyFormatBDT } from "@/lib/all_utils";
import { sanitizeText } from "@/lib/sanitize";

// Dynamically import these libraries as they're client-side only
let jsPDF: any;
let QRCode: any;
let JsBarcode: any;

// Constants for label layout (thermal label size: 100mm x 150mm)
const LABEL_CONFIG = {
    width: 100,
    height: 150,
    margin: 5,
    lineHeight: 5,
    sectionSpacing: 4,
};

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

export async function generateShippingLabel(order: OrderWithItemsType) {
    try {
        // Dynamically import the libraries
        if (!jsPDF || !QRCode || !JsBarcode) {
            const [jsPDFModule, QRCodeModule, JsBarcodeModule] = await Promise.all([
                import('jspdf'),
                import('qrcode'),
                import('jsbarcode'),
            ]);
            jsPDF = jsPDFModule.default;
            QRCode = QRCodeModule;
            JsBarcode = JsBarcodeModule.default;
        }

        // Create PDF instance for thermal label (100mm x 150mm)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [LABEL_CONFIG.width, LABEL_CONFIG.height],
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const contentWidth = pageWidth - (LABEL_CONFIG.margin * 2);

        let currentY = LABEL_CONFIG.margin;

        // Set default font
        pdf.setFont('helvetica');

        // Generate barcode for order number
        let barcodeDataUrl: string | null = null;
        try {
            const canvas = document.createElement('canvas');
            JsBarcode(canvas, order.orderNumber, {
                format: 'CODE128',
                width: 2,
                height: 40,
                displayValue: false,
            });
            barcodeDataUrl = canvas.toDataURL('image/png');
        } catch (err) {
            console.error('Barcode generation error:', err);
        }

        // Generate QR code for order tracking
        let qrCodeDataUrl: string | null = null;
        try {
            const qrData = `Order: ${order.orderNumber}\nPhone: ${order.phone}\nAmount: ${currencyFormatBDT(order.totalPayable)} BDT`;
            qrCodeDataUrl = await QRCode.toDataURL(qrData, {
                errorCorrectionLevel: 'M',
                margin: 1,
                width: 150,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
        } catch (err) {
            console.error('QRCode generation error:', err);
        }

        // HEADER: Company Name
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('EVO-TECH BANGLADESH', pageWidth / 2, currentY, { align: 'center' });
        currentY += 6;

        // Company address
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text('65/15, Shwapnokunzo, Tonartek, Vashantek', pageWidth / 2, currentY, { align: 'center' });
        currentY += 3.5;
        pdf.text('Dhaka Cantt., Dhaka-1206', pageWidth / 2, currentY, { align: 'center' });
        currentY += 3.5;
        pdf.text('Email: 3dprint.bd22@gmail.com', pageWidth / 2, currentY, { align: 'center' });
        currentY += 5;

        // Separator line
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(LABEL_CONFIG.margin, currentY, pageWidth - LABEL_CONFIG.margin, currentY);
        currentY += 4;

        // Barcode
        if (barcodeDataUrl) {
            pdf.addImage(barcodeDataUrl, 'PNG', LABEL_CONFIG.margin, currentY, contentWidth, 12);
            currentY += 13;
        }

        // Order number below barcode
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(order.orderNumber, pageWidth / 2, currentY, { align: 'center' });
        currentY += 5;

        // QR Code (right side) and Order Info (left side)
        const qrSize = 30;
        const qrX = pageWidth - LABEL_CONFIG.margin - qrSize;
        const infoX = LABEL_CONFIG.margin;

        if (qrCodeDataUrl) {
            pdf.addImage(qrCodeDataUrl, 'PNG', qrX, currentY, qrSize, qrSize);
        }

        // Invoice number and delivery info (left side)
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Invoice:', infoX, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(order.orderNumber, infoX + 15, currentY);
        currentY += 4;

        pdf.setFont('helvetica', 'bold');
        pdf.text('Delivery Type:', infoX, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(formatShippingType(order.shippingType), infoX + 23, currentY);
        currentY += 4;

        // Calculate weight (approximate based on items)
        const weight = order.orderItems?.length ? (order.orderItems.length * 0.5).toFixed(1) : '0.5';
        pdf.setFont('helvetica', 'bold');
        pdf.text('Weight:', infoX, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${weight} kg`, infoX + 15, currentY);
        currentY += 8; // Extra space to clear QR code

        // Separator line
        pdf.setLineWidth(0.3);
        pdf.line(LABEL_CONFIG.margin, currentY, pageWidth - LABEL_CONFIG.margin, currentY);
        currentY += 4;

        // Customer section
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CUSTOMER DETAILS', LABEL_CONFIG.margin, currentY);
        currentY += 5;

        // Customer name
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Name:', LABEL_CONFIG.margin, currentY);
        pdf.setFont('helvetica', 'normal');
        const fullName = sanitizeText(`${order.firstname}${order.lastname ? ` ${order.lastname}` : ''}`);
        pdf.text(fullName, LABEL_CONFIG.margin + 13, currentY);
        currentY += 5;

        // Phone
        pdf.setFont('helvetica', 'bold');
        pdf.text('Phone:', LABEL_CONFIG.margin, currentY);
        pdf.setFont('helvetica', 'normal');
        pdf.text(order.phone, LABEL_CONFIG.margin + 13, currentY);
        currentY += 5;

        // Address
        pdf.setFont('helvetica', 'bold');
        pdf.text('Address:', LABEL_CONFIG.margin, currentY);
        currentY += 4;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        const addressLines = [
            sanitizeText(order.houseStreet),
            `${sanitizeText(order.subdistrict)}, ${sanitizeText(order.city)}`,
            ...(order.postcode ? [`Postcode: ${sanitizeText(order.postcode)}`] : []),
            sanitizeText(order.country),
        ];

        addressLines.forEach(line => {
            const wrappedLines = pdf.splitTextToSize(line, contentWidth - 2);
            pdf.text(wrappedLines, LABEL_CONFIG.margin + 2, currentY);
            currentY += wrappedLines.length * 3.5;
        });

        currentY += 2;

        // Separator line
        pdf.setLineWidth(0.3);
        pdf.line(LABEL_CONFIG.margin, currentY, pageWidth - LABEL_CONFIG.margin, currentY);
        currentY += 4;

        // COD Amount (if applicable)
        if (order.paymentMethod === 'cod') {
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('COD AMOUNT:', LABEL_CONFIG.margin, currentY);
            pdf.setFontSize(14);
            pdf.text(currencyFormatBDT(order.totalPayable), pageWidth - LABEL_CONFIG.margin, currentY, { align: 'right' });
            currentY += 6;

            // Separator line
            pdf.setLineWidth(0.3);
            pdf.line(LABEL_CONFIG.margin, currentY, pageWidth - LABEL_CONFIG.margin, currentY);
            currentY += 4;
        }

        // Footer: Courier branding
        const footerY = LABEL_CONFIG.height - 15;
        
        // SteadFast branding box
        pdf.setFillColor(220, 220, 220);
        pdf.rect(LABEL_CONFIG.margin, footerY, contentWidth, 10, 'F');
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Evo-tech', pageWidth / 2, footerY + 4, { align: 'center' });
        
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        // pdf.text('3d', pageWidth / 2, footerY + 7.5, { align: 'center' });

        // Save the PDF
        const filename = `ShippingLabel_${sanitizeText(order.orderNumber)}_EvoTechBD.pdf`;
        pdf.save(filename);

        return true;

    } catch (error) {
        console.error('Shipping label generation error:', error);
        throw new Error('Failed to generate shipping label');
    }
}
