/** Gmail API client using stored OAuth2 refresh token. Server-only. */

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;       // RFC2822 date string from header
  internalDate: string; // unix ms timestamp
  snippet: string;
  bodyText: string;   // decoded plain-text body (HTML tags stripped)
  attachments: GmailAttachment[];
}

export interface GmailAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
}

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Gmail auth failed: ${JSON.stringify(data)}`);
  return data.access_token as string;
}

function headerVal(headers: { name: string; value: string }[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

type MimePart = {
  mimeType: string;
  body?: { data?: string; attachmentId?: string; size?: number };
  parts?: MimePart[];
  filename?: string;
};

function decodeBase64(s: string): string {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function collectBodyText(part: MimePart): string {
  if (part.body?.data && !part.body.attachmentId) {
    const text = decodeBase64(part.body.data);
    if (part.mimeType === "text/plain") return text;
    if (part.mimeType === "text/html") return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  for (const child of part.parts ?? []) {
    const t = collectBodyText(child);
    if (t) return t;
  }
  return "";
}

function collectAttachments(
  parts: { mimeType: string; filename?: string; body: { attachmentId?: string; size?: number }; parts?: unknown[] }[],
  out: GmailAttachment[] = [],
): GmailAttachment[] {
  for (const part of parts ?? []) {
    if (part.body?.attachmentId && part.filename) {
      out.push({
        attachmentId: part.body.attachmentId,
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size ?? 0,
      });
    }
    if (part.parts) collectAttachments(part.parts as typeof parts, out);
  }
  return out;
}

export async function searchPOPEmails(): Promise<GmailMessage[]> {
  const token = await getAccessToken();

  // Search for proof-of-payment emails with PDF attachments, last 60 days
  const query = encodeURIComponent(
    'has:attachment filename:pdf (subject:"proof of payment" OR subject:POP OR subject:"payment confirmation" OR subject:proof OR "proof of payment" OR "PoP") -from:me newer_than:60d',
  );

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=20`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const listData = await listRes.json();
  const messages: { id: string }[] = listData.messages ?? [];

  const results: GmailMessage[] = [];

  for (const { id } of messages) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const msg = await msgRes.json();
    const headers: { name: string; value: string }[] = msg.payload?.headers ?? [];

    const attachments = collectAttachments(msg.payload?.parts ?? []);
    const pdfAttachments = attachments.filter((a) =>
      a.mimeType === "application/pdf" || a.filename.toLowerCase().endsWith(".pdf"),
    );

    if (pdfAttachments.length === 0) continue;

    const bodyText = collectBodyText(msg.payload as MimePart);

    results.push({
      id: msg.id,
      threadId: msg.threadId,
      subject: headerVal(headers, "Subject"),
      from: headerVal(headers, "From"),
      date: headerVal(headers, "Date"),
      internalDate: msg.internalDate,
      snippet: msg.snippet ?? "",
      bodyText,
      attachments: pdfAttachments,
    });
  }

  return results;
}

export async function downloadAttachment(messageId: string, attachmentId: string): Promise<Buffer> {
  const token = await getAccessToken();
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = await res.json();
  // Gmail uses URL-safe base64
  const base64 = (data.data as string).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64");
}
