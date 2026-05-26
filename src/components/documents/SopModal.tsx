"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, ClipboardList } from "lucide-react";
import { acknowledgeSopAction } from "@/app/(dashboard)/documents/actions";
import type { DocItem } from "@/lib/sop-definitions";

interface Props {
  item: DocItem;
  isSigned: boolean;
}

export default function SopModal({ item, isSigned }: Props) {
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signed, setSigned] = useState(isSigned);
  const [signError, setSignError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSign() {
    if (!agreed || isPending) return;
    setSignError(null);
    startTransition(async () => {
      const result = await acknowledgeSopAction(item.id);
      if (result.error) {
        setSignError(result.error);
      } else {
        setSigned(true);
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
          signed
            ? "bg-green-500/15 text-green-400 cursor-default"
            : "bg-teal/10 text-teal hover:bg-teal/20"
        }`}
      >
        {signed ? (
          <>
            <CheckCircle className="h-3.5 w-3.5" />
            Signed
          </>
        ) : (
          <>
            <ClipboardList className="h-3.5 w-3.5" />
            View & Sign
          </>
        )}
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
          <motion.div
            className="fixed inset-0 z-9999 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-teal/20 overflow-hidden shadow-2xl"
              style={{ backgroundColor: "var(--card, #1a1a1a)" }}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-border">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                    Standard Operating Procedure
                  </p>
                  <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="shrink-0 p-1 text-gray-500 hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-6">
                {(item.sections ?? []).map((section, i) => (
                  <div key={i}>
                    <h3 className="text-sm font-semibold text-teal mb-2">{section.heading}</h3>
                    <div className="text-sm text-foreground/60 leading-relaxed whitespace-pre-line">
                      {section.body}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border bg-card">
                {signed ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    You have signed off this document.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {signError && (
                      <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{signError}</p>
                    )}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-border accent-teal cursor-pointer"
                      />
                      <span className="text-sm text-foreground/60">
                        I have read and understood this document and agree to comply with its requirements.
                      </span>
                    </label>
                    <button
                      onClick={handleSign}
                      disabled={!agreed || isPending}
                      className="w-full py-2.5 rounded-lg bg-teal text-black text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-teal/90 transition-colors"
                    >
                      {isPending ? "Signing…" : "Sign Off"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
