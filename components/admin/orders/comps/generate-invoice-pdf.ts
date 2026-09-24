'use client';

import { OrderedItemType, OrderWithItemsType } from "@/schemas/admin/sales/orderSchema";
import { currencyFormatBDT } from "@/lib/all_utils";
import { sanitizeText } from "@/lib/sanitize";

// Dynamically import these libraries as they're client-side only
let jsPDF: any;
let svg2pdfReady = false;

// A5 portrait, in millimeters
const PAGE = { width: 148, height: 210 };
const MARGIN = 8;
const CONTENT_W = PAGE.width - MARGIN * 2;

const COLORS = {
    text: [30, 30, 33] as const,
    muted: [100, 100, 105] as const,
    headerFill: [33, 33, 36] as const,
    headerText: [255, 255, 255] as const,
    gridLine: [195, 195, 198] as const,
    strongLine: [20, 20, 20] as const,
};

const COMPANY = {
    phone: '+8801616787815',
    website: 'www.evo-techbd.com',
    address: '72/1, Matikata Bazar, Dhaka Cantt., Dhaka 1206.',
};

const BANK = {
    name: 'The City Bank PLC.',
    accountName: 'EVO TECH BANGLADESH',
    accountNo: '1455 141 803 001',
};

const ASSETS = {
    logo: '/assets/invoice/invoice_logo.svg',
    product: '/assets/invoice/image_invoice.svg',
};

// aspect ratio (width / height) of the source vector art, used to size the images
const LOGO_ASPECT = 1154 / 398;
const PRODUCT_ASPECT = 1135 / 1043;

// item table column boundaries (x positions), within the content width
const COLS = {
    noX: MARGIN,
    productX: MARGIN + 10,
    qtyX: MARGIN + 76,
    priceX: MARGIN + 94,
    subtotalX: MARGIN + 112,
    endX: MARGIN + CONTENT_W,
};
const HEADER_ROW_H = 6.2;
const MIN_ROW_H = 6.2;
// vertical space reserved below the items table for payment info, totals,
// bank details, product illustration and signature lines
const FOOTER_RESERVE = 58;
const ITEMS_BOTTOM_LIMIT = PAGE.height - MARGIN - FOOTER_RESERVE;

let cachedLogoSvg: string | null = null;
let cachedProductSvg: string | null = null;

async function loadSvgText(path: string): Promise<string | null> {
    try {
        const response = await fetch(path);
        if (!response.ok) return null;
        return await response.text();
    } catch {
        return null;
    }
}

function parseSvgElement(svgText: string): SVGElement {
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    return doc.documentElement as unknown as SVGElement;
}

const formatPaymentMethod = (method: string): string => {
    const methods: { [key: string]: string } = {
        'cash': 'Cash',
        'cop': 'Cash on Pickup',
        'cod': 'Cash on Delivery',
        'bkash': 'bKash',
        'bank_transfer': 'Bank Transfer',
        'eps': 'Online Payment (EPS)',
    };
    return methods[method] || method;
};

type PaymentGroup = 'cash' | 'bank' | 'mobile' | 'other';

const getPaymentGroup = (method: string): PaymentGroup => {
    if (method === 'cash' || method === 'cop' || method === 'cod') return 'cash';
    if (method === 'bank_transfer') return 'bank';
    if (method === 'bkash') return 'mobile';
    return 'other';
};

// A single invoice line, independent of where it came from (order or 3D printing sale)
export interface InvoiceLineItem {
    name: string;
    quantity: number;
    unitPrice: number;
    // optional extra line printed under the name, e.g. "Color: Black"
    detail?: string;
}

// Everything the shared A5 invoice layout needs. Orders and 3D printing sales
// both map into this shape, so they print with the exact same design.
export interface InvoiceData {
    // shop-style monthly serial (e.g. "09001"); falls back to referenceId
    serial?: string;
    referenceLabel: string; // e.g. "Order ID", "Sale ID"
    referenceId: string;
    customerName: string;
    phone: string;
    address: string;
    items: InvoiceLineItem[];
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    // when unknown, no payment checkbox is marked and "Other" is left blank
    paymentMethod?: string;
    filename: string;
}

export async function generateInvoicePDF(order: OrderWithItemsType) {
    const fullName = `${order.firstname}${order.lastname ? ` ${order.lastname}` : ''}`;
    return renderInvoicePDF({
        serial: order.invoiceSerial,
        referenceLabel: 'Order ID',
        referenceId: order.orderNumber,
        customerName: fullName,
        phone: order.phone,
        address: [
            order.houseStreet,
            order.city,
            order.postcode || '',
            order.country,
        ].filter(Boolean).join(', '),
        items: (order.orderItems || []).map((item: OrderedItemType) => ({
            name: item.productName,
            quantity: item.quantity,
            unitPrice: item.productPrice,
            detail: item.selectedColor ? `Color: ${item.selectedColor}` : undefined,
        })),
        totalAmount: order.totalPayable,
        paidAmount: order.amountPaid,
        dueAmount: order.amountDue,
        paymentMethod: order.paymentMethod,
        filename: `Invoice_${order.orderNumber}_EvoTechBD.pdf`,
    });
}

