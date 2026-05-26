"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { Profile } from "@/types/database";

interface LayoutClientProps {
  profile: Profile | null;
  initialCounts: Record<string, number>;
  unreadNotifications: number;
  children: React.ReactNode;
}

export default function LayoutClient({
  profile,
  initialCounts,
  unreadNotifications,
  children,
}: LayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        profile={profile}
        initialCounts={initialCounts}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Topbar
        profile={profile}
        unreadNotifications={unreadNotifications}
        onMobileMenuOpen={() => setMobileOpen(true)}
      />
      <main className="lg:pl-64 min-h-screen pt-14">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
