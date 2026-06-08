/** Extracts payment details from a proof-of-payment PDF buffer. */

export interface ParsedPayment {
  amountCents: number | null;
  reference: string | null;
  date: string | null; // YYYY-MM-DD
}

function parseAmount(text: string): number | null {
  // Match: N$ 2,500.00 | NAD 2500.00 | N$2,500 | R 2,500.00
  const patterns = [
    /(?:N\$|NAD|ZAR|R)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi,
    /amount[\s:Rr$]*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi,
    /total[\s:Rr$]*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi,
  ];
  const candidates: number[] = [];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const raw = m[1].replace(/,/g, "");
      const val = parseFloat(raw);
      if (!isNaN(val) && val > 0 && val < 10_000_000) candidates.push(val);
    }
  }
  if (candidates.length === 0) return null;
  // Take the most common / largest amount (POPs usually show the transaction amount prominently)
  return Math.round(candidates[0] * 100);
}

function parseReference(text: string): string | null {
  // Look for Swift Designz invoice numbers first (highest confidence)
  const sdInvoice = text.match(/SD\d{2}-INV-\d{3,}/i);
  if (sdInvoice) return sdInvoice[0].trim();

  // Generic reference fields
  const patterns = [
    /(?:your\s+)?reference\s*[:#]\s*([^\n\r]{3,50})/i,
    /(?:payment\s+)?ref(?:erence)?\s*[:#]\s*([^\n\r]{3,50})/i,
    /transaction\s+(?:id|ref(?:erence)?)\s*[:#]\s*([^\n\r]{3,50})/i,
    /beneficiary\s+ref(?:erence)?\s*[:#]\s*([^\n\r]{3,50})/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1].trim().replace(/\s+/g, " ");
  }
  return null;
}

function parseDate(text: string): string | null {
  // ISO: 2026-06-05 or 2026/06/05
  const iso = text.match(/\b(20\d{2})[-/](0[1-9]|1[0-2])[-/]([0-2]\d|3[01])\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = text.match(/\b([0-2]\d|3[01])[-/](0[1-9]|1[0-2])[-/](20\d{2})\b/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  // "05 June 2026" or "5 Jun 2026"
  const monthNames: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  const verbose = text.match(/\b(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(20\d{2})\b/i);
  if (verbose) {
    const month = monthNames[verbose[2].toLowerCase().substring(0, 3)];
    if (month) return `${verbose[3]}-${month}-${verbose[1].padStart(2, "0")}`;
  }

  return null;
}

export async function extractPaymentFromPDF(buffer: Buffer): Promise<ParsedPayment> {
  try {
    // Dynamic import to avoid Next.js webpack issues with pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    const text = data.text;

    return {
      amountCents: parseAmount(text),
      reference: parseReference(text),
      date: parseDate(text),
    };
  } catch {
    return { amountCents: null, reference: null, date: null };
  }
}

export interface OpenInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  client: string;
  due_date: string | null;
}

export interface MatchResult {
  invoice: OpenInvoice;
  confidence: "high" | "medium" | "low";
}

export function matchInvoice(
  parsed: ParsedPayment,
  openInvoices: OpenInvoice[],
  emailText: string,
): MatchResult | null {
  const outstanding = (inv: OpenInvoice) => inv.amount - inv.paid_amount;

  // High confidence: our invoice number found in PDF text
  if (parsed.reference) {
    const invByRef = openInvoices.find(
      (inv) => parsed.reference && inv.invoice_number.toLowerCase() === parsed.reference.toLowerCase(),
    );
    if (invByRef) return { invoice: invByRef, confidence: "high" };
  }

  // Also check email subject/snippet for invoice number
  const invInEmail = openInvoices.find((inv) =>
    emailText.toLowerCase().includes(inv.invoice_number.toLowerCase()),
  );
  if (invInEmail) return { invoice: invInEmail, confidence: "high" };

  // Medium confidence: amount matches outstanding within 1 cent
  if (parsed.amountCents !== null) {
    const exact = openInvoices.find((inv) => Math.abs(outstanding(inv) - parsed.amountCents!) <= 1);
    if (exact) return { invoice: exact, confidence: "medium" };

    // Low confidence: amount within 5% of outstanding
    const close = openInvoices.find((inv) => {
      const diff = Math.abs(outstanding(inv) - parsed.amountCents!);
      return diff / outstanding(inv) < 0.05;
    });
    if (close) return { invoice: close, confidence: "low" };
  }

  return null;
}
