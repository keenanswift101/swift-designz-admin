import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderToBuffer } from "@react-pdf/renderer";
import ReceiptPDF from "@/components/invoices/ReceiptPDF";
import fs from "fs";
import path from "path";

function loadLogoBase64(): string | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "favicon.png");
    const buf = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

// Route: GET /api/docs/receipts/[id]  where id = payments.id
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  const [{ data: payment }, { data: confirmation }] = await Promise.all([
    supabase
      .from("payments")
      .select("id, amount, method, reference, paid_at, invoice_id")
      .eq("id", id)
      .single(),
    supabase
      .from("payment_confirmations")
      .select("receipt_number")
      .eq("payment_id", id)
      .single(),
  ]);

  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  if (!confirmation) return NextResponse.json({ error: "Receipt not found — this payment has not been receipted yet" }, { status: 404 });

  const { data: invoice } = await supabase
    .from("invoices")
    .select("invoice_number, amount, paid_amount, clients(name, email, company)")
    .eq("id", payment.invoice_id)
    .single();

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const client = invoice.clients as unknown as { name: string; email: string; company: string | null } | null;

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(
      ReceiptPDF({
        receiptNumber: confirmation.receipt_number,
        invoiceNumber: invoice.invoice_number,
        clientName: client?.name ?? "Client",
        clientEmail: client?.email ?? "",
        clientCompany: client?.company ?? null,
        paymentAmount: payment.amount,
        paymentMethod: payment.method,
        paymentReference: payment.reference,
        paymentDate: payment.paid_at,
        invoiceTotal: invoice.amount,
        invoicePaidTotal: invoice.paid_amount,
        logoSrc: loadLogoBase64(),
      })
    );
  } catch (err) {
    console.error("[ReceiptPDF] renderToBuffer failed:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }

  const safeNum = confirmation.receipt_number.replace(/[^a-zA-Z0-9-]/g, "-");
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeNum}.pdf"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}
