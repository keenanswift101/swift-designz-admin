import { getProfile } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import LayoutClient from "./LayoutClient";

interface AppShellProps {
  children: React.ReactNode;
}

const NAV_TABLES = ["leads", "clients", "projects", "invoices", "quotations", "payments", "documents", "investors", "employees", "ai_agents", "equipment", "account_statements", "retainer_subscriptions"] as const;
type NavTable = typeof NAV_TABLES[number];

// Cache nav counts for 30 seconds to avoid 14 DB round-trips on every page navigation.
// Uses service-role client so it's safe to share across users (counts are role-identical for admin/viewer).
const getCachedNavCounts = unstable_cache(
  async (): Promise<Record<NavTable | "payment_reminders", number>> => {
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const [results, { count: pendingReminders }] = await Promise.all([
      Promise.all(NAV_TABLES.map((t) => supabase.from(t).select("id", { count: "exact", head: true }))),
      supabase.from("payment_reminders").select("id", { count: "exact", head: true }).in("status", ["pending", "approved"]),
    ]);
    return {
      ...Object.fromEntries(NAV_TABLES.map((t, i) => [t, results[i].count ?? 0])),
      payment_reminders: pendingReminders ?? 0,
    } as Record<NavTable | "payment_reminders", number>;
  },
  ["nav-counts"],
  { revalidate: 30, tags: ["nav-counts"] }
);

async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("read", false)
    .or(`scheduled_for.is.null,scheduled_for.lte.${new Date().toISOString()}`);
  return count ?? 0;
}

export default async function AppShell({ children }: AppShellProps) {
  const [profile, initialCounts, unreadNotifications] = await Promise.all([
    getProfile(),
    getCachedNavCounts(),
    getUnreadNotificationCount().catch(() => 0),
  ]);

  return (
    <LayoutClient
      profile={profile}
      initialCounts={initialCounts}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </LayoutClient>
  );
}
