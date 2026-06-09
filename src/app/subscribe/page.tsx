"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

export default function SubscribePage() {
  const [email, setEmail]   = useState("");
  const [name, setName]     = useState("");
  const [state, setState]   = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrMsg("");

    const res = await fetch("/api/subscribe", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, name }),
    });

    if (res.ok) {
      setState("success");
    } else {
      const data = await res.json();
      setErrMsg(data.error ?? "Something went wrong.");
      setState("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.png" alt="Swift Designz" width={36} height={36} />
          <span className="text-lg font-bold text-[#30B0B0] tracking-tight">Swift Designz</span>
        </div>

        {state === "success" ? (
          <div className="text-center space-y-4 py-8">
            <CheckCircle2 className="h-14 w-14 text-[#30B0B0] mx-auto" />
            <h1 className="text-2xl font-bold text-white">You&apos;re In!</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Welcome to the Swift Designz newsletter. You will get weekly insights on web design,
              digital strategy, and what we are building for businesses in Namibia and beyond.
            </p>
            <a
              href="https://www.swiftdesignz.co.za/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl border border-[#2a2a2a] text-sm text-gray-400 hover:text-white hover:border-[#30B0B0]/40 transition-colors"
            >
              Questions?
            </a>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white leading-tight mb-2">
              Stay in the loop.
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Weekly insights on web design, e-commerce, AI tools, and digital growth for SMEs in
              Namibia and South Africa. No spam. Unsubscribe any time.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Name <span className="text-gray-600">(optional)</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#30B0B0]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#30B0B0]/50 transition-colors"
                />
              </div>

              {state === "error" && (
                <p className="text-xs text-red-400">{errMsg}</p>
              )}

              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#30B0B0] text-white text-sm font-semibold hover:bg-[#30B0B0]/80 transition-colors disabled:opacity-50"
              >
                {state === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {state === "loading" ? "Subscribing..." : "Subscribe"}
              </button>
            </form>

            <p className="mt-6 text-[11px] text-gray-600 text-center">
              By subscribing you agree to receive weekly emails from Swift Designz.
              You can unsubscribe at any time.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
