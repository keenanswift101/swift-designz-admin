import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchPOPEmails, downloadAttachment } from "@/lib/gmail";
import { extractPaymentFromPDF, matchInvoice, type OpenInvoice } from "@/lib/pop-parser";
import { sendReceiptAction } from "@/app/(dashboard)/invoices/actions";

const TODAY = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

// ── GET — scan inbox ──────────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_REFRESH_TOKEN) {
    return Response.json({ error: "Gmail integration not configured. Add GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN to environment variables." }, { status: 503 });
  }

  // Fetch open invoices for matching
  const { data: rawInvoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount, paid_amount, due_date, clients(name)")
    .neq("doc_type", "quotation")
    .in("status", ["sent", "partial", "overdue"])
    .order("created_at", { ascending: false });

  const openInvoices: OpenInvoice[] = (rawInvoices ?? []).map((inv) => ({
    id: inv.id,
    invoice_number: inv.invoice_number,
    amount: inv.amount,
    paid_amount: inv.paid_amount,
    due_date: inv.due_date,
    client: (inv.clients as unknown as { name: string } | null)?.name ?? "Unknown",
  }));

  let emails;
  try {
    emails = await searchPOPEmails();
  } catch (err) {
    return Response.json({ error: `Gmail scan failed: ${(err as Error).message}` }, { status: 500 });
  }

  const results = [];

  for (const email of emails) {
    // Skip emails received today (user constraint)
    const emailDate = new Date(parseInt(email.internalDate)).toISOString().split("T")[0];
    if (emailDate === TODAY) continue;

    let parsed = { amountCents: null as number | null, reference: null as string | null, date: null as string | null };

    // Parse the first PDF attachment
    const firstPdf = email.attachments[0];
    if (firstPdf) {
      try {
        const buffer = await downloadAttachment(email.id, firstPdf.attachmentId);
        parsed = await extractPaymentFromPDF(buffer);
      } catch {
        // Continue without parsed data — still show email for manual matching
      }
    }

    const emailText = `${email.subject} ${email.snippet}`;
    const match = matchInvoice(parsed, openInvoices, emailText);

    results.push({
      emailId: email.id,
      subject: email.subject,
      from: email.from,
      receivedAt: emailDate,
      parsed,
      matchedInvoice: match ? {
        id: match.invoice.id,
        invoice_number: match.invoice.invoice_number,
        amount: match.invoice.amount,
        paid_amount: match.invoice.paid_amount,
        outstanding: match.invoice.amount - match.invoice.paid_amount,
        client: match.invoice.client,
      } : null,
      confidence: match?.confidence ?? "none",
      allOpenInvoices: openInvoices, // send so UI can let user manually pick
    });
  }

  // Sort: high confidence first
  const order = { high: 0, medium: 1, low: 2, none: 3 };
  type Conf = keyof typeof order;
  results.sort((a, b) => order[a.confidence as Conf] - order[b.confidence as Conf]);

  return Response.json({ results, scannedCount: emails.length });
}

// ── POST — approve a match ────────────────────────────────────────────────────

interface ApproveBody {
  invoiceId: string;
  amountCents: number;
  paidAt: string;       // YYYY-MM-DD — must NOT be today
  reference: string | null;
  emailId: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  let body: ApproveBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { invoiceId, amountCents, paidAt, reference } = body;

  if (!invoiceId || !amountCents || !paidAt) {
    return Response.json({ error: "Missing required fields: invoiceId, amountCents, paidAt" }, { status: 400 });
  }

  if (paidAt === TODAY) {
    return Response.json({ error: "Cannot record payments dated today. If this is a valid payment, add it manually tomorrow." }, { status: 422 });
  }

  if (amountCents <= 0) {
    return Response.json({ error: "Amount must be positive" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch invoice
  const { data: invoice } = await admin
    .from("invoices")
    .select("id, invoice_number, amount, paid_amount, status, category, clients(id, name, email, company)")
    .eq("id", invoiceId)
    .single();

  if (!invoice) return Response.json({ error: "Invoice not found" }, { status: 404 });

  const client = invoice.clients as unknown as { id: string; name: string; email: string; company: string | null } | null;

  // 1. Insert payment record
  const { data: payment, error: payErr } = await admin
    .from("payments")
    .insert({
      invoice_id: invoiceId,
      amount: amountCents,
      method: "eft",
      reference: reference ?? null,
      paid_at: paidAt,
      notes: "Recorded via inbox scan agent",
    })
    .select("id")
    .single();

  if (payErr || !payment) {
    return Response.json({ error: `Failed to record payment: ${payErr?.message}` }, { status: 500 });
  }

  // 2. Update invoice paid_amount + status
  const newPaidAmount = (invoice.paid_amount as number) + amountCents;
  const newStatus = newPaidAmount >= (invoice.amount as number) ? "paid"
    : newPaidAmount > 0 ? "partial"
    : "sent";

  await admin.from("invoices").update({
    paid_amount: newPaidAmount,
    status: newStatus,
    paid_date: newStatus === "paid" ? paidAt : null,
  }).eq("id", invoiceId);

  // 3. Auto-dismiss pending reminders if now fully paid
  if (newStatus === "paid") {
    await admin
      .from("payment_reminders")
      .update({ status: "dismissed" })
      .eq("invoice_id", invoiceId)
      .in("status", ["pending", "approved"]);
  }

  // 4. Create income entry for accounting
  await admin.from("income_entries").insert({
    source: "invoice",
    invoice_id: invoiceId,
    description: `Payment — ${invoice.invoice_number}${client ? ` (${client.name})` : ""}`,
    amount: amountCents,
    date: paidAt,
    category: invoice.category ?? "web_development",
  }).maybeSingle();

  // 5. Send receipt — calls the existing receipt action which generates SD26-REC-xxx and emails it
  const receiptResult = await sendReceiptAction(payment.id);
  if ("error" in receiptResult) {
    // Payment was recorded successfully even if receipt failed — report warning
    return Response.json({
      ok: true,
      paymentId: payment.id,
      warning: `Payment recorded but receipt email failed: ${receiptResult.error}`,
    });
  }

  return Response.json({ ok: true, paymentId: payment.id });
}
