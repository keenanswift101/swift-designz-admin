"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants, type Transition } from "framer-motion";
import { Mail, Loader2, ArrowRight } from "lucide-react";

/* ── Floating background orbs ── */
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
      <motion.div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, #30B0B020 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, #30B0B018 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, #30B0B00a 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#30B0B0 1px, transparent 1px), linear-gradient(90deg, #30B0B0 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

/* ── Particle data computed once at module level (pure) ── */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id:     i,
  x:      30 + (((i * 37 + 13) % 40)),
  size:   3  + ((i * 7) % 6),
  dur:    1.2 + ((i * 3) % 15) / 10,
  delay:  ((i * 11) % 6) / 10,
  color:  i % 4 === 0 ? "#30B0B0" : i % 4 === 1 ? "#ffffff" : i % 4 === 2 ? "#30B0B088" : "#ffffff44",
  rotate: (i * 47) % 360,
  yEnd:   -(180 + ((i * 23) % 120)),
}));

/* ── Floating confetti particles on success ── */
function SuccessParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left:     `${p.x}%`,
            bottom:   "45%",
            width:    p.size,
            height:   p.size,
            borderRadius: p.id % 3 === 0 ? "50%" : "2px",
            background:   p.color,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: p.yEnd, opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ── Animated SVG checkmark ── */
function AnimatedCheck() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <motion.circle
        cx="36" cy="36" r="34"
        stroke="#30B0B0" strokeWidth="2.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.path
        d="M22 36 l10 10 l18-18"
        stroke="#30B0B0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
      />
    </svg>
  );
}

const spring: Transition = { type: "spring", stiffness: 260, damping: 22 };

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { ...spring } },
};

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
    <div className="min-h-screen bg-[#101010] flex items-center justify-center px-4 relative">
      <BackgroundOrbs />

      <div className="relative w-full max-w-md z-10">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.png" alt="Swift Designz" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-bold text-[#30B0B0] tracking-tight">Swift Designz</span>
        </motion.div>

        <AnimatePresence mode="wait">
          {state === "success" ? (
            /* ── Success state ── */
            <motion.div
              key="success"
              className="relative text-center space-y-5 py-10"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <SuccessParticles />
              <motion.div
                className="flex justify-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <AnimatedCheck />
              </motion.div>
              <motion.h1
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
              >
                You&apos;re In!
              </motion.h1>
              <motion.p
                className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                Welcome to the Swift Designz newsletter. Weekly insights on web design,
                digital strategy, and what we are building for businesses in Namibia and beyond.
              </motion.p>
              <motion.a
                href="https://www.swiftdesignz.co.za/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#30B0B0] text-sm text-white font-semibold hover:bg-[#30B0B0]/80 transition-colors"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.4 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Questions?
              </motion.a>
            </motion.div>
          ) : (
            /* ── Subscribe form ── */
            <motion.div
              key="form"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              <motion.h1 variants={fadeUp} className="text-4xl font-bold text-white leading-tight mb-3">
                Stay in the loop.
              </motion.h1>
              <motion.p variants={fadeUp} className="text-gray-400 text-sm leading-relaxed mb-8">
                Weekly insights on web design, e-commerce, AI tools, and digital growth for SMEs
                in Namibia and South Africa. No spam. Unsubscribe any time.
              </motion.p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={fadeUp}>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Name <span className="text-gray-600">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#30B0B0]/50 focus:bg-white/[0.06] transition-all"
                  />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Email <span className="text-[#30B0B0]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#30B0B0]/50 focus:bg-white/[0.06] transition-all"
                  />
                </motion.div>

                {state === "error" && (
                  <motion.p
                    className="text-xs text-red-400"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  >
                    {errMsg}
                  </motion.p>
                )}

                <motion.div variants={fadeUp}>
                  <motion.button
                    type="submit"
                    disabled={state === "loading"}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#30B0B0] text-white text-sm font-semibold hover:bg-[#30B0B0]/85 transition-colors disabled:opacity-50 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {state === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Subscribe
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-[11px] text-gray-600 text-center"
              >
                By subscribing you agree to receive weekly emails from Swift Designz.
                Unsubscribe any time.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
