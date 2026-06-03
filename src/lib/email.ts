import { Resend } from "resend";
import { escapeHtml } from "@/lib/utils";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendDocumentEmailParams {
  to: string;
  clientName: string;
  subject: string;
  message: string;
  templateLabel: string;
  docUrl: string;
}

export async function sendDocumentEmail({
  to,
  clientName,
  subject,
  message,
  templateLabel,
  docUrl,
}: SendDocumentEmailParams) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0c2020,#081818);padding:28px 32px;border-bottom:1px solid #1a3030;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#30B0B0;">Swift Designz</p>
              <p style="margin:6px 0 0;font-size:11px;color:#4a8080;letter-spacing:2px;text-transform:uppercase;">swiftdesignz.co.za</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#30B0B0;letter-spacing:1px;text-transform:uppercase;">Document Ready</p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111111;line-height:1.3;">${templateLabel}</h1>
              <p style="margin:0 0 16px;font-size:14px;color:#666666;line-height:1.6;">Hi ${clientName},</p>
              ${message ? `<p style="margin:0 0 24px;font-size:14px;color:#444444;line-height:1.6;">${escapeHtml(message).replace(/\n/g, "<br/>")}</p>` : ""}
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background:#30B0B0;border-radius:8px;">
                    <a href="${docUrl}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:0.5px;">View Document</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:12px;color:#888888;line-height:1.6;">If the button doesn't work, copy this URL into your browser:<br/><a href="${docUrl}" style="color:#30B0B0;word-break:break-all;">${docUrl}</a></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:11px;color:#999999;line-height:1.6;">Swift Designz · admin.swiftdesignz.co.za · keenan@swiftdesignz.co.za</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: "Swift Designz <keenan@swiftdesignz.co.za>",
    to,
    subject,
    html,
  });
}

// ── Quotation email ───────────────────────────────────────────────────────────

const APP_URL = process.env.EMAIL_BASE_URL ?? "https://admin.swiftdesignz.co.za";

interface QuotationLineItem {
  description: string;
  quantity: number;
  unit_rate: number;
  amount: number;
}

interface SendQuotationEmailParams {
  to: string;
  clientName: string;
  quoteNumber: string;
  total: number; // cents
  expiresAt: string; // ISO date string
  acceptanceToken: string;
  lineItems: QuotationLineItem[];
  notes?: string | null;
  pdfBuffer?: Buffer;
}

