/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Sends the test proof-of-payment PDF to info@swiftdesignz.co.za via Resend.
 * Usage: node scripts/send-test-pop.js
 */

const fs = require("fs");
const path = require("path");

const env = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const RESEND_API_KEY = env.match(/RESEND_API_KEY=(.+)/)?.[1]?.trim();

if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY not found in .env.local");
  process.exit(1);
}

const pdfPath = path.join(__dirname, "test-pop.pdf");
if (!fs.existsSync(pdfPath)) {
  console.error("test-pop.pdf not found. Run: node scripts/gen-test-pop.js first");
  process.exit(1);
}

const pdfBuffer = fs.readFileSync(pdfPath);
const pdfBase64 = pdfBuffer.toString("base64");

const payload = {
  from: "Keenan Husselmann <keenan@swiftdesignz.co.za>",
  to: ["info@swiftdesignz.co.za"],
  subject: "Proof of Payment - SD26-INV-011",
  text: [
    "Hi Swift Designz,",
    "",
    "Please find attached my proof of payment for invoice SD26-INV-011.",
    "",
    "Invoice Reference: SD26-INV-011",
    "Amount Paid: N$ 1,500.00",
    "Payment Date: 2026-06-08",
    "Method: EFT Transfer",
    "Bank: Bank Windhoek",
    "Account: 8056219849",
    "Reference: SD26-INV-011",
    "",
    "Regards,",
    "Keenan Husselmann",
  ].join("\n"),
  attachments: [
    {
      filename: "proof-of-payment-SD26-INV-011.pdf",
      content: pdfBase64,
    },
  ],
};

fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
})
  .then((r) => r.json())
  .then((d) => {
    if (d.id) {
      console.log("Email sent successfully. Resend ID:", d.id);
      console.log("Delivered to: info@swiftdesignz.co.za");
      console.log("Subject: Proof of Payment - SD26-INV-011");
      console.log("Attachment: proof-of-payment-SD26-INV-011.pdf");
    } else {
      console.error("Send failed:", JSON.stringify(d, null, 2));
    }
  })
  .catch((e) => console.error("Request failed:", e.message));
