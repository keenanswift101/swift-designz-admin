import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Simple in-memory rate limiter (resets on deploy/restart — sufficient for Netlify)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

const CORS_ORIGIN = process.env.CORS_ALLOWED_ORIGIN || "https://swiftdesignz.co.za";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": CORS_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

/**
 * Public API endpoint for the main Swift Designz website to submit leads.
 * Accepts POST with JSON body matching the quote/contact form data.
 * Uses the service role key to bypass RLS (the main site calls this with its own server-side fetch).
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: corsHeaders() },
      );
    }
    const body = await req.json();
    const raw = body as Record<string, unknown>;

    const str = (v: unknown, max: number): string =>
      typeof v === "string" ? v.slice(0, max) : "";

    const name = str(raw.name, 100);
    const email = str(raw.email, 254);

    if (!email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400, headers: corsHeaders() },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400, headers: corsHeaders() },
      );
    }

    const supabase = createAdminClient();

    const validSources = ["quote_form", "contact_form", "newsletter", "manual"];
    const rawSource = str(raw.source, 20);
    const source = validSources.includes(rawSource) ? rawSource : "manual";

    // Newsletter signups only require email; derive a name from it
    const resolvedName = name || (source === "newsletter" ? email.split("@")[0].replace(/[._-]/g, " ") : "");
    if (!resolvedName) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400, headers: corsHeaders() },
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        source: source as "quote_form" | "contact_form" | "newsletter" | "manual",
        name: resolvedName,
        email,
        phone: str(raw.phone, 30) || null,
        company: str(raw.company, 100) || null,
        location: str(raw.location, 100) || null,
        service: str(raw.service, 50) || null,
        package: str(raw.package, 50) || null,
        scope: str(raw.scope, 5000) || null,
        timeline: str(raw.timeline, 100) || null,
        budget: str(raw.budget, 50) || null,
        message: str(raw.message, 5000) || null,
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to insert lead:", error);
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 500, headers: corsHeaders() },
      );
    }

    return NextResponse.json({ success: true, id: data.id }, { headers: corsHeaders() });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: corsHeaders() },
    );
  }
}