function fmtR(cents: number) {
  return `R ${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function sendQuotationEmail({
  to,
  clientName,
  quoteNumber,
  total,
  expiresAt,
  acceptanceToken,
  lineItems,
  notes,
  pdfBuffer,
}: SendQuotationEmailParams) {
  const acceptUrl = `${APP_URL}/accept/${acceptanceToken}`;
  const expiryFormatted = new Date(expiresAt).toLocaleDateString("en-ZA", {
    day: "numeric", month: "long", year: "numeric",
  });

  const itemRows = lineItems.map((item) => `
    <tr>
      <td style="padding:10px 12px;font-size:13px;color:#333333;border-bottom:1px solid #eeeeee;">${escapeHtml(item.description)}</td>
      <td style="padding:10px 12px;font-size:13px;color:#777777;text-align:center;border-bottom:1px solid #eeeeee;">${item.quantity}</td>
      <td style="padding:10px 12px;font-size:13px;color:#777777;text-align:right;border-bottom:1px solid #eeeeee;">${fmtR(item.unit_rate)}</td>
      <td style="padding:10px 12px;font-size:13px;color:#111111;text-align:right;border-bottom:1px solid #eeeeee;font-weight:600;">${fmtR(item.amount)}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0c2020,#081818);padding:28px 32px;border-bottom:1px solid #1a3030;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#30B0B0;">Swift Designz</p>
              <p style="margin:6px 0 0;font-size:11px;color:#4a8080;letter-spacing:2px;text-transform:uppercase;">swiftdesignz.co.za</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 6px;font-size:13px;color:#30B0B0;letter-spacing:1px;text-transform:uppercase;">Quotation for Approval</p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111111;line-height:1.3;">${escapeHtml(quoteNumber)}</h1>

              <p style="margin:0 0 24px;font-size:14px;color:#666666;line-height:1.6;">Hi ${escapeHtml(clientName)},</p>
              <p style="margin:0 0 24px;font-size:14px;color:#444444;line-height:1.6;">
                Please find your quotation from Swift Designz attached to this email as a PDF. Review the details and click the button below to accept online.
                This quotation expires on <strong style="color:#111111;">${expiryFormatted}</strong>.
              </p>

              <!-- Line items table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
                <thead>
                  <tr style="background:#f8f8f8;">
                    <th style="padding:10px 12px;font-size:11px;color:#888888;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Description</th>
                    <th style="padding:10px 12px;font-size:11px;color:#888888;text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
                    <th style="padding:10px 12px;font-size:11px;color:#888888;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Rate</th>
                    <th style="padding:10px 12px;font-size:11px;color:#888888;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Amount</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
                <tfoot>
                  <tr style="background:#f8f8f8;">
                    <td colspan="3" style="padding:12px 16px;font-size:14px;color:#666666;font-weight:600;">Total</td>
                    <td style="padding:12px 16px;font-size:18px;color:#30B0B0;font-weight:700;text-align:right;">${fmtR(total)}</td>
                  </tr>
                </tfoot>
              </table>

              ${notes ? `<div style="background:#f0fafa;border-left:3px solid #30B0B0;padding:12px 16px;margin:0 0 24px;border-radius:0 6px 6px 0;"><p style="margin:0;font-size:13px;color:#555555;line-height:1.6;">${escapeHtml(notes)}</p></div>` : ""}

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#30B0B0;border-radius:8px;">
                    <a href="${acceptUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:0.5px;">
                      Review &amp; Accept Quotation &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:#888888;line-height:1.6;">
                Or copy this link into your browser:<br/>
                <a href="${acceptUrl}" style="color:#30B0B0;word-break:break-all;">${acceptUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:11px;color:#999999;line-height:1.6;">Swift Designz &middot; swiftdesignz.co.za &middot; keenan@swiftdesignz.co.za</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: "Swift Designz <keenan@swiftdesignz.co.za>",
    to,
    subject: `Quotation ${quoteNumber} — ${fmtR(total)} | Swift Designz`,
    html,
    ...(pdfBuffer
      ? { attachments: [{ filename: `${quoteNumber}.pdf`, content: pdfBuffer }] }
      : {}),
  });
}

// ── Invoice email ─────────────────────────────────────────────────────────────

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_rate: number;
  amount: number;
}

interface PaymentPlanInstallmentEmail {
  label: string;
  amount_cents: number;
  due_date: string;
  installment_number: number;
}

interface SendInvoiceEmailParams {
  to: string;
  clientName: string;
  invoiceNumber: string;
  total: number; // cents
  dueDate: string; // ISO date string
  lineItems: InvoiceLineItem[];
  notes?: string | null;
  pdfBuffer?: Buffer;
  paymentPlanEnabled?: boolean;
  paymentPlanSchedule?: PaymentPlanInstallmentEmail[] | null;
  installmentNumber?: number | null;
}

