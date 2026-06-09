import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("newsletter_subscribers").upsert(
    { email: email.toLowerCase().trim(), name: name?.trim() || null, source: "public_form", status: "active" },
    { onConflict: "email", ignoreDuplicates: false }
  );

  if (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Could not subscribe. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
