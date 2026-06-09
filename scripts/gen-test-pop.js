/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generates a minimal valid PDF proof-of-payment for inbox scan testing.
 * Usage: node scripts/gen-test-pop.js [invoice_number] [amount] [date]
 * Example: node scripts/gen-test-pop.js SD26-INV-010 "2,000.00" 2026-06-08
 */

const fs = require("fs");
const path = require("path");

const invoiceNumber = process.argv[2] || "SD26-INV-010";
const amount = process.argv[3] || "2,000.00";
const paymentDate = process.argv[4] || "2026-06-08";

// Build content stream text
const lines = [
  "PROOF OF PAYMENT",
  "",
  `Invoice Reference: ${invoiceNumber}`,
  `Amount: N$ ${amount}`,
  `Payment Date: ${paymentDate}`,
  `Reference: ${invoiceNumber}`,
  "",
  "Bank: Bank Windhoek",
  "Account: 8056219849",
  "Branch: Maerua Mall (483-872)",
  "Method: EFT Transfer",
  "Status: COMPLETED",
];

// Escape PDF string special chars
function pdfStr(s) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

// Build the BT...ET content stream
let streamLines = ["BT", "/F1 12 Tf", "50 780 Td"];
for (const line of lines) {
  streamLines.push(`(${pdfStr(line)}) Tj`);
  streamLines.push("0 -20 Td");
}
streamLines.push("ET");
const streamContent = streamLines.join("\n");
const streamLength = Buffer.byteLength(streamContent, "latin1");

// Build PDF objects
const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
const obj3 =
  "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]\n" +
  "   /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n";
const obj4 =
  `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
const obj5 =
  "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

const header = "%PDF-1.4\n";

// Compute byte offsets
const off1 = header.length;
const off2 = off1 + Buffer.byteLength(obj1, "latin1");
const off3 = off2 + Buffer.byteLength(obj2, "latin1");
const off4 = off3 + Buffer.byteLength(obj3, "latin1");
const off5 = off4 + Buffer.byteLength(obj4, "latin1");
const xrefPos = off5 + Buffer.byteLength(obj5, "latin1");

function pad10(n) {
  return String(n).padStart(10, "0");
}

const xref =
  "xref\n" +
  "0 6\n" +
  `0000000000 65535 f \n` +
  `${pad10(off1)} 00000 n \n` +
  `${pad10(off2)} 00000 n \n` +
  `${pad10(off3)} 00000 n \n` +
  `${pad10(off4)} 00000 n \n` +
  `${pad10(off5)} 00000 n \n`;

const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

const pdfContent = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;

const outPath = path.join(__dirname, "test-pop.pdf");
fs.writeFileSync(outPath, pdfContent, "latin1");
console.log(`PDF written to ${outPath}`);
console.log(`Invoice: ${invoiceNumber} | Amount: N$ ${amount} | Date: ${paymentDate}`);
