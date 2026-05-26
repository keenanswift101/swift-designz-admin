"use client";

import { useState, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Send, FileText, Info } from "lucide-react";

type Variant = "danger" | "warning" | "send" | "convert" | "default";

interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
}

interface ConfirmState extends ConfirmOptions {
  message: string;
  resolve: (v: boolean) => void;
}

const ICON: Record<Variant, ReactNode> = {
  danger: (
    <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
      <AlertTriangle className="h-5 w-5 text-red-400" />
    </div>
  ),
  warning: (
    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
      <AlertTriangle className="h-5 w-5 text-amber-400" />
    </div>
  ),
  send: (
    <div className="w-10 h-10 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center shrink-0">
      <Send className="h-5 w-5 text-teal" />
    </div>
  ),
  convert: (
    <div className="w-10 h-10 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center shrink-0">
      <FileText className="h-5 w-5 text-teal" />
    </div>
  ),
  default: (
    <div className="w-10 h-10 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center shrink-0">
      <Info className="h-5 w-5 text-teal" />
    </div>
  ),
};

const BTN: Record<Variant, string> = {
  danger: "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25",
  warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25",
  send: "bg-teal text-background hover:bg-teal/90",
  convert: "bg-teal text-background hover:bg-teal/90",
  default: "bg-teal text-background hover:bg-teal/90",
};

export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback(
    (message: string, options?: ConfirmOptions): Promise<boolean> =>
      new Promise((resolve) => setState({ message, ...options, resolve })),
    []
  );

  function handleConfirm() {
    state?.resolve(true);
    setState(null);
  }

  function handleCancel() {
    state?.resolve(false);
    setState(null);
  }

  const variant: Variant = state?.variant ?? "default";

  const ConfirmDialog =
    state && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={handleCancel}
            />
            <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-6 pt-6 pb-5 flex gap-4">
                {ICON[variant]}
                <div className="flex-1 min-w-0 pt-0.5">
                  {state.title && (
                    <h3 className="text-sm font-semibold text-foreground mb-1.5">
                      {state.title}
                    </h3>
                  )}
                  <p className="text-sm text-gray-400 leading-relaxed">{state.message}</p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-foreground transition-colors"
                >
                  {state.cancelLabel ?? "Cancel"}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${BTN[variant]}`}
                >
                  {state.confirmLabel ?? "Confirm"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return { confirm, ConfirmDialog };
}
