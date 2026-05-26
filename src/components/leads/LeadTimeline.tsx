"use client";

import { useRef, useState } from "react";
import { addLeadNote, deleteLeadNote } from "@/app/(dashboard)/leads/actions";
import type { LeadNote } from "@/types/database";
import { MessageSquare, Trash2, Send } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { useRouter } from "next/navigation";

interface Props {
  leadId: string;
  notes: (LeadNote & { profiles: { full_name: string } | null })[];
}

export default function LeadTimeline({ leadId, notes }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { confirm, ConfirmDialog } = useConfirm();

  async function handleSubmit(formData: FormData) {
    setPending(true);
    toast.loading("Saving note...");
    await addLeadNote(leadId, formData);
    formRef.current?.reset();
    setPending(false);
    toast.success("Note saved!");
    router.refresh();
  }

  async function handleDelete(noteId: string) {
    const ok = await confirm("Delete this note?", {
      title: "Delete Note",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    toast.loading("Deleting note...");
    await deleteLeadNote(noteId, leadId);
    toast.success("Note deleted.");
    router.refresh();
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <>
      {ConfirmDialog}
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Activity
        </h3>

        {/* Add note form */}
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); void handleSubmit(new FormData(e.currentTarget)); }} className="mb-6">
          <textarea
            name="content"
            rows={3}
            placeholder="Add a note..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-teal resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal/10 hover:bg-teal/20 text-teal text-xs font-medium rounded-lg border border-teal/25 transition-colors disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              {pending ? "Saving..." : "Add Note"}
            </button>
          </div>
        </form>

        {/* Notes list */}
        {notes.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal/40 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-gray-300 leading-relaxed">{note.content}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {note.profiles?.full_name ?? "Unknown"} · {formatTime(note.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 rounded text-gray-700 hover:text-red-400 transition-colors shrink-0"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