export async function sendInvoiceEmail({
  to,
  clientName,
  invoiceNumber,
  total,
  dueDate,
  lineItems,
  notes,
  pdfBuffer,
  paymentPlanEnabled,
  paymentPlanSchedule,
  installmentNumber,
}: SendInvoiceEmailParams) {
  const dueDateFormatted = new Date(dueDate).toLocaleDateString("en-ZA", {
    day: "numeric", month: "long", year: "numeric",
  });

  const hasplan = paymentPlanEnabled && paymentPlanSchedule && paymentPlanSchedule.length > 1;
  const totalInstallments = hasplan ? paymentPlanSchedule!.length : 0;

  const itemRows = lineItems.map((item) => `
    <tr>
      <td style="padding:10px 12px;font-size:13px;color:#333333;border-bottom:1px solid #eeeeee;">${escapeHtml(item.description)}</td>
      <td style="padding:10px 12px;font-size:13px;color:#777777;text-align:center;border-bottom:1px solid #eeeeee;">${item.quantity}</td>
      <td style="padding:10px 12px;font-size:13px;color:#777777;text-align:right;border-bottom:1px solid #eeeeee;">${fmtR(item.unit_rate)}</td>
      <td style="padding:10px 12px;font-size:13px;color:#111111;text-align:right;border-bottom:1px solid #eeeeee;font-weight:600;">${fmtR(item.amount)}</td>
    </tr>`).join("");

  const scheduleRows = hasplan
    ? paymentPlanSchedule!.map((inst) => {
        const isCurrent = inst.installment_number === installmentNumber;
        const rowBg = isCurrent ? "#e0f0f0" : "transparent";
        const amtColor = isCurrent ? "#30B0B0" : "#555555";
        const labelColor = isCurrent ? "#111111" : "#777777";
        const instDate = new Date(inst.due_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
        return `
    <tr style="background:${rowBg};border-bottom:1px solid #eeeeee;">
      <td style="padding:9px 12px;font-size:12px;color:${labelColor};font-weight:${isCurrent ? "700" : "400"};">${inst.installment_number}${isCurrent ? " ← this invoice" : ""}</td>
      <td style="padding:9px 12px;font-size:12px;color:${labelColor};">${escapeHtml(inst.label)}</td>
      <td style="padding:9px 12px;font-size:12px;color:#888888;text-align:center;">${instDate}</td>
      <td style="padding:9px 12px;font-size:12px;color:${amtColor};text-align:right;font-weight:${isCurrent ? "700" : "400"};">${fmtR(inst.amount_cents)}</td>
    </tr>`;
      }).join("")
    : "";

  const planSection = hasplan ? `
    <!-- Payment plan -->
    <div style="background:#f0fafa;border:1px solid #c0e8e8;border-radius:8px;margin:0 0 24px;overflow:hidden;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr style="background:#e8f5f5;">
          <td colspan="4" style="padding:10px 12px;font-size:11px;font-weight:700;color:#30B0B0;letter-spacing:2px;text-transform:uppercase;border-bottom:1px solid #c0e8e8;">
            Payment Plan — Instalment ${installmentNumber} of ${totalInstallments}
          </td>
        </tr>
        <tr style="background:#f5fafa;">
          <th style="padding:8px 12px;font-size:10px;color:#888888;text-align:left;font-weight:600;text-transform:uppercase;border-bottom:1px solid #eeeeee;">#</th>
          <th style="padding:8px 12px;font-size:10px;color:#888888;text-align:left;font-weight:600;text-transform:uppercase;border-bottom:1px solid #eeeeee;">Description</th>
          <th style="padding:8px 12px;font-size:10px;color:#888888;text-align:center;font-weight:600;text-transform:uppercase;border-bottom:1px solid #eeeeee;">Due</th>
          <th style="padding:8px 12px;font-size:10px;color:#888888;text-align:right;font-weight:600;text-transform:uppercase;border-bottom:1px solid #eeeeee;">Amount</th>
        </tr>
        ${scheduleRows}
      </table>
      <p style="margin:0;padding:10px 12px;font-size:11px;color:#888888;border-top:1px solid #eeeeee;">
        The remaining instalments will be invoiced separately as they fall due.
      </p>
    </div>` : "";

  const introText = hasplan
    ? `Please find your invoice from Swift Designz attached as a PDF. This invoice covers <strong style="color:#111111;">Instalment ${installmentNumber} of ${totalInstallments}</strong> on your payment plan. Payment of <strong style="color:#30B0B0;">${fmtR(total)}</strong> is due by <strong style="color:#111111;">${dueDateFormatted}</strong>.`
    : `Please find your invoice from Swift Designz attached to this email as a PDF. Payment of <strong style="color:#30B0B0;">${fmtR(total)}</strong> is due by <strong style="color:#111111;">${dueDateFormatted}</strong>.`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0c2020,#081818);padding:28px 32px;border-bottom:1px solid #1a3030;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;vertical-align:middle;">
                    <img src="${APP_URL}/logo.png" alt="Swift Designz" width="40" style="display:block;height:auto;border-radius:4px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#30B0B0;">Swift Designz</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#4a8080;letter-spacing:2px;text-transform:uppercase;">swiftdesignz.co.za</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 6px;font-size:13px;color:#30B0B0;letter-spacing:1px;text-transform:uppercase;">${hasplan ? `Tax Invoice — Instalment ${installmentNumber} of ${totalInstallments}` : "Tax Invoice"}</p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111111;line-height:1.3;">${escapeHtml(invoiceNumber)}</h1>

              <p style="margin:0 0 16px;font-size:14px;color:#666666;line-height:1.6;">Hi ${escapeHtml(clientName)},</p>
              <p style="margin:0 0 24px;font-size:14px;color:#444444;line-height:1.6;">${introText}</p>

              ${planSection}

              <!-- Line items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;margin:0 0 24px;">
                <thead>
                  <tr style="background:#f8f8f8;">
                    <th style="padding:10px 12px;font-size:11px;color:#888888;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Description</th>
                    <th style="padding:10px 12px;font-size:11px;color:#888888;text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
                    <th style="padding:10px 12px;font-size:11px;color:#888888;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Rate</th>
                    <th style="padding:10px 12px;font-size:11px;color:#888888;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Amount</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
                <tfoot>
                  <tr style="background:#f8f8f8;">
                    <td colspan="3" style="padding:12px 16px;font-size:14px;color:#666666;font-weight:600;">${hasplan ? `Instalment ${installmentNumber} Due` : "Total Due"}</td>
                    <td style="padding:12px 16px;font-size:18px;color:#30B0B0;font-weight:700;text-align:right;">${fmtR(total)}</td>
                  </tr>
                </tfoot>
              </table>

              ${notes ? `<div style="background:#f0fafa;border-left:3px solid #30B0B0;padding:12px 16px;margin:0 0 24px;border-radius:0 6px 6px 0;"><p style="margin:0;font-size:13px;color:#555555;line-height:1.6;">${escapeHtml(notes)}</p></div>` : ""}

              <p style="margin:0;font-size:13px;color:#777777;line-height:1.6;">
                Please use <strong style="color:#333333;">${escapeHtml(invoiceNumber)}</strong> as your payment reference.<br/>
                If you have any questions, reply to this email or contact us at keenan@swiftdesignz.co.za.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:11px;color:#999999;line-height:1.6;">Swift Designz &middot; swiftdesignz.co.za &middot; keenan@swiftdesignz.co.za</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: "Swift Designz <keenan@swiftdesignz.co.za>",
    to,
    subject: `Invoice ${invoiceNumber}${hasplan ? ` — Instalment ${installmentNumber}/${totalInstallments}` : ""} — ${fmtR(total)} due ${dueDateFormatted} | Swift Designz`,
    html,
    ...(pdfBuffer
      ? { attachments: [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer }] }
      : {}),
  });
}

