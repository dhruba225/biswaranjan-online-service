import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface InvoiceData {
    customerName: string;
    mobileNumber: string;
    address?: string;
    services: {
        description: string;
        amount: string;
        serviceDate: string;
        acknowledgementNumber: string;
    }[];
}

export function generateInvoice(data: InvoiceData) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("BISWARANJAN ONLINE SERVICE", 14, 22);

    doc.setFontSize(14);
    doc.text("INVOICE", 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, 38);

    // Customer Details
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Billed To:", 14, 50);
    doc.setFontSize(10);
    doc.text(`Name: ${data.customerName}`, 14, 57);
    doc.text(`Mobile: ${data.mobileNumber}`, 14, 63);
    if (data.address) {
        doc.text(`Address: ${data.address}`, 14, 69);
    }

    // Draw Table
    const tableColumn = ["Description", "Service Date", "Ack No.", "Amount (INR)"];
    const tableRows = data.services.map(s => [
        s.description,
        new Date(s.serviceDate).toLocaleDateString(),
        s.acknowledgementNumber || "-",
        `Rs. ${parseFloat(s.amount).toFixed(2)}`
    ]);

    const startY = data.address ? 80 : 74;

    autoTable(doc, {
        startY,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        styles: { fontSize: 10, cellPadding: 4 },
    });

    // Calculate Total
    const totalAmount = data.services.reduce((sum, s) => sum + parseFloat(s.amount || "0"), 0);

    // Determine final Y position from table
    // @ts-ignore
    const finalY = doc.lastAutoTable?.finalY || 150;

    // Total Amount Section
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    // Add styling equivalent to font-bold
    doc.text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, 130, finalY + 15);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Thanks for Coming", 14, finalY + 40);
    doc.text("Biswaranjan Behera", 14, finalY + 46);
    doc.text("83398 27082", 14, finalY + 52);

    // Trigger Save
    doc.save(`Invoice_${data.customerName.replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`);
}
