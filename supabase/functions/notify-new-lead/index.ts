// Supabase Edge Function: notify-new-lead
// Deploy: supabase functions deploy notify-new-lead
// Trigger: Database Webhook on leads table INSERT
//
// Setup in Supabase Dashboard:
// 1. Go to Database > Webhooks > Create Webhook
// 2. Table: leads, Event: INSERT
// 3. Type: Supabase Edge Function
// 4. Function: notify-new-lead
// 5. Set secret NOTIFICATION_EMAIL in Edge Function secrets

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface LeadPayload {
  type: "INSERT";
  table: string;
  record: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    service: string | null;
    package: string | null;
    budget: string | null;
    message: string | null;
    source: string;
    created_at: string;
  };
}

serve(async (req) => {
  try {
    const payload: LeadPayload = await req.json();

    if (payload.table !== "leads" || payload.type !== "INSERT") {
      return new Response(JSON.stringify({ message: "Ignored" }), { status: 200 });
    }

    const lead = payload.record;
    const _notificationEmail = Deno.env.get("NOTIFICATION_EMAIL") ?? "keenan@swiftdesignz.co.za";
    const _supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const _serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use Supabase's built-in email (via Auth admin API) or log for now
    // For production, integrate with Resend, SendGrid, or similar.
    // Below is a simple approach using Supabase's Auth admin invite as a notification hack,
    // or you can replace this with any HTTP email API.

    const emailBody = `
New Lead Received

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone ?? "Not provided"}
Company: ${lead.company ?? "Not provided"}
Service: ${lead.service ?? "Not specified"}
Package: ${lead.package ?? "Not specified"}
Budget: ${lead.budget ?? "Not specified"}
Source: ${lead.source}
Date: ${new Date(lead.created_at).toLocaleString("en-ZA")}

Message:
${lead.message ?? "No message provided"}

---
View in admin: https://admin.swiftdesignz.co.za/leads/${lead.id}
    `.trim();

    // Log the notification (always works, even without email service)
    console.log(`[NEW LEAD] ${lead.name} (${lead.email}) — ${lead.service ?? "General"}`);
    console.log(emailBody);

    // TODO: Replace with your preferred email service API call
    // Example with Resend:
    // await fetch("https://api.resend.com/emails", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     from: "Swift Designz <notifications@swiftdesignz.co.za>",
    //     to: notificationEmail,
    //     subject: `New Lead: ${lead.name} — ${lead.service ?? "General Inquiry"}`,
    //     text: emailBody,
    //   }),
    // });

    return new Response(
      JSON.stringify({ success: true, lead_id: lead.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing lead notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process notification" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
