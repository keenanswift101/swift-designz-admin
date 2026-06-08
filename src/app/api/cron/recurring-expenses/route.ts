import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: recurring, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("recurring", true)
    .eq("recurring_interval", "monthly")
    .order("date", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!recurring || recurring.length === 0) {
    return Response.json({ inserted: 0, message: "No recurring expenses" });
  }

  const today = new Date();
  const todayDay = today.getDate();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const monthStart = `${year}-${month}-01`;
  const monthEnd = `${year}-${month}-31`;

  // Deduplicate: one template per description (most recent wins due to desc order)
  const seen = new Set<string>();
  const templates = recurring.filter((e) => {
    if (seen.has(e.description)) return false;
    seen.add(e.description);
    return true;
  });

  const results: { description: string; action: string }[] = [];
  let inserted = 0;

  for (const template of templates) {
    const billingDay = new Date(template.date).getDate();
    if (billingDay !== todayDay) {
      continue; // Not due today
    }

    // Check if already inserted this month
    const { count } = await supabase
      .from("expenses")
      .select("*", { count: "exact", head: true })
      .eq("description", template.description)
      .gte("date", monthStart)
      .lte("date", monthEnd);

    if ((count ?? 0) > 0) {
      results.push({ description: template.description, action: "skipped (already exists this month)" });
      continue;
    }

    const newDate = `${year}-${month}-${String(todayDay).padStart(2, "0")}`;
    const { error: insertErr } = await supabase.from("expenses").insert({
      category: template.category,
      description: template.description,
      amount: template.amount,
      date: newDate,
      recurring: true,
      recurring_interval: "monthly",
      notes: template.notes ?? null,
    });

    if (insertErr) {
      results.push({ description: template.description, action: `error: ${insertErr.message}` });
    } else {
      inserted++;
      results.push({ description: template.description, action: "inserted" });
    }
  }

  return Response.json({ inserted, results, date: `${year}-${month}-${String(todayDay).padStart(2, "0")}` });
}
