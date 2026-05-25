"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  FolderOpen,
  Landmark,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  UserPlus,
  Sun,
  Moon,
  Package,
  BarChart2,
  ClipboardList,
  Bell,
  CreditCard,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { getDocumentLibraryCountForRole } from "@/lib/document-templates";
import type { Profile } from "@/types/database";

interface SidebarProps {
  profile: Profile | null;
  initialCounts: Record<string, number>;
}

const NAV_SECTIONS = [
  {
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/leads", label: "Leads", icon: UserPlus, countKey: "leads" },
      { href: "/clients", label: "Clients", icon: Users, countKey: "clients" },
      { href: "/projects", label: "Projects", icon: Briefcase, countKey: "projects" },
    ],
  },
  {
    items: [
      { href: "/accounting", label: "Accounting", icon: TrendingUp },
      { href: "/documents", label: "Documents", icon: FolderOpen, countKey: "documents" },
      { href: "/investors", label: "Investors", icon: Landmark, countKey: "investors" },
      { href: "/team", label: "Team", icon: UserCog, countKey: "team" },
      { href: "/equipment", label: "Equipment", icon: Package, countKey: "equipment" },
    ],
  },
  {
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const AR_SUB_NAV = [
  { href: "/accounts-receivable/quotations", label: "Estimates & Quotations", icon: ClipboardList },
  { href: "/invoices",                       label: "Billing",               icon: Bell },
  { href: "/accounts-receivable/payments",   label: "Payments",              icon: CreditCard },
];

const INVESTOR_NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Briefcase, countKey: "projects" },
  { href: "/documents", label: "Documents", icon: FolderOpen, countKey: "documents" },
  { href: "/investors", label: "Investors", icon: Landmark, countKey: "investors" },
  { href: "/equipment", label: "Equipment", icon: Package, countKey: "equipment" },
  { href: "/accounting/reports", label: "Reports", icon: BarChart2 },
];

export default function Sidebar({ profile, initialCounts }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const { theme, toggle: toggleTheme } = useTheme();
  const counts = initialCounts;
  const documentLibraryCount = getDocumentLibraryCountForRole(profile?.role);

  async function handleSignOut() {
    flushSync(() => setSigningOut(true));
    await signOut();
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navContent = (
    <>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/favicon.png"
          alt="Swift Designz"
          width={32}
          height={32}
          className="shrink-0"
        />
        <div>
          <h1 className="text-lg font-bold text-teal tracking-tight leading-tight">
            Swift Designz
          </h1>
          <p className="text-xs text-teal-muted">{profile?.role === "investor" ? "Investor Portal" : (profile?.role === "viewer" && profile.accounting_access) ? "Intern Admin" : "Admin Portal"}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {profile?.role === "investor" ? (
          <ul className="space-y-1">
            {INVESTOR_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const count = item.countKey
                ? item.countKey === "documents"
                  ? profile?.role === "investor"
                    ? documentLibraryCount
                    : (counts.documents ?? 0) + documentLibraryCount
                  : counts[item.countKey] ?? 0
                : null;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-teal/10 text-teal border border-teal/20"
                        : "text-gray-400 hover:text-foreground hover:bg-card"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                    {count !== null && count > 0 && (
                      <span className="ml-auto text-xs tabular-nums px-1.5 py-0.5 rounded-full bg-border text-gray-400">
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <>
            {NAV_SECTIONS.map((section, sIdx) => {
              const visibleItems = section.items.filter((item) => {
                if (profile?.role === "viewer" && (item.href === "/investors" || item.href === "/team")) return false;
                if (profile?.role === "viewer" && item.href === "/accounting" && !profile.accounting_access) return false;
                return true;
              });
              if (visibleItems.length === 0) return null;
              return (
              <div key={sIdx}>
                {sIdx > 0 && (
                  <hr className="my-3 border-border" />
                )}
                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    const count = item.countKey
                      ? item.countKey === "team"
                        ? (counts.employees ?? 0) + (counts.ai_agents ?? 0)
                        : item.countKey === "documents"
                          ? profile?.role === "investor"
                            ? documentLibraryCount
                            : (counts.documents ?? 0) + documentLibraryCount
                          : counts[item.countKey] ?? 0
                      : null;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            active
                              ? "bg-teal/10 text-teal border border-teal/20"
                              : "text-gray-400 hover:text-foreground hover:bg-card"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.label}
                          {count !== null && count > 0 && (
                            <span className="ml-auto text-xs tabular-nums px-1.5 py-0.5 rounded-full bg-border text-gray-400">
                              {count}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Accounts Receivable sub-section — injected after first section */}
                {sIdx === 0 && profile?.role !== "investor" && (
                  <div className="mt-3">
                    <hr className="mb-3 border-border" />
                    <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                      Accounts Receivable
                    </p>
                    <ul className="space-y-0.5">
                      {AR_SUB_NAV.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center gap-3 pl-5 pr-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                active
                                  ? "bg-teal/10 text-teal border border-teal/20"
                                  : "text-gray-400 hover:text-foreground hover:bg-card"
                              )}
                            >
                              <Icon className="h-3.5 w-3.5 shrink-0" />
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
              );
            })}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-teal/20 flex items-center justify-center text-teal text-sm font-bold">
            {profile?.full_name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-gray-500">{profile?.role || "admin"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors w-full px-1"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-gray-500 hover:text-teal hover:bg-card transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Sign-out overlay */}
      {signingOut && (
        <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5">
            {/* Door loader */}
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-teal/30 bg-teal/5">
              {/* Left door */}
              <div
                className="absolute inset-y-0 left-0 w-1/2 bg-teal/25 border-r border-teal/50 origin-left"
                style={{ animation: "doorOpen 2s ease-in-out infinite" }}
              >
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-0.5 rounded-full bg-teal" />
              </div>
              {/* Right door */}
              <div
                className="absolute inset-y-0 right-0 w-1/2 bg-teal/25 border-l border-teal/50 origin-right"
                style={{ animation: "doorOpen 2s ease-in-out infinite" }}
              >
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3.5 w-0.5 rounded-full bg-teal" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-foreground tracking-tight">Signing you out</p>
              <p className="text-sm text-gray-500">Swift Designz Portal</p>
            </div>
            <div className="flex gap-1.5">
              {[0,1,2].map((i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-teal animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg text-gray-400 hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — mobile (slide-over) */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border flex flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        {navContent}
      </aside>

      {/* Sidebar — desktop (fixed) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 bg-sidebar border-r border-border flex-col">
        {navContent}
      </aside>
    </>
  );
}
