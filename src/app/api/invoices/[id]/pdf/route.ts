import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderToBuffer } from "@react-pdf/renderer";
import InvoicePDF from "@/components/invoices/InvoicePDF";
import type { InvoiceItem, Payment } from "@/types/database";
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Verify the requester is authenticated (API routes bypass the proxy auth guard)
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await authClient
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && profile?.role !== "viewer" && profile?.role !== "investor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Use admin client to bypass RLS for internal data fetch
  const supabase = createAdminClient();

  const [{ data: invoice }, { data: items }, { data: payments }] = await Promise.all([
    supabase
      .from("invoices")
      .select("*, clients(name, email, phone, company), projects(name)")
      .eq("id", id)
      .single(),
    supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("sort_order"),
    supabase
      .from("payments")
      .select("*")
      .eq("invoice_id", id)
      .order("paid_at", { ascending: false }),
  ]);

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const client = invoice.clients as { name: string; email: string; phone: string | null; company: string | null } | null;
  const project = invoice.projects as { name: string } | null;
  const typedItems = (items || []) as InvoiceItem[];
  const typedPayments = (payments || []) as Payment[];
  const logoSrc = loadLogoBase64();

  const docType = (invoice.doc_type as "invoice" | "quotation") || "invoice";
  const isQuotation = docType === "quotation";

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(
      InvoicePDF({
      docType,
      invoiceNumber: invoice.invoice_number,
      status: invoice.status,
      dueDate: invoice.due_date,
      createdAt: invoice.created_at,
      clientName: client?.name || "Unknown",
      clientEmail: client?.email || "",
      clientCompany: client?.company,
      clientPhone: client?.phone,
      projectName: project?.name || null,
      items: typedItems.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unit_rate: i.unit_rate,
        amount: i.amount,
      })),
      total: invoice.amount,
      discountAmount: invoice.discount_amount ?? 0,
      paidAmount: invoice.paid_amount,
      notes: invoice.notes,
      paymentPlanEnabled: invoice.payment_plan_enabled ?? false,
      installmentCount: invoice.installment_count ?? null,
      installmentInterval: invoice.installment_interval ?? null,
      paymentPlanType: invoice.payment_plan_type ?? null,
      paymentPlanSchedule: invoice.payment_plan_schedule
        ? (invoice.payment_plan_schedule as { label: string; amount_cents?: number; amount?: number }[]).map((row) => ({
            label: row.label,
            amount: row.amount_cents ?? row.amount ?? 0,
          }))
        : null,
      payments: typedPayments.map((p) => ({
        amount: p.amount,
        method: p.method,
        reference: p.reference,
        paid_at: p.paid_at,
      })),
      logoSrc,
      }),
    );
  } catch (err) {
    console.error("[PDF] renderToBuffer failed:", err);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }

  const filename = isQuotation
    ? invoice.invoice_number.replace("QUO", "Quotation")
    : invoice.invoice_number;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}
