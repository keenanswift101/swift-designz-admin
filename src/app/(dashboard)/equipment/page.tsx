import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { Equipment, EquipmentCategory } from "@/types/database";
import { Package, DollarSign, Cpu, Key, Armchair, ArrowUpRight, FileDown } from "lucide-react";

const categoryConfig: Record<EquipmentCategory, { label: string; color: string; bg: string }> = {
  computing:        { label: "Computing",        color: "text-blue-400",   bg: "bg-blue-400/10" },
  peripherals:      { label: "Peripherals",      color: "text-teal",       bg: "bg-teal/10" },
  mobile:           { label: "Mobile",           color: "text-green-400",  bg: "bg-green-400/10" },
  networking:       { label: "Networking",       color: "text-cyan-400",   bg: "bg-cyan-400/10" },
  software_licence: { label: "Software",        color: "text-purple-400", bg: "bg-purple-400/10" },
  office:           { label: "Office",           color: "text-amber-400",  bg: "bg-amber-400/10" },
  other:            { label: "Other",            color: "text-gray-400",   bg: "bg-gray-500/10" },
};

const IT_CATEGORIES: EquipmentCategory[] = ["computing", "peripherals", "mobile", "networking", "other"];

const SUGGESTED_EQUIPMENT: { category: string; items: { name: string; purpose: string; estimatedCost: string }[] }[] = [
  {
    category: "Computing",
    items: [
      { name: "Development Laptop", purpose: "Primary workstation for development and design", estimatedCost: "R20,000 – R45,000" },
      { name: "Desktop Workstation", purpose: "High-performance rendering and heavy compilation tasks", estimatedCost: "R15,000 – R35,000" },
      { name: "External Monitor ×2", purpose: "Extended display for productivity and design work", estimatedCost: "R3,000 – R8,000 each" },
      { name: "External SSD / Backup Drive", purpose: "Project backups and portable file storage", estimatedCost: "R800 – R2,500" },
      { name: "USB-C Hub / Docking Station", purpose: "Connects peripherals to laptop via single cable", estimatedCost: "R600 – R2,000" },
    ],
  },
  {
    category: "Peripherals",
    items: [
      { name: "Mechanical Keyboard", purpose: "Ergonomic and fast typing for long coding sessions", estimatedCost: "R1,000 – R3,500" },
      { name: "Ergonomic Mouse", purpose: "Reduces wrist strain during extended use", estimatedCost: "R600 – R2,500" },
      { name: "Webcam (1080p+)", purpose: "Professional video calls and client meetings", estimatedCost: "R800 – R2,500" },
      { name: "USB Microphone / Headset", purpose: "Clear audio for calls, recordings, and training sessions", estimatedCost: "R700 – R4,000" },
      { name: "Drawing Tablet (Wacom)", purpose: "Precise design input for UI/UX and digital art", estimatedCost: "R1,500 – R6,000" },
    ],
  },
  {
    category: "Mobile",
    items: [
      { name: "Business Smartphone", purpose: "Client communication and mobile testing", estimatedCost: "R8,000 – R25,000" },
      { name: "Tablet / iPad", purpose: "Portable design reviews, presentations, and note-taking", estimatedCost: "R6,000 – R20,000" },
    ],
  },
  {
    category: "Networking",
    items: [
      { name: "Business Router (Wi-Fi 6)", purpose: "Fast, stable internet for the home office or studio", estimatedCost: "R2,000 – R6,000" },
      { name: "UPS Battery Backup", purpose: "Protects equipment and uptime during power cuts", estimatedCost: "R1,500 – R5,000" },
      { name: "NAS / Network Storage", purpose: "Centralised local file server and backup solution", estimatedCost: "R4,000 – R12,000" },
    ],
  },
  {
    category: "Software Licences",
    items: [
      { name: "Adobe Creative Cloud", purpose: "Industry-standard suite for design, video, and photography", estimatedCost: "R500 – R1,200/mo" },
      { name: "Figma (Pro seat)", purpose: "UI/UX design, prototyping, and client handoffs", estimatedCost: "R350 – R700/mo" },
      { name: "Microsoft 365 Business", purpose: "Email, Word, Excel, Teams for business productivity", estimatedCost: "R250 – R600/mo" },
      { name: "GitHub Pro / Copilot", purpose: "Code repository, CI/CD, and AI coding assistant", estimatedCost: "R200 – R500/mo" },
      { name: "Project Management Tool", purpose: "Task tracking, sprints, and client project boards", estimatedCost: "R0 – R400/mo" },
    ],
  },
  {
    category: "Office",
    items: [
      { name: "Standing / Sit-Stand Desk", purpose: "Ergonomic workspace that supports long work sessions", estimatedCost: "R4,000 – R15,000" },
      { name: "Ergonomic Chair", purpose: "Lumbar support for hours of seated work", estimatedCost: "R3,000 – R12,000" },
      { name: "Printer / Scanner", purpose: "Contracts, invoices, and physical document handling", estimatedCost: "R1,500 – R5,000" },
      { name: "Ring Light / Studio Lighting", purpose: "Professional appearance in video calls and recordings", estimatedCost: "R500 – R2,500" },
      { name: "Whiteboard", purpose: "Visual planning, architecture diagrams, and brainstorming", estimatedCost: "R400 – R1,800" },
    ],
  },
];

