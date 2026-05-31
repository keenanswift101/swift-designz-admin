import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import {
  Building2, Code2, Palette, TrendingUp, DollarSign,
  Users, LineChart, FileText, Briefcase, ChevronRight,
} from "lucide-react";
import { getCategoriesForRole } from "@/lib/sop-definitions";
import type { UserRole } from "@/types/database";

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Code2, Palette, TrendingUp, DollarSign,
  Users, LineChart, FileText, Briefcase,
};

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: authUser } = await supabase.auth.getUser();
  const userId = authUser.user?.id;

  const [{ data: profile }, { data: acks }] = await Promise.all([
    userId
      ? supabase.from("profiles").select("role").eq("id", userId).single()
      : Promise.resolve({ data: null }),
    userId
      ? supabase.from("sop_acknowledgements").select("sop_id").eq("user_id", userId)
      : Promise.resolve({ data: [] as { sop_id: string }[] }),
  ]);

  const role = (profile?.role as UserRole | undefined) ?? null;
  const signedIds = new Set((acks ?? []).map((a: { sop_id: string }) => a.sop_id));

  const categories = getCategoriesForRole(role);
  const totalDocs = categories.reduce((sum, c) => sum + c.items.length, 0);
  const totalSops = categories.reduce(
    (sum, c) => sum + c.items.filter((i) => i.type === "sop").length,
    0,
  );
  const signedCount = categories.reduce(
    (sum, c) =>
      sum + c.items.filter((i) => i.type === "sop" && signedIds.has(i.id)).length,
    0,
  );

  return (
    <>
      <PageHeader
        title="Documents"
        description="Standard operating procedures, templates and business documents"
      />

      {/* Hero stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-foreground">{categories.length}</p>
          <p className="text-xs text-gray-500 mt-1">Departments</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-foreground">{totalDocs}</p>
          <p className="text-xs text-gray-500 mt-1">Total Documents</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-teal">{signedCount}</p>
          <p className="text-xs text-gray-500 mt-1">SOPs Signed</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-2xl font-bold text-amber-400">{totalSops - signedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Pending Sign-off</p>
        </div>
      </div>

      {/* NYDF loan documents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <a
          href="/api/docs/business-plan"
          download
          className="glass-card p-5 flex items-center justify-between gap-4 hover:border-teal/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
              <FileText className="h-5 w-5 text-teal" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">NYDF Business Plan 2026</h3>
              <p className="text-xs text-gray-500 mt-0.5">Full business plan PDF for DBN loan application</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors shrink-0" />
        </a>
        <a
          href="/api/docs/equipment-checklist"
          download
          className="glass-card p-5 flex items-center justify-between gap-4 hover:border-teal/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <FileText className="h-5 w-5 text-amber-400" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Equipment Procurement Checklist</h3>
              <p className="text-xs text-gray-500 mt-0.5">Printable checklist with prices and quotation tick boxes</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors shrink-0" />
        </a>
      </div>

      {/* Dynamic contract builders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Link
          href="/documents/retainers"
          className="glass-card p-5 flex items-center justify-between gap-4 hover:border-teal/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
              <FileText className="h-5 w-5 text-teal" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Retainer Contracts</h3>
              <p className="text-xs text-gray-500 mt-0.5">Monthly service retainer agreements</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors shrink-0" />
        </Link>

        <Link
          href="/documents/employee-contracts"
          className="glass-card p-5 flex items-center justify-between gap-4 hover:border-teal/50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Briefcase className="h-5 w-5 text-amber-400" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Employment Contracts</h3>
              <p className="text-xs text-gray-500 mt-0.5">Temp, fixed-term, intern and outsourcing agreements</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors shrink-0" />
        </Link>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] ?? FileText;
          const sopItems = cat.items.filter((i) => i.type === "sop");
          const signedInCat = sopItems.filter((i) => signedIds.has(i.id)).length;
          const allSigned = sopItems.length > 0 && signedInCat === sopItems.length;
          const hasPending = sopItems.length > 0 && signedInCat < sopItems.length;

          return (
            <Link
              key={cat.slug}
              href={`/documents/${cat.slug}`}
              className="glass-card p-6 flex flex-col gap-4 hover:border-teal/50 transition-colors group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${cat.accentBg}`}>
                  <Icon className={`h-5 w-5 ${cat.color}`} />
                </span>
                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-teal transition-colors mt-1" />
              </div>

              {/* Label + description */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{cat.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{cat.description}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                <span className="text-xs text-gray-500">
                  {cat.items.length} document{cat.items.length !== 1 ? "s" : ""}
                </span>
                {sopItems.length > 0 && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      allSigned
                        ? "bg-green-500/15 text-green-400"
                        : hasPending
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-gray-500/10 text-gray-500"
                    }`}
                  >
                    {allSigned ? "All signed" : `${signedInCat}/${sopItems.length} signed`}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