// ── Receipt email ─────────────────────────────────────────────────────────────

interface SendReceiptEmailParams {
  to: string;
  clientName: string;
  receiptNumber: string;
  invoiceNumber: string;
  paymentAmount: number;
  paymentMethod: string;
  paymentDate: string;
  invoiceTotal: number;
  balance: number;
  pdfBuffer?: Buffer;
}

export async function sendReceiptEmail({
  to,
  clientName,
  receiptNumber,
  invoiceNumber,
  paymentAmount,
  paymentMethod,
  paymentDate,
  invoiceTotal,
  balance,
  pdfBuffer,
}: SendReceiptEmailParams) {
  const dateFormatted = new Date(paymentDate).toLocaleDateString("en-ZA", {
    day: "numeric", month: "long", year: "numeric",
  });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;max-width:520px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0c2020,#081818);padding:28px 32px;border-bottom:1px solid #1a3030;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;vertical-align:middle;">
                    <img src="${APP_URL}/logo.png" alt="Swift Designz" width="40" style="display:block;height:auto;border-radius:4px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#30B0B0;">Swift Designz</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#4a8080;letter-spacing:2px;text-transform:uppercase;">swiftdesignz.co.za</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 6px;font-size:13px;color:#30B0B0;letter-spacing:1px;text-transform:uppercase;">Payment Receipt</p>
              <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111111;">${escapeHtml(receiptNumber)}</h1>
              <p style="margin:0 0 24px;font-size:12px;color:#888888;">${dateFormatted}</p>

              <p style="margin:0 0 24px;font-size:14px;color:#666666;line-height:1.6;">Hi ${escapeHtml(clientName)},<br/>Thank you — your payment has been received and confirmed.</p>

              <!-- Amount paid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fafa;border:1px solid #c0e8e8;border-radius:8px;margin:0 0 20px;">
                <tr>
                  <td style="padding:16px 20px;font-size:13px;color:#30B0B0;font-weight:600;">Amount Paid</td>
                  <td style="padding:16px 20px;font-size:20px;font-weight:700;color:#30B0B0;text-align:right;">${fmtR(paymentAmount)}</td>
                </tr>
              </table>

              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border:1px solid #e5e5e5;border-radius:8px;margin:0 0 24px;">
                <tr><td colspan="2" style="padding:12px 16px;font-size:11px;font-weight:700;color:#30B0B0;letter-spacing:2px;text-transform:uppercase;border-bottom:1px solid #eeeeee;">Details</td></tr>
                <tr>
                  <td style="padding:10px 16px;font-size:12px;color:#888888;">Method</td>
                  <td style="padding:10px 16px;font-size:12px;color:#333333;font-weight:600;text-align:right;text-transform:capitalize;">${escapeHtml(paymentMethod)}</td>
                </tr>
                <tr style="border-top:1px solid #eeeeee;">
                  <td style="padding:10px 16px;font-size:12px;color:#888888;">Invoice</td>
                  <td style="padding:10px 16px;font-size:12px;color:#333333;font-weight:600;text-align:right;">${escapeHtml(invoiceNumber)}</td>
                </tr>
                <tr style="border-top:1px solid #eeeeee;">
                  <td style="padding:10px 16px;font-size:12px;color:#888888;">Invoice Total</td>
                  <td style="padding:10px 16px;font-size:12px;color:#333333;font-weight:600;text-align:right;">${fmtR(invoiceTotal)}</td>
                </tr>
                <tr style="border-top:1px solid #eeeeee;">
                  <td style="padding:10px 16px;font-size:12px;color:#888888;">Balance Remaining</td>
                  <td style="padding:10px 16px;font-size:12px;font-weight:700;text-align:right;color:#30B0B0;">${balance <= 0 ? "Paid in Full" : fmtR(balance)}</td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:#888888;line-height:1.6;">Your receipt is attached to this email as a PDF. Please keep it for your records.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:11px;color:#999999;">Swift Designz &middot; swiftdesignz.co.za &middot; keenan@swiftdesignz.co.za</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: "Swift Designz <keenan@swiftdesignz.co.za>",
    to,
    subject: `Payment Receipt ${receiptNumber} — ${fmtR(paymentAmount)} | Swift Designz`,
    html,
    ...(pdfBuffer
      ? { attachments: [{ filename: `${receiptNumber}.pdf`, content: pdfBuffer }] }
      : {}),
  });
}

