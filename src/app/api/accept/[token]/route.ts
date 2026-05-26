import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendQuotationAcceptedNotification } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  let name: string;
  try {
    const body = await request.json();
    name = typeof body.name === "string" ? body.name.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!name) {
    return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const supabase = createAdminClient();

  const { data: success, error } = await supabase.rpc("accept_quotation", {
    p_token: token,
    p_client_name: name,
    p_client_ip: ip,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to process acceptance." }, { status: 500 });
  }

  if (!success) {
    return NextResponse.json(
      { error: "This quotation cannot be accepted. It may have expired, already been accepted, or the link is invalid." },
      { status: 409 }
    );
  }

  // Fetch quotation details for notification and email
  const { data: quote } = await supabase
    .from("quotations")
    .select("id, quote_number, total, clients(name)")
    .eq("acceptance_token", token)
    .single();

  if (quote) {
    const clientName = (quote.clients as unknown as { name: string } | null)?.name ?? name;

    const { error: notifError } = await supabase.from("notifications").insert({
      type: "quotation_accepted",
      title: `Quotation accepted — ${quote.quote_number}`,
      body: `${clientName} has accepted ${quote.quote_number}.`,
      link: `/accounts-receivable/quotations/${quote.id}`,
    });
    if (notifError) console.error("[accept] notification insert failed:", notifError.message);

    // Send email to info@
    sendQuotationAcceptedNotification({
      quoteNumber: quote.quote_number,
      clientName,
      total: quote.total,
      quotationId: quote.id,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
