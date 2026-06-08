import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Exchange the authorization code for Google tokens
  const redirectUri = `${origin}/api/auth/google/callback`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
      client_secret: process.env.GOOGLE_WEB_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokens.id_token) {
    console.error("Google token exchange failed:", tokens);
    return NextResponse.redirect(`${origin}/login`);
  }

  // Use the Google ID token to sign into Supabase
  const supabase = await createClient();
  const { error: authError } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: tokens.id_token,
    access_token: tokens.access_token,
  });

  if (authError) {
    console.error("Supabase signInWithIdToken failed:", authError.message);
    return NextResponse.redirect(`${origin}/login`);
  }

  // Ensure new Google sign-in users get the employee role by default
  const { data: { user: authedUser } } = await supabase.auth.getUser();
  if (authedUser) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", authedUser.id)
      .single();

    // Detect new user: auth account created within last 2 minutes
    const isNewUser = authedUser.created_at
      ? Date.now() - new Date(authedUser.created_at).getTime() < 120_000
      : false;

    if (!profile) {
      await admin.from("profiles").insert({
        id: authedUser.id,
        full_name: authedUser.user_metadata?.full_name ?? authedUser.email ?? "",
        email: authedUser.email ?? "",
        role: "employee",
        avatar_url: authedUser.user_metadata?.avatar_url ?? null,
        accounting_access: false,
      });
    } else if (isNewUser && (profile.role === "viewer" || !profile.role)) {
      // Trigger created profile with default viewer — override to employee
      await admin.from("profiles").update({ role: "employee" }).eq("id", authedUser.id);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