// ── Admin notification email (quotation accepted) ────────────────────────────

interface SendQuotationAcceptedNotificationParams {
  quoteNumber: string;
  clientName: string;
  total: number;
  quotationId: string;
}

export async function sendQuotationAcceptedNotification({
  quoteNumber,
  clientName,
  total,
  quotationId,
}: SendQuotationAcceptedNotificationParams) {
  const adminUrl = `${APP_URL}/accounts-receivable/quotations/${quotationId}`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;max-width:520px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#0c2020,#081818);padding:24px 28px;border-bottom:1px solid #1a3030;">
              <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#30B0B0;">Swift Designz</p>
              <p style="margin:4px 0 0;font-size:10px;color:#4a8080;letter-spacing:2px;text-transform:uppercase;">Admin Notification</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 6px;font-size:12px;color:#30B0B0;letter-spacing:1px;text-transform:uppercase;">Quotation Accepted</p>
              <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#111111;line-height:1.3;">${escapeHtml(quoteNumber)}</h1>
              <p style="margin:0 0 20px;font-size:14px;color:#444444;line-height:1.6;">
                <strong style="color:#111111;">${escapeHtml(clientName)}</strong> has accepted this quotation.<br/>
                Total: <strong style="color:#30B0B0;">${fmtR(total)}</strong>
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#30B0B0;border-radius:8px;">
                    <a href="${adminUrl}" target="_blank" style="display:inline-block;padding:11px 24px;font-size:13px;font-weight:700;color:#fff;text-decoration:none;">
                      View Quotation &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:11px;color:#999999;">Swift Designz &middot; admin.swiftdesignz.co.za</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: "Swift Designz <keenan@swiftdesignz.co.za>",
    to: "info@swiftdesignz.co.za",
    subject: `✓ Quotation Accepted — ${quoteNumber} (${fmtR(total)})`,
    html,
  });
}

// ── Invite / OTP email ────────────────────────────────────────────────────────

interface SendInviteEmailParams {
  to: string;
  otp: string;
  /** Shown in greeting line. Defaults to the email address. */
  fullName?: string;
  /** If provided, displayed as the invite role. */
  role?: string;
  /** Optional personal message from the admin. */
  message?: string;
  /** Whether this is a first-time invite (true) or self-serve OTP request (false). */
  isInvite?: boolean;
}