export default async function EquipmentPage() {
  const supabase = await createClient();
  const { data: equipmentRaw } = await supabase
    .from("equipment")
    .select("id, name, category, status, purchase_price, current_value, purchase_date")
    .order("name");

  const equipment = (equipmentRaw ?? []) as unknown as Equipment[];
  const active = equipment.filter((e) => e.status === "active");

  const hardwareItems = equipment.filter((e) => IT_CATEGORIES.includes(e.category));
  const officeItems = equipment.filter((e) => e.category === "office");
  const softwareItems = equipment.filter((e) => e.category === "software_licence");

  const totalAssetValue = active.reduce((s, e) => s + (e.current_value ?? 0), 0);
  const totalPurchaseValue = active.reduce((s, e) => s + (e.purchase_price ?? 0), 0);
  const hardwareValue = hardwareItems.filter((e) => e.status === "active").reduce((s, e) => s + (e.current_value ?? 0), 0);
  const officeValue = officeItems.filter((e) => e.status === "active").reduce((s, e) => s + (e.current_value ?? 0), 0);
  const softwareValue = softwareItems.filter((e) => e.status === "active").reduce((s, e) => s + (e.current_value ?? 0), 0);
  const depreciation = totalPurchaseValue > 0
    ? Math.round(((totalPurchaseValue - totalAssetValue) / totalPurchaseValue) * 100)
    : 0;

  const categoryCounts = active.reduce<Partial<Record<EquipmentCategory, number>>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Equipment Registry"
        description="Track company assets, hardware, and software licences"
        actions={
          <div className="flex items-center gap-2">
            <a
              href="/api/docs/equipment-list"
              download
              className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border hover:border-teal text-foreground text-sm font-medium rounded-lg transition-colors"
            >
              <FileDown className="h-4 w-4" />
              Insurance PDF
            </a>
            <Link
              href="/equipment/new"
              className="px-4 py-2 bg-teal hover:bg-teal-hover text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Equipment
            </Link>
          </div>
        }
      />

      {/* Hero */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Total Asset Value
            </p>
            <p className="text-5xl font-bold leading-none text-teal">{formatCurrency(totalAssetValue)}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="text-gray-400 font-medium">{active.length} active items</span>
              {depreciation > 0 && (
                <>
                  <span>&mdash;</span>
                  <span className="text-amber-400 font-medium">{depreciation}% depreciated</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Purchase Value</p>
            <p className="text-4xl font-bold text-foreground">{formatCurrency(totalPurchaseValue)}</p>
            <p className="text-xs text-gray-600 mt-1">original cost</p>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card p-5">
          <DollarSign className="h-5 w-5 text-teal mb-3" />
          <p className="text-2xl font-bold text-teal">{formatCurrency(totalAssetValue)}</p>
          <p className="text-xs text-gray-500 mt-1">Current Value</p>
        </div>
        <div className="glass-card p-5">
          <Cpu className="h-5 w-5 text-blue-400 mb-3" />
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(hardwareValue)}</p>
          <p className="text-xs text-gray-500 mt-1">IT Hardware</p>
        </div>
        <div className="glass-card p-5">
          <Armchair className="h-5 w-5 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(officeValue)}</p>
          <p className="text-xs text-gray-500 mt-1">Office Equipment</p>
        </div>
        <div className="glass-card p-5">
          <Key className="h-5 w-5 text-purple-400 mb-3" />
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(softwareValue)}</p>
          <p className="text-xs text-gray-500 mt-1">Software Licences</p>
        </div>
      </div>

      {/* Category breakdown pills */}
      {Object.keys(categoryCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.entries(categoryCounts) as [EquipmentCategory, number][])
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => {
              const cfg = categoryConfig[cat];
              return (
                <span
                  key={cat}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}
                >
                  {count} {cfg.label}
                </span>
              );
            })}
        </div>
      )}

      {/* IT Hardware Table */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="h-4 w-4 text-teal" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">IT Hardware</h2>
          <span className="text-xs text-gray-500 ml-1">({hardwareItems.length})</span>
        </div>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {hardwareItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">
                      No hardware added yet.
                    </td>
                  </tr>
                ) : (
                  hardwareItems.map((item, i) => {
                    const isInactive = item.status !== "active";
                    const cfg = categoryConfig[item.category] ?? categoryConfig.other;
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-border/50 hover:bg-card transition-colors group ${
                          isInactive ? "opacity-50" : i % 2 === 1 ? "bg-foreground/3" : ""
                        }`}
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/equipment/${item.id}/edit`}
                            className="text-sm font-medium text-foreground hover:text-teal transition-colors flex items-center gap-1"
                          >
                            {item.name}
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </Link>
                          {(item.brand || item.model) && (
                            <p className="text-xs text-gray-500 mt-0.5">{[item.brand, item.model].filter(Boolean).join(" ")}</p>
                          )}
                          {item.serial_number && (
                            <p className="text-xs text-gray-600 mt-0.5">S/N: {item.serial_number}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 capitalize">{item.condition}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-400 text-right whitespace-nowrap">
                          {formatCurrency(item.purchase_price)}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono font-medium text-foreground text-right whitespace-nowrap">
                          {formatCurrency(item.current_value)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link href={`/equipment/${item.id}/edit`} className="text-xs text-gray-500 hover:text-teal transition-colors">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Office Equipment Table */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Armchair className="h-4 w-4 text-teal" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Office Equipment</h2>
          <span className="text-xs text-gray-500 ml-1">({officeItems.length})</span>
        </div>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {officeItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                      No office equipment added yet.
                    </td>
                  </tr>
                ) : (
                  officeItems.map((item, i) => {
                    const isInactive = item.status !== "active";
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-border/50 hover:bg-card transition-colors group ${
                          isInactive ? "opacity-50" : i % 2 === 1 ? "bg-foreground/3" : ""
                        }`}
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/equipment/${item.id}/edit`}
                            className="text-sm font-medium text-foreground hover:text-teal transition-colors flex items-center gap-1"
                          >
                            {item.name}
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </Link>
                          {(item.brand || item.model) && (
                            <p className="text-xs text-gray-500 mt-0.5">{[item.brand, item.model].filter(Boolean).join(" ")}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 capitalize">{item.condition}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-400 text-right whitespace-nowrap">
                          {formatCurrency(item.purchase_price)}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono font-medium text-foreground text-right whitespace-nowrap">
                          {formatCurrency(item.current_value)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link href={`/equipment/${item.id}/edit`} className="text-xs text-gray-500 hover:text-teal transition-colors">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Software Licences Table */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Key className="h-4 w-4 text-teal" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Software Licences</h2>
          <span className="text-xs text-gray-500 ml-1">({softwareItems.length})</span>
        </div>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {softwareItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">
                      No software licences added yet.
                    </td>
                  </tr>
                ) : (
                  softwareItems.map((item, i) => {
                    const isInactive = item.status !== "active";
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-border/50 hover:bg-card transition-colors group ${
                          isInactive ? "opacity-50" : i % 2 === 1 ? "bg-foreground/3" : ""
                        }`}
                      >
                        <td className="px-5 py-3">
                          <Link
                            href={`/equipment/${item.id}/edit`}
                            className="text-sm font-medium text-foreground hover:text-teal transition-colors flex items-center gap-1"
                          >
                            {item.name}
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </Link>
                          {item.notes && (
                            <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-400 text-right whitespace-nowrap">
                          {formatCurrency(item.purchase_price)}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono font-medium text-foreground text-right whitespace-nowrap">
                          {formatCurrency(item.current_value)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link href={`/equipment/${item.id}/edit`} className="text-xs text-gray-500 hover:text-teal transition-colors">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Suggested Equipment */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-5 w-5 text-teal" />
          <h2 className="text-base font-semibold text-foreground">Suggested Equipment for a Software & Design Business</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          A reference guide to help you identify assets worth acquiring or tracking. Prices are approximate South African market estimates.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {SUGGESTED_EQUIPMENT.map((section) => (
            <div key={section.category} className="glass-card p-5">
              <h3 className="text-xs font-semibold text-teal uppercase tracking-wider mb-3">{section.category}</h3>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.name} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.purpose}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{item.estimatedCost}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
