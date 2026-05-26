"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  FolderOpen,
  Landmark,
  UserCog,
  Settings,
  X,
  UserPlus,
  Package,
  BarChart2,
  ClipboardList,
  Bell,
  CreditCard,
  FileText,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDocumentLibraryCountForRole } from "@/lib/document-templates";
import type { Profile } from "@/types/database";

interface SidebarProps {
  profile: Profile | null;
  initialCounts: Record<string, number>;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  countKey?: string;
  viewerHidden?: boolean;
  requiresAccounting?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
  viewerHidden?: boolean;
}

const SECTIONS: NavSection[] = [
  {
    label: "Pipeline",
    items: [
      { href: "/",         label: "Dashboard", icon: LayoutDashboard },
      { href: "/leads",    label: "Leads",     icon: UserPlus,  countKey: "leads" },
      { href: "/clients",  label: "Clients",   icon: Users,     countKey: "clients" },
      { href: "/projects", label: "Projects",  icon: Briefcase, countKey: "projects" },
    ],
  },
  {
    label: "Accounts Receivable",
    items: [
      { href: "/accounts-receivable/quotations", label: "Quotations", icon: ClipboardList, countKey: "quotations" },
      { href: "/invoices",                       label: "Billing",    icon: Bell,          countKey: "invoices" },
      { href: "/accounts-receivable/payments",   label: "Payments",   icon: CreditCard,    countKey: "payments" },
      { href: "/accounts-receivable/reminders",  label: "Reminders",  icon: Bell,          countKey: "payment_reminders" },
      { href: "/accounts-receivable/statements", label: "Statements", icon: FileText,      countKey: "account_statements" },
      { href: "/accounts-receivable/retainers",  label: "Retainers",  icon: RefreshCw,     countKey: "retainer_subscriptions" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/accounting", label: "Accounting", icon: TrendingUp, requiresAccounting: true },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/documents", label: "Documents", icon: FolderOpen, countKey: "documents" },
      { href: "/team",      label: "Team",      icon: UserCog,   countKey: "team",    viewerHidden: true },
      { href: "/equipment", label: "Equipment", icon: Package,   countKey: "equipment" },
    ],
  },
  {
    label: "Investors",
    viewerHidden: true,
    items: [
      { href: "/investors", label: "Investors", icon: Landmark, countKey: "investors" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

const INVESTOR_NAV: NavItem[] = [
  { href: "/",                   label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects",           label: "Projects",  icon: Briefcase,  countKey: "projects" },
  { href: "/documents",          label: "Documents", icon: FolderOpen, countKey: "documents" },
  { href: "/investors",          label: "Investors", icon: Landmark,   countKey: "investors" },
  { href: "/equipment",          label: "Equipment", icon: Package,    countKey: "equipment" },
  { href: "/accounting/reports", label: "Reports",   icon: BarChart2 },
];

export default function Sidebar({ profile, initialCounts, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const counts = initialCounts;
  const documentLibraryCount = getDocumentLibraryCountForRole(profile?.role);
  const isViewer = profile?.role === "viewer";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  function getCount(item: NavItem): number | null {
    if (!item.countKey) return null;
    if (item.countKey === "team") return (counts.employees ?? 0) + (counts.ai_agents ?? 0);
    if (item.countKey === "documents") return (counts.documents ?? 0) + documentLibraryCount;
    if (item.countKey === "payment_reminders") return counts.payment_reminders ?? 0;
    return counts[item.countKey] ?? 0;
  }

  function renderNavItem(item: NavItem) {
    const Icon = item.icon;
    const active = isActive(item.href);
    const count = getCount(item);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={onMobileClose}
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
  }

  const navContent = (
    <>
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.png" alt="Swift Designz" width={32} height={32} className="shrink-0" />
        <div>
          <h1 className="text-lg font-bold text-teal tracking-tight leading-tight">Swift Designz</h1>
          <p className="text-xs text-teal-muted">
            {profile?.role === "investor"
              ? "Investor Portal"
              : isViewer && profile?.accounting_access
              ? "Intern Admin"
              : "Admin Portal"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {profile?.role === "investor" ? (
          <ul className="space-y-1">
            {INVESTOR_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const count = item.countKey === "documents"
                ? documentLibraryCount
                : item.countKey ? counts[item.countKey] ?? 0 : null;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
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
          SECTIONS.map((section) => {
            if (section.viewerHidden && isViewer) return null;

            const visibleItems = section.items.filter((item) => {
              if (item.viewerHidden && isViewer) return false;
              if (item.requiresAccounting && isViewer && !profile?.accounting_access) return false;
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.label}>
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {visibleItems.map(renderNavItem)}
                </ul>
              </div>
            );
          })
        )}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={onMobileClose} />
      )}

      {/* Sidebar — mobile */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border flex flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button onClick={onMobileClose} className="absolute top-4 right-4 text-gray-500 hover:text-foreground z-10">
          <X className="h-5 w-5" />
        </button>
        {navContent}
      </aside>

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 bg-sidebar border-r border-border flex-col">
        {navContent}
      </aside>
    </>
  );
}