export async function renderInvoicePDF(data: InvoiceData) {
    try {
        // Dynamically import the libraries
        if (!jsPDF) {
            const jsPDFModule = await import('jspdf');
            jsPDF = jsPDFModule.default;
        }
        if (!svg2pdfReady) {
            await import('svg2pdf.js'); // side-effect: adds pdf.svg()
            svg2pdfReady = true;
        }
        if (cachedLogoSvg === null) {
            cachedLogoSvg = await loadSvgText(ASSETS.logo);
        }
        if (cachedProductSvg === null) {
            cachedProductSvg = await loadSvgText(ASSETS.product);
        }

        // Create PDF instance sized to A5
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5',
        });

        const pageWidth = PAGE.width;
        const pageHeight = PAGE.height;

        pdf.setFont('helvetica');

        // Serial number and date are filled in automatically at print time,
        // rather than left blank for handwriting like the paper template.
        // invoiceSerial is a shop-style "MM" + 3-digit sequence that resets
        // every month (e.g. "09001"), assigned once per order / printing sale
        // and distinct from the long internal order or sale number.
        const serial = data.serial
            ? sanitizeText(data.serial)
            : sanitizeText(data.referenceId);
        const printDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });

        const drawTableHeaderRow = (y: number): number => {
            pdf.setFillColor(...COLORS.headerFill);
            pdf.rect(MARGIN, y, CONTENT_W, HEADER_ROW_H, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(...COLORS.headerText);
            const ty = y + HEADER_ROW_H / 2 + 1.1;
            pdf.text('NO.', (COLS.noX + COLS.productX) / 2, ty, { align: 'center' });
            pdf.text('PRODUCT / SERVICE', COLS.productX + 1.5, ty);
            pdf.text('QTY', (COLS.qtyX + COLS.priceX) / 2, ty, { align: 'center' });
            pdf.text('PRICE', (COLS.priceX + COLS.subtotalX) / 2, ty, { align: 'center' });
            pdf.text('SUB TOTAL', (COLS.subtotalX + COLS.endX) / 2, ty, { align: 'center' });
            return y + HEADER_ROW_H;
        };

        const measureItemRowHeight = (item: InvoiceLineItem): { nameLines: string[]; rowHeight: number } => {
            const nameLines = pdf.splitTextToSize(sanitizeText(item.name), COLS.qtyX - COLS.productX - 3);
            const lineCount = nameLines.length + (item.detail ? 1 : 0);
            return { nameLines, rowHeight: Math.max(MIN_ROW_H, lineCount * 3.6 + 2.6) };
        };

        const drawItemRow = (item: InvoiceLineItem, index: number, y: number): number => {
            const { nameLines, rowHeight } = measureItemRowHeight(item);

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(...COLORS.text);

            const textTop = y + 4;
            const midY = y + rowHeight / 2 + 1.1;

            pdf.text(String(index + 1), (COLS.noX + COLS.productX) / 2, midY, { align: 'center' });
            pdf.text(nameLines, COLS.productX + 1.5, textTop);

            if (item.detail) {
                pdf.setFontSize(6.8);
                pdf.setTextColor(...COLORS.muted);
                pdf.text(sanitizeText(item.detail), COLS.productX + 1.5, textTop + nameLines.length * 3.6);
                pdf.setFontSize(8);
                pdf.setTextColor(...COLORS.text);
            }

            pdf.text(String(item.quantity), (COLS.qtyX + COLS.priceX) / 2, midY, { align: 'center' });
            pdf.text(currencyFormatBDT(item.unitPrice), (COLS.priceX + COLS.subtotalX) / 2, midY, { align: 'center' });
            pdf.text(currencyFormatBDT(item.unitPrice * item.quantity), COLS.endX - 2, midY, { align: 'right' });

            pdf.setDrawColor(...COLORS.gridLine);
            pdf.setLineWidth(0.15);
            pdf.line(MARGIN, y + rowHeight, pageWidth - MARGIN, y + rowHeight);

            return y + rowHeight;
        };

        const drawBlankRow = (y: number): number => {
            pdf.setDrawColor(...COLORS.gridLine);
            pdf.setLineWidth(0.15);
            pdf.line(MARGIN, y + MIN_ROW_H, pageWidth - MARGIN, y + MIN_ROW_H);
            return y + MIN_ROW_H;
        };

        const drawColumnGrid = (top: number, bottom: number): void => {
            pdf.setDrawColor(...COLORS.gridLine);
            pdf.setLineWidth(0.15);
            [COLS.productX, COLS.qtyX, COLS.priceX, COLS.subtotalX].forEach((x) => {
                pdf.line(x, top, x, bottom);
            });
            pdf.setDrawColor(...COLORS.strongLine);
            pdf.setLineWidth(0.4);
            pdf.rect(MARGIN, top, CONTENT_W, bottom - top, 'S');
        };

        // ---------- HEADER ----------
        let y = MARGIN;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(...COLORS.text);
        pdf.text(`SL : ${serial}`, MARGIN, y + 4);
        pdf.text(`Date : ${printDate}`, pageWidth - MARGIN, y + 4, { align: 'right' });

        pdf.setFontSize(7);
        pdf.setTextColor(...COLORS.muted);
        pdf.text(`${data.referenceLabel} : ${sanitizeText(data.referenceId)}`, MARGIN, y + 8);

        const logoWidth = 44;
        const logoHeight = logoWidth / LOGO_ASPECT;
        const logoTop = y + 10;
        if (cachedLogoSvg) {
            await pdf.svg(parseSvgElement(cachedLogoSvg), {
                x: (pageWidth - logoWidth) / 2,
                y: logoTop,
                width: logoWidth,
                height: logoHeight,
            });
        }

        y = logoTop + logoHeight + 3.3;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.6);
        pdf.setTextColor(...COLORS.muted);
        pdf.text(`${COMPANY.phone}      |      ${COMPANY.website}`, pageWidth / 2, y, { align: 'center' });
        y += 3.8;
        pdf.text(COMPANY.address, pageWidth / 2, y, { align: 'center' });

        y += 2.8;
        pdf.setDrawColor(...COLORS.strongLine);
        pdf.setLineWidth(1);
        pdf.line(MARGIN, y, pageWidth - MARGIN, y);

        // ---------- CUSTOMER INFORMATION ----------
        y += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10.5);
        pdf.setTextColor(...COLORS.text);
        pdf.text('Customer Information-', MARGIN, y);

        y += 5.7;
        pdf.setFontSize(8.5);
        const rightColX = MARGIN + CONTENT_W * 0.56;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Name :', MARGIN, y);
        pdf.text('Phone :', rightColX, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(sanitizeText(data.customerName), MARGIN + 12, y);
        pdf.text(sanitizeText(data.phone), rightColX + 12, y);

        y += 5.7;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Address :', MARGIN, y);
        pdf.setFont('helvetica', 'normal');
        const addressLines = pdf.splitTextToSize(sanitizeText(data.address), CONTENT_W - 20);
        pdf.text(addressLines, MARGIN + 18, y);
        y += addressLines.length * 4.3;

        // ---------- ITEMS TABLE ----------
        y += 3.2;
        const tableTop = y;
        let cursorY = drawTableHeaderRow(y);
        const items = data.items;
        let itemIndex = 0;
        let segmentTop = tableTop;

        while (itemIndex < items.length) {
            const item = items[itemIndex];
            const { rowHeight: estRowHeight } = measureItemRowHeight(item);

            if (cursorY + estRowHeight > ITEMS_BOTTOM_LIMIT) {
                drawColumnGrid(segmentTop, cursorY);
                pdf.addPage('a5', 'portrait');
                cursorY = drawTableHeaderRow(MARGIN);
                segmentTop = MARGIN;
                continue;
            }

            cursorY = drawItemRow(item, itemIndex, cursorY);
            itemIndex += 1;
        }

        // Pad any remaining space with blank rows so the table always ends
        // at a consistent line, matching the look of the printed invoice pad.
        while (cursorY + MIN_ROW_H <= ITEMS_BOTTOM_LIMIT) {
            cursorY = drawBlankRow(cursorY);
        }
        drawColumnGrid(segmentTop, cursorY);

        // ---------- PAYMENT INFO + TOTALS ----------
        const leftColWidth = CONTENT_W * 0.56;
        const totalsBoxWidth = CONTENT_W - leftColWidth - 3;
        const totalsBoxX = MARGIN + leftColWidth + 3;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...COLORS.text);
        pdf.text('Payment Info', MARGIN, ITEMS_BOTTOM_LIMIT + 4.5);

        const totalsRows: [string, number][] = [
            ['Total Amount :', data.totalAmount],
            ['Paid Amount :', data.paidAmount],
            ['Due Amount :', data.dueAmount],
        ];
        const totalsRowH = 5.4;
        const totalsBoxTop = ITEMS_BOTTOM_LIMIT + 0.5;
        pdf.setDrawColor(...COLORS.strongLine);
        pdf.setLineWidth(0.3);
        pdf.rect(totalsBoxX, totalsBoxTop, totalsBoxWidth, totalsRowH * 3, 'S');
        totalsRows.forEach(([label, value], i) => {
            const rowY = totalsBoxTop + totalsRowH * i;
            if (i > 0) pdf.line(totalsBoxX, rowY, totalsBoxX + totalsBoxWidth, rowY);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7.6);
            pdf.setTextColor(...COLORS.text);
            pdf.text(label, totalsBoxX + 2, rowY + totalsRowH / 2 + 1.3);
            pdf.setFont('helvetica', 'normal');
            pdf.text(currencyFormatBDT(value), totalsBoxX + totalsBoxWidth - 2, rowY + totalsRowH / 2 + 1.3, { align: 'right' });
        });

        // Payment method checkbox is auto-marked from the actual payment method, if known
        const paymentGroup: PaymentGroup | null = data.paymentMethod
            ? getPaymentGroup(data.paymentMethod)
            : null;
        const checkboxY = ITEMS_BOTTOM_LIMIT + 7.5;
        const checkboxOptions: { key: PaymentGroup; label: string; x: number }[] = [
            { key: 'cash', label: 'Cash', x: 0 },
            { key: 'bank', label: 'Bank Transfer', x: 20 },
            { key: 'mobile', label: 'Mobile Banking', x: 50 },
        ];
        const cbSize = 3;
        checkboxOptions.forEach(({ key, label, x }) => {
            const cbX = MARGIN + x;
            pdf.setDrawColor(...COLORS.strongLine);
            pdf.setLineWidth(0.3);
            pdf.rect(cbX, checkboxY, cbSize, cbSize, 'S');
            if (paymentGroup === key) {
                pdf.setLineWidth(0.45);
                pdf.line(cbX + 0.4, checkboxY + 0.4, cbX + cbSize - 0.4, checkboxY + cbSize - 0.4);
                pdf.line(cbX + cbSize - 0.4, checkboxY + 0.4, cbX + 0.4, checkboxY + cbSize - 0.4);
            }
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(7.6);
            pdf.setTextColor(...COLORS.text);
            pdf.text(label, cbX + cbSize + 1.5, checkboxY + cbSize - 0.4);
        });

        const otherY = ITEMS_BOTTOM_LIMIT + 13.5;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.6);
        pdf.setTextColor(...COLORS.text);
        pdf.text('Other :', MARGIN, otherY);
        if (paymentGroup === 'other' && data.paymentMethod) {
            pdf.setFont('helvetica', 'normal');
            pdf.text(formatPaymentMethod(data.paymentMethod), MARGIN + 14, otherY);
        } else {
            pdf.setDrawColor(...COLORS.gridLine);
            pdf.setLineWidth(0.2);
            pdf.line(MARGIN + 14, otherY, MARGIN + leftColWidth, otherY);
        }

        // ---------- BANK DETAILS + PRODUCT ILLUSTRATION ----------
        const bankImgTop = ITEMS_BOTTOM_LIMIT + 18.5;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...COLORS.text);
        pdf.text('Bank Name:', MARGIN, bankImgTop + 3.8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(BANK.name, MARGIN + 20, bankImgTop + 3.8);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Account Name:', MARGIN, bankImgTop + 7.6);
        pdf.setFont('helvetica', 'normal');
        pdf.text(BANK.accountName, MARGIN + 25, bankImgTop + 7.6);

        pdf.setFont('helvetica', 'bold');
        pdf.text('Account No. :', MARGIN, bankImgTop + 11.4);
        pdf.setFont('helvetica', 'normal');
        pdf.text(BANK.accountNo, MARGIN + 25, bankImgTop + 11.4);

        const productImgWidth = 30;
        const productImgHeight = productImgWidth / PRODUCT_ASPECT;
        if (cachedProductSvg) {
            await pdf.svg(parseSvgElement(cachedProductSvg), {
                x: pageWidth - MARGIN - productImgWidth,
                y: bankImgTop,
                width: productImgWidth,
                height: productImgHeight,
            });
        }

        // ---------- SIGNATURES ----------
        const sigY = ITEMS_BOTTOM_LIMIT + 50.5;
        pdf.setDrawColor(...COLORS.strongLine);
        pdf.setLineWidth(0.25);
        pdf.line(MARGIN, sigY, MARGIN + 50, sigY);
        pdf.line(pageWidth - MARGIN - 50, sigY, pageWidth - MARGIN, sigY);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.6);
        pdf.setTextColor(...COLORS.text);
        pdf.text('Customer Signature', MARGIN + 25, sigY + 4, { align: 'center' });
        pdf.text('Authorized By', pageWidth - MARGIN - 25, sigY + 4, { align: 'center' });

        // Save the PDF
        pdf.save(sanitizeText(data.filename));

        return true;

    } catch (error) {
        throw new Error('Failed to generate invoice PDF');
    }
}
