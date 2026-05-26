import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createAdminClient } from "@/lib/supabase/admin";
import QuotationPDF from "@/components/documents/QuotationPDF";
import fs from "fs";
import path from "path";

function loadLogoBase64(): string | null {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public", "favicon.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: quote, error } = await supabase
    .from("quotations")
    .select(`
      id, quote_number, status, subtotal, discount_type, discount_value, discount_amount, total,
      notes, terms, payment_plan_enabled, payment_plan_type, payment_plan_schedule,
      created_at, expires_at,
      clients(name, email, phone, company),
      projects(name),
      quotation_line_items(description, quantity, unit_rate, amount, sort_order)
    `)
    .eq("acceptance_token", token)
    .single();

  if (error || !quote) {
    return new Response("Quotation not found", { status: 404 });
  }

  const client = quote.clients as unknown as { name: string; email: string; phone: string | null; company: string | null } | null;
  const project = quote.projects as unknown as { name: string } | null;
  const lineItems = (
    (quote.quotation_line_items as unknown as { description: string; quantity: number; unit_rate: number; amount: number; sort_order: number }[]) ?? []
  ).sort((a, b) => a.sort_order - b.sort_order);

  void loadLogoBase64(); // preload, not used in react-pdf (URL-based fonts work fine)

  const buffer = await renderToBuffer(
    QuotationPDF({
      quoteNumber: quote.quote_number,
      clientName: client?.name ?? "Client",
      clientEmail: client?.email,
      clientCompany: client?.company,
      clientPhone: client?.phone,
      projectName: project?.name,
      lineItems,
      subtotal: quote.subtotal,
      discountType: quote.discount_type,
      discountValue: quote.discount_value,
      discountAmount: quote.discount_amount,
      total: quote.total,
      notes: quote.notes,
      terms: quote.terms,
      paymentPlanEnabled: quote.payment_plan_enabled,
      paymentPlanType: quote.payment_plan_type,
      paymentPlanSchedule: quote.payment_plan_schedule as { label: string; amount_cents: number; due_date?: string }[] | null,
      createdAt: quote.created_at,
      expiresAt: quote.expires_at,
    })
  );

  const filename = `${quote.quote_number}.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
