"use client";

import { currencyFormatBDT } from "@/lib/all_utils";
import { sanitizeText } from "@/lib/sanitize";
import { PrintingSaleType } from "@/app/(admins)/control/printing-sales/printing-sale-columns";

let jsPDF: any;

const PDF_CONFIG = {
    margin: 20,
    lineHeight: 6,
    sectionSpacing: 12,
    itemRowHeight: 8,
};

export async function generatePrintingSalePDF(sale: PrintingSaleType) {
    try {
        if (!jsPDF) {
            const jsPDFModule = await import("jspdf");
            jsPDF = jsPDFModule.default;
        }

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = pageWidth - PDF_CONFIG.margin * 2;

        pdf.setFont("helvetica");

        // HEADER
        let y = PDF_CONFIG.margin;
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(31, 41, 55);
        pdf.text("EVO-TECH BANGLADESH", PDF_CONFIG.margin, y);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        pdf.setTextColor(59, 130, 246);
        pdf.text("3D PRINTING SALE RECEIPT", pageWidth - PDF_CONFIG.margin, y, {
            align: "right",
        });

        y += 8;
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        pdf.text("65/15, Shwapnokunzo, Tonartek", PDF_CONFIG.margin, y);
        pdf.text("Vashantek, Dhaka Cantt.", PDF_CONFIG.margin, y + 5);
        pdf.text("Dhaka-1206, Bangladesh", PDF_CONFIG.margin, y + 10);
        pdf.text("Email: 3dprint.bd22@gmail.com", PDF_CONFIG.margin, y + 15);

        y += 25;
        pdf.setDrawColor(229, 231, 235);
        pdf.line(PDF_CONFIG.margin, y, pageWidth - PDF_CONFIG.margin, y);
        y += PDF_CONFIG.sectionSpacing;

        // SALE INFO
        pdf.setFontSize(12);
        pdf.setTextColor(31, 41, 55);
        pdf.text("Sale Information", PDF_CONFIG.margin, y);
        y += 8;

        pdf.setFontSize(10);
        const leftColumnX = PDF_CONFIG.margin;
        const rightColumnX = PDF_CONFIG.margin + contentWidth / 2 + 10;

        pdf.setTextColor(31, 41, 55);
        pdf.text("Sale ID:", leftColumnX, y);
        pdf.setTextColor(59, 130, 246);
        pdf.text(sale.saleNumber, leftColumnX + 22, y);

        pdf.setTextColor(31, 41, 55);
        pdf.text("Payment Status:", rightColumnX, y);
        pdf.setTextColor(107, 114, 128);
        pdf.text(sale.paymentStatus, rightColumnX + 35, y);
        y += PDF_CONFIG.lineHeight;

        pdf.setTextColor(31, 41, 55);
        pdf.text("Sale Date:", leftColumnX, y);
        pdf.setTextColor(107, 114, 128);
        pdf.text(
            sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "N/A",
            leftColumnX + 22,
            y,
        );
        y += PDF_CONFIG.sectionSpacing;

        // CUSTOMER INFO
        pdf.setFontSize(12);
        pdf.setTextColor(31, 41, 55);
        pdf.text("Customer Information", PDF_CONFIG.margin, y);
        y += 8;

        pdf.setFontSize(9);
        pdf.setTextColor(31, 41, 55);
        pdf.text("Name:", PDF_CONFIG.margin, y);
        pdf.text(sanitizeText(sale.customerName), PDF_CONFIG.margin + 20, y);
        y += PDF_CONFIG.lineHeight;

        pdf.setTextColor(31, 41, 55);
        pdf.text("Phone:", PDF_CONFIG.margin, y);
        pdf.text(sanitizeText(sale.phone), PDF_CONFIG.margin + 20, y);
        y += PDF_CONFIG.lineHeight;

        if (sale.email) {
            pdf.setTextColor(31, 41, 55);
            pdf.text("Email:", PDF_CONFIG.margin, y);
            pdf.text(sanitizeText(sale.email), PDF_CONFIG.margin + 20, y);
            y += PDF_CONFIG.lineHeight;
        }

        const addressLines = [
            `Address: ${sanitizeText(sale.address)}`,
            `City: ${sanitizeText(sale.city)}`,
            `Country: ${sanitizeText(sale.country)}`,
        ];
        addressLines.forEach((line) => {
            pdf.text(line, PDF_CONFIG.margin, y);
            y += PDF_CONFIG.lineHeight;
        });

        if (sale.notes) {
            pdf.setTextColor(31, 41, 55);
            pdf.text("Notes:", PDF_CONFIG.margin, y);
            const noteLines = pdf.splitTextToSize(
                sanitizeText(sale.notes),
                contentWidth - 20,
            );
            pdf.text(noteLines, PDF_CONFIG.margin + 20, y);
            y += noteLines.length * PDF_CONFIG.lineHeight;
        }

        y += PDF_CONFIG.sectionSpacing;

        // ITEMS TABLE HEADER
        pdf.setFontSize(12);
        pdf.setTextColor(31, 41, 55);
        pdf.text("ITEMS", PDF_CONFIG.margin, y);
        y += 8;

        pdf.setFillColor(243, 244, 246);
        pdf.rect(PDF_CONFIG.margin, y - 2, contentWidth, 8, "F");

        pdf.setFontSize(10);
        pdf.setTextColor(31, 41, 55);
        pdf.text("Item Description", PDF_CONFIG.margin + 2, y + 3);
        pdf.text("Qty", PDF_CONFIG.margin + contentWidth * 0.65, y + 3, {
            align: "center",
        });
        pdf.text("Unit Price", PDF_CONFIG.margin + contentWidth * 0.78, y + 3, {
            align: "center",
        });
        pdf.text("Total", pageWidth - PDF_CONFIG.margin - 1, y + 3, {
            align: "right",
        });

        pdf.setDrawColor(229, 231, 235);
        pdf.line(PDF_CONFIG.margin, y + 6, pageWidth - PDF_CONFIG.margin, y + 6);
        y += 10;

        // ITEM ROWS
        sale.items.forEach((item) => {
            if (y > pageHeight - 60) {
                pdf.addPage();
                y = PDF_CONFIG.margin;
            }

            pdf.setFontSize(9);
            pdf.setTextColor(31, 41, 55);
            const itemLines = pdf.splitTextToSize(
                sanitizeText(item.productName),
                contentWidth * 0.6,
            );
            pdf.text(itemLines, PDF_CONFIG.margin + 2, y + 2);

            pdf.text(
                item.quantity.toString(),
                PDF_CONFIG.margin + contentWidth * 0.65,
                y + 2,
                { align: "center" },
            );
            pdf.text(
                currencyFormatBDT(item.unitPrice),
                PDF_CONFIG.margin + contentWidth * 0.78,
                y + 2,
                { align: "center" },
            );
            pdf.text(
                currencyFormatBDT(item.price),
                pageWidth - PDF_CONFIG.margin,
                y + 2,
                { align: "right" },
            );

            const rowHeight = Math.max(
                itemLines.length * 4,
                PDF_CONFIG.itemRowHeight,
            );
            y += rowHeight;
            pdf.setDrawColor(243, 244, 246);
            pdf.line(PDF_CONFIG.margin, y, pageWidth - PDF_CONFIG.margin, y);
            y += 2;
        });

        // TOTAL
        y += 5;
        const summaryX = pageWidth - PDF_CONFIG.margin;
        const labelX = summaryX - 60;

        pdf.setDrawColor(31, 41, 55);
        pdf.line(labelX - 5, y, summaryX, y);
        y += 6;

        pdf.setFontSize(12);
        pdf.setTextColor(31, 41, 55);
        pdf.text("TOTAL:", labelX, y);
        pdf.text(currencyFormatBDT(sale.totalPrice), summaryX, y, {
            align: "right",
        });

        // FOOTER
        const footerY = pageHeight - 20;
        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128);
        pdf.text(
            "Thank you for choosing Evo-Tech Bangladesh!",
            pageWidth / 2,
            footerY - 10,
            { align: "center" },
        );
        pdf.text(
            "For support: 3dprint.bd22@gmail.com | Visit: https://evo-techbd.com",
            pageWidth / 2,
            footerY - 5,
            { align: "center" },
        );

        const filename = `PrintingSale_${sanitizeText(sale.saleNumber)}_EvoTechBD.pdf`;
        pdf.save(filename);

        return true;
    } catch (error) {
        throw new Error("Failed to generate printing sale PDF");
    }
}
