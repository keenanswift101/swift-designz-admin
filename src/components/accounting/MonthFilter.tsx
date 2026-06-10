"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

function buildOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [
    { value: "", label: "All months" },
  ];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

const OPTIONS = buildOptions();

export default function MonthFilter() {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const current  = params.get("month") ?? "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    const next = new URLSearchParams(params.toString());
    if (val) next.set("month", val); else next.delete("month");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="relative">
      <select
        value={current}
        onChange={handleChange}
        className="appearance-none h-9 pl-3 pr-8 text-sm rounded-lg border border-border bg-card text-foreground hover:border-teal/50 focus:border-teal focus:outline-none transition-colors cursor-pointer"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
    </div>
  );
}
