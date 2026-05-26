"use client";

import { useState } from "react";
import { updateProgressOverrideAction } from "@/app/(dashboard)/projects/actions";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";

interface ProgressEditorProps {
  projectId: string;
  progress: number;
  isOverridden: boolean;
  milestoneProgress: number;
}

export default function ProgressEditor({
  projectId,
  progress,
  isOverridden,
  milestoneProgress,
}: ProgressEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(progress));
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    toast.loading("Saving progress...");
    const num = parseInt(value, 10);
    const override = isNaN(num) ? null : Math.max(0, Math.min(100, num));
    await updateProgressOverrideAction(projectId, override);
    toast.success("Progress saved!");
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function handleReset() {
    setSaving(true);
    toast.loading("Resetting progress...");
    await updateProgressOverrideAction(projectId, null);
    toast.success("Progress reset to auto.");
    setValue(String(milestoneProgress));
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={100}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-16 px-2 py-1 bg-card border border-teal/40 rounded text-sm text-foreground text-center focus:outline-none focus:ring-1 focus:ring-teal"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setEditing(false);
            }}
          />
          <span className="text-xs text-gray-500">%</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs text-teal hover:underline disabled:opacity-50"
          >
            {saving ? "..." : "Save"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-xs text-gray-500 hover:text-foreground/60"
          >
            Cancel
          </button>
        </div>
        {isOverridden && (
          <button
            onClick={handleReset}
            disabled={saving}
            className="text-xs text-amber-400 hover:underline disabled:opacity-50"
          >
            Reset to auto ({milestoneProgress}%)
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-teal">{progress}%</span>
      {isOverridden && (
        <span className="text-xs text-amber-400/70" title={`Auto-calculated: ${milestoneProgress}%`}>
          (manual)
        </span>
      )}
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-gray-500 hover:text-teal transition-colors"
        title="Override progress"
      >
        Edit
      </button>
    </div>
  );
}