export async function sendInviteEmail({
  to,
  otp,
  fullName,
  role,
  message,
  isInvite = false,
}: SendInviteEmailParams) {
  const displayName = escapeHtml(fullName || to);
  const roleLabel =
    role === "admin" ? "Admin" : role === "investor" ? "Investor" : "Viewer";
  const subject = isInvite
    ? "You're invited to the Swift Designz Admin Portal"
    : "Your Swift Designz sign-in code";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#0c2020,#081818);padding:28px 32px;border-bottom:1px solid #1a3030;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#30B0B0;">Swift Designz</p>
              <p style="margin:6px 0 0;font-size:11px;color:#4a8080;letter-spacing:2px;text-transform:uppercase;">Admin Portal</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#30B0B0;letter-spacing:1px;text-transform:uppercase;">${isInvite ? "You&rsquo;re Invited" : "Sign-In Code"}</p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111111;line-height:1.3;">${isInvite ? "Access the Admin Portal" : "Your one-time sign-in code"}</h1>
              <p style="margin:0 0 16px;font-size:14px;color:#666666;line-height:1.6;">Hi ${displayName},</p>
              ${
                isInvite
                  ? `<p style="margin:0 0 ${message ? "16px" : "24px"};font-size:14px;color:#444444;line-height:1.6;">
                      You have been invited by <strong style="color:#111111;">Keenan</strong> to access the
                      <strong style="color:#111111;">Swift Designz Admin Portal</strong> as a
                      <span style="color:#30B0B0;font-weight:700;">${roleLabel}</span>.
                    </p>
                    ${
                      message
                        ? `<div style="background:#f0fafa;border-left:3px solid #30B0B0;padding:12px 16px;margin:0 0 24px;border-radius:0 6px 6px 0;">
                            <p style="margin:0;font-size:14px;color:#444444;line-height:1.6;font-style:italic;">&ldquo;${escapeHtml(message)}&rdquo;</p>
                          </div>`
                        : ""
                    }`
                  : `<p style="margin:0 0 24px;font-size:14px;color:#444444;line-height:1.6;">Use the code below to sign in.</p>`
              }

              <!-- IMPORTANT banner -->
              <div style="background:#fffbeb;border:1px solid #f0d060;border-radius:8px;padding:12px 16px;margin:0 0 20px;">
                <p style="margin:0;font-size:13px;color:#b58900;line-height:1.5;">
                  <strong>Important:</strong> Copy the code below <em>before</em> clicking the button. You will need to paste it on the login page.
                </p>
              </div>

              <!-- OTP code -->
              <p style="margin:0 0 8px;font-size:12px;color:#30B0B0;letter-spacing:1px;text-transform:uppercase;">Your One-Time Code</p>
              <div style="background:#f0fafa;border:2px solid #30B0B0;border-radius:10px;padding:20px 32px;margin:0 0 24px;text-align:center;">
                <span style="font-size:40px;font-weight:700;color:#30B0B0;letter-spacing:14px;font-family:monospace;">${otp}</span>
              </div>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#30B0B0;border-radius:8px;">
                    <a href="https://admin.swiftdesignz.co.za/login?otp=1&email=${encodeURIComponent(to)}" target="_blank"
                      style="display:inline-block;padding:13px 32px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:0.5px;">
                      Sign in to Admin Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Instructions -->
              <p style="margin:0 0 6px;font-size:13px;color:#333333;font-weight:600;">How to sign in:</p>
              <ol style="margin:0 0 24px;padding-left:20px;font-size:13px;color:#555555;line-height:2.2;">
                <li><strong style="color:#b58900;">Copy the 6-digit code above first</strong></li>
                <li>Click the button above (or visit <a href="https://admin.swiftdesignz.co.za/login?otp=1&email=${encodeURIComponent(to)}" style="color:#30B0B0;">admin.swiftdesignz.co.za/login</a>)</li>
                <li>Click <strong style="color:#111111;">&ldquo;First time? Sign in with invite OTP&rdquo;</strong></li>
                <li>Enter your email: <strong style="color:#111111;">${escapeHtml(to)}</strong></li>
                ${isInvite ? '<li>Click <strong style="color:#111111;">"Send OTP Code"</strong> — or paste the code you already have</li>' : ""}
                <li>Enter the 6-digit code when prompted</li>
                ${isInvite ? '<li>Create your permanent password on the next screen</li>' : ""}
              </ol>

              <p style="margin:0 0 4px;font-size:12px;color:#888888;line-height:1.6;">This code expires in <strong style="color:#555555;">1 hour</strong>.</p>
              <p style="margin:0;font-size:12px;color:#888888;line-height:1.6;">If you did not expect this, you can safely ignore it.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:11px;color:#999999;line-height:1.6;">Swift Designz &middot; admin.swiftdesignz.co.za &middot; keenan@swiftdesignz.co.za</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: "Swift Designz <keenan@swiftdesignz.co.za>",
    to,
    subject,
    html,
  });
}

