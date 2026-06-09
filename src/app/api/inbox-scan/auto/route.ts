import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { searchPOPEmails, downloadAttachment } from "@/lib/gmail";
import { extractPaymentFromPDF, matchInvoice, parseAmount, parseReference, parseDate, type OpenInvoice } from "@/lib/pop-parser";
import { sendReceiptAction } from "@/app/(dashboard)/invoices/actions";

const TODAY = new Date().toISOString().split("T")[0];

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export async function GET(req: Request) {
  // Allow Vercel cron (Bearer CRON_SECRET) OR logged-in admin/viewer
  const auth = req.headers.get("authorization");
  const isCron = auth === `Bearer ${process.env.CRON_SECRET}`;

  if (!isCron) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "viewer") {
      return new Response("Forbidden", { status: 403 });
    }
  }

  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_REFRESH_TOKEN) {
    return Response.json({ error: "Gmail integration not configured." }, { status: 503 });
  }

  const devBypass = process.env.NODE_ENV !== "production" &&
    new URL(req.url).searchParams.get("dev") === "1";

  const admin = createAdminClient();

  // Fetch open invoices
  const { data: rawInvoices } = await admin
    .from("invoices")
    .select("id, invoice_number, amount, paid_amount, due_date, category, clients(id, name, email, company)")
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

  type ResultEntry = {
    emailId: string;
    subject: string;
    from: string;
    action: "auto_approved" | "notification_created" | "skipped_today" | "already_processed" | "error";
    invoiceNumber?: string;
    amountCents?: number;
    confidence?: string;
    receiptSent?: boolean;
    error?: string;
  };

  const results: ResultEntry[] = [];

  for (const email of emails) {
    const emailDate = new Date(parseInt(email.internalDate)).toISOString().split("T")[0];

    // Skip today unless dev bypass
    if (emailDate === TODAY && !devBypass) {
      results.push({ emailId: email.id, subject: email.subject, from: email.from, action: "skipped_today" });
      continue;
    }

    // Skip already-processed emails (tracked via payment notes)
    const { count } = await admin
      .from("payments")
      .select("id", { count: "exact", head: true })
      .ilike("notes", `%email:${email.id}%`);

    if ((count ?? 0) > 0) {
      results.push({ emailId: email.id, subject: email.subject, from: email.from, action: "already_processed" });
      continue;
    }

    // Parse PDF, then fall back to email body text if PDF yields nothing
    let parsed = { amountCents: null as number | null, reference: null as string | null, date: null as string | null };
    const firstPdf = email.attachments[0];
    if (firstPdf) {
      try {
        const buffer = await downloadAttachment(email.id, firstPdf.attachmentId);
        parsed = await extractPaymentFromPDF(buffer);
      } catch { /* continue without parsed data */ }
    }
    const bodyText = email.bodyText ?? "";
    if (bodyText && (parsed.amountCents === null || parsed.reference === null || parsed.date === null)) {
      parsed = {
        amountCents: parsed.amountCents ?? parseAmount(bodyText),
        reference: parsed.reference ?? parseReference(bodyText),
        date: parsed.date ?? parseDate(bodyText),
      };
    }

    const emailText = `${email.subject} ${email.snippet} ${bodyText}`;
    const match = matchInvoice(parsed, openInvoices, emailText);

    // LOW or no match — create a notification for manual review
    if (!match || (match.confidence !== "high" && match.confidence !== "medium")) {
      await admin.from("notifications").insert({
        type: "inbox_scan_review",
        title: "Proof of payment needs review",
        body: `Email from ${email.from} — "${email.subject}" — could not be auto-matched. Open Inbox Scan to review manually.`,
        link: "/invoices?tab=inbox",
      }).maybeSingle();
      results.push({ emailId: email.id, subject: email.subject, from: email.from, action: "notification_created" });
      continue;
    }

    const outstanding = match.invoice.amount - match.invoice.paid_amount;
    // For HIGH confidence with no parsed amount, assume full outstanding payment
    const amountCents = parsed.amountCents ?? (match.confidence === "high" ? outstanding : null);
    if (!amountCents || amountCents <= 0) {
      await admin.from("notifications").insert({
        type: "inbox_scan_review",
        title: "Proof of payment needs review",
        body: `Matched to ${match.invoice.invoice_number} (${match.confidence} confidence) but could not extract payment amount. Review manually.`,
        link: "/invoices?tab=inbox",
      }).maybeSingle();
      results.push({ emailId: email.id, subject: email.subject, from: email.from, action: "notification_created", invoiceNumber: match.invoice.invoice_number, confidence: match.confidence });
      continue;
    }

    const paidAt = (parsed.date && parsed.date !== TODAY) ? parsed.date : yesterday();
    const reference = parsed.reference ?? match.invoice.invoice_number;

    // Record payment
    const { data: payment, error: payErr } = await admin
      .from("payments")
      .insert({
        invoice_id: match.invoice.id,
        amount: amountCents,
        method: "eft",
        reference,
        paid_at: paidAt,
        notes: `Auto-recorded via inbox scan — email:${email.id}`,
      })
      .select("id")
      .single();

    if (payErr || !payment) {
      results.push({
        emailId: email.id, subject: email.subject, from: email.from,
        action: "error", invoiceNumber: match.invoice.invoice_number,
        error: payErr?.message ?? "Insert failed",
      });
      continue;
    }

    // Update invoice paid_amount + status
    const newPaidAmount = match.invoice.paid_amount + amountCents;
    const newStatus = newPaidAmount >= match.invoice.amount ? "paid"
      : newPaidAmount > 0 ? "partial"
      : "sent";

    await admin.from("invoices").update({
      paid_amount: newPaidAmount,
      status: newStatus,
      paid_date: newStatus === "paid" ? paidAt : null,
    }).eq("id", match.invoice.id);

    // Auto-dismiss reminders if fully paid
    if (newStatus === "paid") {
      await admin
        .from("payment_reminders")
        .update({ status: "dismissed" })
        .eq("invoice_id", match.invoice.id)
        .in("status", ["pending", "approved"]);
    }

    // Create income entry
    const inv = rawInvoices?.find((i) => i.id === match.invoice.id);
    await admin.from("income_entries").insert({
      source: "invoice",
      invoice_id: match.invoice.id,
      description: `Payment — ${match.invoice.invoice_number} (${match.invoice.client})`,
      amount: amountCents,
      date: paidAt,
      category: (inv as { category?: string } | null)?.category ?? "web_dev",
    }).maybeSingle();

    // Send receipt
    const receiptResult = await sendReceiptAction(payment.id);
    const receiptSent = !("error" in receiptResult);

    results.push({
      emailId: email.id,
      subject: email.subject,
      from: email.from,
      action: "auto_approved",
      invoiceNumber: match.invoice.invoice_number,
      amountCents,
      confidence: match.confidence,
      receiptSent,
    });
  }

  const autoApproved = results.filter((r) => r.action === "auto_approved").length;
  const needsReview = results.filter((r) => r.action === "notification_created").length;
  const skipped = results.filter((r) => r.action === "already_processed" || r.action === "skipped_today").length;

  return Response.json({ autoApproved, needsReview, skipped, total: emails.length, results });
}
