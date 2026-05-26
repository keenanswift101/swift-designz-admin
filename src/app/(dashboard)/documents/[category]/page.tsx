import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import SopModal from "@/components/documents/SopModal";
import {
  Building2, Code2, Palette, TrendingUp, DollarSign,
  Users, LineChart, FileText, Briefcase, Eye, ArrowLeft,
} from "lucide-react";
import { getCategoriesForRole } from "@/lib/sop-definitions";
import type { UserRole } from "@/types/database";

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Code2, Palette, TrendingUp, DollarSign,
  Users, LineChart, FileText, Briefcase,
};

interface Props {
  params: Promise<{ category: string }>;
}

export default async function DocumentCategoryPage({ params }: Props) {
  const { category: slug } = await params;

  const supabase = await createClient();
  const { data: authUser } = await supabase.auth.getUser();
  const userId = authUser.user?.id;
  const { data: profile } = userId
    ? await supabase.from("profiles").select("role").eq("id", userId).single()
    : { data: null };
  const role = (profile?.role as UserRole | undefined) ?? null;

  // Validate category exists and is visible to this role
  const allowedCategories = getCategoriesForRole(role);
  const cat = allowedCategories.find((c) => c.slug === slug);
  if (!cat) notFound();

  // Load this user's sign-offs
  const { data: acks } = userId
    ? await supabase
        .from("sop_acknowledgements")
        .select("sop_id")
        .eq("user_id", userId)
    : { data: [] };
  const signedIds = new Set((acks ?? []).map((a: { sop_id: string }) => a.sop_id));

  const Icon = ICON_MAP[cat.icon] ?? FileText;
  const sopItems = cat.items.filter((i) => i.type === "sop");
  const templateItems = cat.items.filter((i) => i.type === "template");
  const signedInCat = sopItems.filter((i) => signedIds.has(i.id)).length;

  return (
    <>
      <div className="mb-6">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-teal transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Documents
        </Link>
        <PageHeader
          title={cat.label}
          description={cat.description}
        />
      </div>

      {/* Category hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none ${cat.accentBg}`} />
        <div className="flex items-center gap-5">
          <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${cat.accentBg}`}>
            <Icon className={`h-7 w-7 ${cat.color}`} />
          </span>
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-bold text-foreground">{cat.items.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Documents</p>
            </div>
            {sopItems.length > 0 && (
              <div>
                <p className="text-2xl font-bold text-teal">{signedInCat}/{sopItems.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">SOPs Signed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SOPs section */}
      {sopItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Standard Operating Procedures
          </h2>
          <div className="space-y-2">
            {sopItems.map((item) => {
              const isSigned = signedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="glass-card px-5 py-4 flex items-center gap-4"
                >
                  <div className={`shrink-0 h-2 w-2 rounded-full ${isSigned ? "bg-green-400" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  </div>
                  <SopModal item={item} isSigned={isSigned} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Templates section */}
      {templateItems.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Document Templates
          </h2>
          <div className="space-y-2">
            {templateItems.map((item) => (
              <div
                key={item.id}
                className="glass-card px-5 py-4 flex items-center gap-4"
              >
                <FileText className="shrink-0 h-4 w-4 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
                <Link
                  href={`/documents/view/${item.templateSlug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-teal/10 text-teal hover:bg-teal/20 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