// ── Payment Reminder email ────────────────────────────────────────────────────

interface SendReminderEmailParams {
  to: string;
  clientName: string;
  invoiceNumber: string;
  outstanding: number;
  dueDate: string;
  stage: number;
  stageLabel: string;
  emailSubject: string | null;
}

export async function sendReminderEmail({
  to,
  clientName,
  invoiceNumber,
  outstanding,
  dueDate,
  stage,
  stageLabel,
  emailSubject,
}: SendReminderEmailParams) {
  const dueDateFormatted = new Date(dueDate).toLocaleDateString("en-ZA", {
    day: "numeric", month: "long", year: "numeric",
  });

  const isOverdue = stage >= 3;
  const accentColor = isOverdue ? "#d97706" : "#30B0B0";
  const accentBg = isOverdue ? "#fffbeb" : "#f0fafa";
  const accentBorder = isOverdue ? "#fde68a" : "#c0e8e8";

  const bodyText = stage === 1
    ? `This is a friendly reminder that payment of <strong style="color:${accentColor};">${fmtR(outstanding)}</strong> for invoice <strong style="color:#111111;">${escapeHtml(invoiceNumber)}</strong> is due in 3 days, on <strong style="color:#111111;">${dueDateFormatted}</strong>.`
    : stage === 2
    ? `This is a reminder that payment of <strong style="color:${accentColor};">${fmtR(outstanding)}</strong> for invoice <strong style="color:#111111;">${escapeHtml(invoiceNumber)}</strong> is due <strong style="color:#111111;">today, ${dueDateFormatted}</strong>.`
    : stage === 3
    ? `We note that payment of <strong style="color:${accentColor};">${fmtR(outstanding)}</strong> for invoice <strong style="color:#111111;">${escapeHtml(invoiceNumber)}</strong>, which was due on <strong style="color:#111111;">${dueDateFormatted}</strong>, is now 3 days overdue.`
    : `We urgently draw your attention to the outstanding payment of <strong style="color:${accentColor};">${fmtR(outstanding)}</strong> for invoice <strong style="color:#111111;">${escapeHtml(invoiceNumber)}</strong>, which is now 7 days overdue.`;

  const reminderHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;max-width:520px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#0c2020,#081818);padding:28px 32px;border-bottom:1px solid #1a3030;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#30B0B0;">Swift Designz</p>
              <p style="margin:4px 0 0;font-size:11px;color:#4a8080;letter-spacing:2px;text-transform:uppercase;">swiftdesignz.co.za</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 6px;font-size:13px;color:${accentColor};letter-spacing:1px;text-transform:uppercase;">${escapeHtml(stageLabel)}</p>
              <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111111;">${escapeHtml(invoiceNumber)}</h1>
              <p style="margin:0 0 24px;font-size:12px;color:#888888;">Due ${dueDateFormatted}</p>
              <p style="margin:0 0 24px;font-size:14px;color:#666666;line-height:1.6;">Hi ${escapeHtml(clientName)},<br/><br/>${bodyText}</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:${accentBg};border:1px solid ${accentBorder};border-radius:8px;margin:0 0 24px;">
                <tr>
                  <td style="padding:16px 20px;font-size:13px;color:${accentColor};font-weight:600;">Amount Outstanding</td>
                  <td style="padding:16px 20px;font-size:20px;font-weight:700;color:${accentColor};text-align:right;">${fmtR(outstanding)}</td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:13px;color:#666666;line-height:1.6;">Please arrange payment at your earliest convenience. If you have already made payment, please disregard this notice.<br/><br/>For any queries, please reply to this email or contact us directly.</p>
              <p style="margin:0;font-size:13px;color:#444444;line-height:1.6;">Kind regards,<br/><strong style="color:#111111;">Swift Designz</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:11px;color:#999999;">Swift Designz &middot; admin.swiftdesignz.co.za &middot; keenan@swiftdesignz.co.za</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const reminderSubject = emailSubject ?? (isOverdue
    ? `Overdue: ${invoiceNumber} — ${fmtR(outstanding)} | Swift Designz`
    : `Payment Reminder: ${invoiceNumber} — ${fmtR(outstanding)} due ${dueDateFormatted}`);

  return resend.emails.send({
    from: "Swift Designz <keenan@swiftdesignz.co.za>",
    to,
    subject: reminderSubject,
    html: reminderHtml,
  });
}

