"use client";

import { useRef, useState } from "react";
import { addLeadNote, deleteLeadNote } from "@/app/(dashboard)/leads/actions";
import type { LeadNote } from "@/types/database";
import { MessageSquare, Trash2, Send } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
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
    if (!confirm("Delete this note?")) return;
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
          required
          placeholder="Add a note..."
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-gray-600 focus:outline-none focus:border-teal resize-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal hover:bg-teal-hover disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Send className="w-3 h-3" />
          {pending ? "Saving..." : "Add Note"}
        </button>
      </form>

      {/* Timeline */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-600">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="relative pl-4 border-l border-border">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">
                    <span className="text-gray-400 font-medium">
                      {note.profiles?.full_name ?? "Unknown"}
                    </span>
                    {" · "}
                    {formatTime(note.created_at)}
                  </p>
                  <p className="text-sm text-foreground/60 mt-1 whitespace-pre-wrap wrap-break-word">
                    {note.content}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="shrink-0 p-1 text-gray-600 hover:text-red-400 transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