// ── Account Statement email ───────────────────────────────────────────────────

interface SendStatementEmailParams {
  to: string;
  clientName: string;
  statementNumber: string;
  periodFrom: string;
  periodTo: string;
  openingBalance: number;
  totalInvoiced: number;
  totalPaid: number;
  closingBalance: number;
  pdfBuffer?: Buffer;
}

export async function sendStatementEmail({
  to,
  clientName,
  statementNumber,
  periodFrom,
  periodTo,
  openingBalance,
  totalInvoiced,
  totalPaid,
  closingBalance,
  pdfBuffer,
}: SendStatementEmailParams) {
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;max-width:520px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0c2020,#081818);padding:28px 32px;border-bottom:1px solid #1a3030;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;vertical-align:middle;">
                    <img src="${APP_URL}/logo.png" alt="Swift Designz" width="40" style="display:block;height:auto;border-radius:4px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#30B0B0;">Swift Designz</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#4a8080;letter-spacing:2px;text-transform:uppercase;">swiftdesignz.co.za</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 6px;font-size:13px;color:#30B0B0;letter-spacing:1px;text-transform:uppercase;">Account Statement</p>
              <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111111;">${escapeHtml(statementNumber)}</h1>
              <p style="margin:0 0 24px;font-size:12px;color:#888888;">${fmt(periodFrom)} &ndash; ${fmt(periodTo)}</p>

              <p style="margin:0 0 24px;font-size:14px;color:#666666;line-height:1.6;">Hi ${escapeHtml(clientName)},<br/>Please find your account statement for the above period attached. A summary is shown below.</p>

              <!-- Financial summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border:1px solid #e5e5e5;border-radius:8px;margin:0 0 24px;">
                <tr><td colspan="2" style="padding:12px 16px;font-size:11px;font-weight:700;color:#30B0B0;letter-spacing:2px;text-transform:uppercase;border-bottom:1px solid #eeeeee;">Summary</td></tr>
                <tr>
                  <td style="padding:10px 16px;font-size:12px;color:#888888;">Opening Balance</td>
                  <td style="padding:10px 16px;font-size:12px;color:#333333;font-weight:600;text-align:right;">${fmtR(openingBalance)}</td>
                </tr>
                <tr style="border-top:1px solid #eeeeee;">
                  <td style="padding:10px 16px;font-size:12px;color:#888888;">Invoiced in Period</td>
                  <td style="padding:10px 16px;font-size:12px;color:#333333;font-weight:600;text-align:right;">${fmtR(totalInvoiced)}</td>
                </tr>
                <tr style="border-top:1px solid #eeeeee;">
                  <td style="padding:10px 16px;font-size:12px;color:#888888;">Payments Received</td>
                  <td style="padding:10px 16px;font-size:12px;color:#30B0B0;font-weight:600;text-align:right;">${fmtR(totalPaid)}</td>
                </tr>
                <tr style="border-top:1px solid #eeeeee;">
                  <td style="padding:10px 16px;font-size:12px;color:#888888;font-weight:700;">Closing Balance</td>
                  <td style="padding:10px 16px;font-size:14px;font-weight:700;text-align:right;color:${closingBalance > 0 ? "#d97706" : "#30B0B0"};">${closingBalance > 0 ? fmtR(closingBalance) + " outstanding" : "Nil — account clear"}</td>
                </tr>
              </table>

              <p style="margin:0 0 6px;font-size:12px;color:#888888;line-height:1.6;">Your full statement is attached as a PDF. If you have any queries about this statement, please reply to this email.</p>
              ${closingBalance > 0 ? `<p style="margin:12px 0 0;font-size:12px;color:#d97706;line-height:1.6;">If you have already made payment, please disregard the outstanding balance shown above.</p>` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:11px;color:#999999;">Swift Designz &middot; swiftdesignz.co.za &middot; keenan@swiftdesignz.co.za</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: "Swift Designz <keenan@swiftdesignz.co.za>",
    to,
    subject: `Account Statement ${statementNumber} — ${fmt(periodFrom)} to ${fmt(periodTo)} | Swift Designz`,
    html,
    ...(pdfBuffer
      ? { attachments: [{ filename: `${statementNumber}.pdf`, content: pdfBuffer }] }
      : {}),
  });
}
