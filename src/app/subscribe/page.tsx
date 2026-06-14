"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants, type Transition } from "framer-motion";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

/* ── Page-load fireworks ── */
interface FwParticle { x:number; y:number; vx:number; vy:number; color:string; life:number; size:number; }
const FW_COLORS = ["#30B0B0","#7dd8d8","#FBBF24","#FBBF24","#F59E0B","#FCD34D","#D97706","#ffffff","#F472B6","#a78bfa"];

function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: FwParticle[] = [];

    function burst(x: number, y: number) {
      const count = 70 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const spd   = 2.2 + Math.random() * 5.5;
        particles.push({
          x, y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          color: FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)],
          life: 1.0 + Math.random() * 0.25,
          size: 2.5 + Math.random() * 3,
        });
      }
    }

    const launches = [
      { t: 100,  xr: 0.35, yr: 0.20 },
      { t: 380,  xr: 0.65, yr: 0.15 },
      { t: 700,  xr: 0.50, yr: 0.28 },
      { t: 1050, xr: 0.25, yr: 0.22 },
      { t: 1380, xr: 0.75, yr: 0.18 },
      { t: 1750, xr: 0.50, yr: 0.12 },
      { t: 2200, xr: 0.42, yr: 0.25 },
      { t: 2650, xr: 0.68, yr: 0.20 },
      { t: 3100, xr: 0.30, yr: 0.16 },
      { t: 3600, xr: 0.55, yr: 0.30 },
    ];
    const timers = launches.map(({ t, xr, yr }) =>
      setTimeout(() => burst(xr * canvas.width, yr * canvas.height), t)
    );

    let frame: number;
    const start = Date.now();
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x  += p.vx; p.y += p.vy;
        p.vy += 0.07; p.vx *= 0.98;
        p.life -= 0.008;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = p.life * p.life;
        ctx.fillStyle   = p.color;
        ctx.shadowBlur  = p.life > 0.6 ? 8 : 3;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (particles.length > 0 || Date.now() - start < 5500) {
        frame = requestAnimationFrame(animate);
      } else {
        setDone(true);
      }
    }
    animate();

    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(frame); };
  }, []);

  if (done) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }} />;
}

/* ── Live broadcast badge (replaces pill) ── */
const BADGE_MSGS = ["SD INSIDER ACCESS", "WEEKLY SIGNAL", "LIMITED SEATS"];

function LiveBadge() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % BADGE_MSGS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-3 mb-7">
      {/* Animated equaliser bars */}
      <div className="flex items-end gap-0.75 h-4" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-0.75 rounded-sm bg-[#30B0B0]"
            animate={{ height: ["30%", "100%", "50%", "80%", "30%"] }}
            transition={{ duration: 0.9, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: "30%" }}
          />
        ))}
      </div>
      {/* LIVE label */}
      <span className="text-[9px] font-black text-[#30B0B0] tracking-[0.3em] uppercase">Live</span>
      {/* Separator */}
      <span className="text-[#30B0B0]/25 select-none">|</span>
      {/* Cycling message */}
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="text-[10px] font-mono text-[#30B0B0]/80 uppercase tracking-[0.22em]"
        >
          {BADGE_MSGS[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ── Mouse-following teal glow ── */
function MouseGlow() {
  const shouldReduce = useReducedMotion();
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (shouldReduce) return;
    const fn = (e: MouseEvent) =>
      setPos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener("mousemove", fn, { passive: true });
    return () => window.removeEventListener("mousemove", fn);
  }, [shouldReduce]);

  if (shouldReduce) return null;

  return (
    <div
      className="fixed w-150 h-150 rounded-full pointer-events-none select-none transition-all duration-900 ease-out"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, #30B0B012 0%, transparent 65%)",
        filter: "blur(70px)",
      }}
    />
  );
}

/* ── Pulsing radar rings (2 key animated elements max per UX guidelines) ── */
function RadarRings() {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ border: "1px solid #30B0B0" }}
          initial={{ width: 80, height: 80, opacity: 0 }}
          animate={{ width: "130vmax", height: "130vmax", opacity: [0, 0.07, 0] }}
          transition={{ duration: 7, delay: i * 1.75, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ── Typewriter text ── */
function Typewriter({ text, delay = 0, speed = 50 }: { text: string; delay?: number; speed?: number }) {
  const shouldReduce = useReducedMotion();
  const [displayed, setDisplayed] = useState(shouldReduce ? text : "");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (shouldReduce) return;
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay, shouldReduce]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [started, text, speed]);

  const done = displayed.length >= text.length;

  return (
    <span>
      {displayed}
      {!done && started && (
        <motion.span
          aria-hidden="true"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-2.5 bg-[#30B0B0] ml-0.5 align-middle"
        />
      )}
    </span>
  );
}

/* ── Success confetti ── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: 10 + (i * 31 + 7) % 80,
  yEnd: -(150 + (i * 23) % 100),
  size: 3 + (i * 5) % 5,
  dur: 1 + (i * 3) % 12 / 10,
  delay: (i * 11) % 6 / 10,
  color: i % 3 === 0 ? "#30B0B0" : i % 3 === 1 ? "#ffffff" : "#30B0B044",
  round: i % 4 === 0,
}));

function SuccessParticles() {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute", left: `${p.x}%`, bottom: "50%",
            width: p.size, height: p.size,
            borderRadius: p.round ? "50%" : "2px",
            background: p.color,
          }}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: p.yEnd, opacity: 0 }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/* ── Variants ── */
const spring: Transition = { type: "spring", stiffness: 240, damping: 22 };

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: spring },
};

/* ── Page ── */
export default function SubscribePage() {
  const [email, setEmail]   = useState("");
  const [name, setName]     = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [nameFocused,  setNameFocused]  = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const nameActive  = nameFocused  || name.length  > 0;
  const emailActive = emailFocused || email.length > 0;
  const formFocused = nameFocused  || emailFocused;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    if (res.ok) {
      setStatus("success");
    } else {
      const d = await res.json();
      setErrMsg(d.error ?? "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center px-5 relative overflow-hidden">
      <MouseGlow />
      <RadarRings />

      {/* Film grain noise overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none opacity-[0.035] select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative z-10 w-full max-w-105">
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center gap-2.5 mb-10"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.png" alt="Swift Designz" width={30} height={30} className="rounded-lg" />
          <span className="text-sm font-semibold text-white/60 tracking-tight">Swift Designz</span>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            /* ─── Success ─── */
            <motion.div
              key="success"
              className="relative text-center space-y-5 py-10"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
            >
              <Fireworks />
              <SuccessParticles />

<motion.p
                className="text-[10px] font-mono text-[#30B0B0] uppercase tracking-[0.32em]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.78 }}
              >
                Access Granted
              </motion.p>

              <motion.h1
                className="text-3xl font-black text-white leading-tight"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.92, ...spring }}
              >
                You&apos;re in the<br />
                <span className="text-[#30B0B0]">Inner Circle.</span>
              </motion.h1>

              <motion.p
                className="text-gray-300 text-sm leading-[1.7] max-w-xs mx-auto"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
              >
                Watch your inbox. Your first insight drops soon.
              </motion.p>


              <motion.a
                href="https://www.swiftdesignz.co.za/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#30B0B0] text-white text-sm font-semibold hover:bg-[#30B0B0]/80 transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.25 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Questions? <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </motion.a>
            </motion.div>
          ) : (
            /* ─── Form ─── */
            <motion.div key="form" variants={container} initial="hidden" animate="show">
              {/* Live broadcast badge */}
              <motion.div variants={fadeUp}>
                <LiveBadge />
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                className="text-5xl font-black text-white leading-none mb-4 tracking-tight"
              >
                The<br />
                <span className="text-[#30B0B0]">Inner</span> Circle.
              </motion.h1>

              {/* Copy */}
              <motion.p
                variants={fadeUp}
                className="text-gray-300 text-sm leading-[1.75] mb-8 max-w-85"
              >
                Every week — one email. The strategies, tools, and insights behind building
                digital businesses across Namibia and South Africa.{" "}
                <span className="text-amber-400">Not for everyone. For you.</span>
              </motion.p>

              {/* Form card */}
              <motion.form
                data-bounce
                variants={fadeUp}
                onSubmit={handleSubmit}
                noValidate
                className={`space-y-7 p-6 rounded-2xl border transition-all duration-300 bg-white/1.5 ${
                  formFocused
                    ? "border-[#30B0B0]/20 shadow-[0_0_40px_rgba(48,176,176,0.07)]"
                    : "border-white/5"
                }`}
              >
                {/* Name field — floating label */}
                <div className="relative pt-5 pb-1">
                  <motion.label
                    htmlFor="sub-name"
                    animate={nameActive
                      ? { y: -20, scale: 0.82, color: nameFocused ? "#FBBF24" : "rgba(251,191,36,0.5)" }
                      : { y: 0,   scale: 1,    color: "rgba(255,255,255,0.25)" }
                    }
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute left-0 top-5 text-[11px] font-mono uppercase tracking-[0.18em] origin-left cursor-text pointer-events-none"
                  >
                    Name
                    {nameActive && (
                      <span className="text-amber-400/40 normal-case tracking-normal font-sans ml-1">(optional)</span>
                    )}
                  </motion.label>
                  <input
                    id="sub-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    placeholder={nameActive ? "Your name" : ""}
                    className="w-full bg-transparent py-2 text-sm text-white placeholder-white/20 focus:outline-none"
                  />
                  {/* Underline */}
                  <div className="relative h-px">
                    <div className="absolute inset-0 bg-white/9" />
                    <motion.div
                      className="absolute inset-0 bg-[#30B0B0]"
                      animate={{ scaleX: nameFocused ? 1 : 0 }}
                      style={{ originX: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Email field — floating label */}
                <div className="relative pt-5 pb-1">
                  <motion.label
                    htmlFor="sub-email"
                    animate={emailActive
                      ? { y: -20, scale: 0.82, color: emailFocused ? "#FBBF24" : "rgba(251,191,36,0.5)" }
                      : { y: 0,   scale: 1,    color: "rgba(255,255,255,0.25)" }
                    }
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute left-0 top-5 text-[11px] font-mono uppercase tracking-[0.18em] origin-left cursor-text pointer-events-none"
                  >
                    Email <span style={{ color: "#30B0B0" }} aria-hidden="true">*</span>
                  </motion.label>
                  <input
                    id="sub-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder={emailActive ? "you@business.com" : ""}
                    aria-required="true"
                    className="w-full bg-transparent py-2 text-sm text-white placeholder-white/20 focus:outline-none"
                  />
                  {/* Underline */}
                  <div className="relative h-px">
                    <div className="absolute inset-0 bg-white/9" />
                    <motion.div
                      className="absolute inset-0 bg-[#30B0B0]"
                      animate={{ scaleX: emailFocused ? 1 : 0 }}
                      style={{ originX: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {status === "error" && (
                  <motion.p
                    className="text-xs text-red-400 -mt-3"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    aria-live="polite"
                  >
                    {errMsg}
                  </motion.p>
                )}

                {/* Submit — shimmer on hover, glow when email ready */}
                <motion.button
                  data-bounce
                  type="submit"
                  disabled={status === "loading"}
                  className="relative w-full overflow-hidden flex items-center justify-center gap-2 py-3.5 rounded-xl text-[#0c3535] text-sm font-bold tracking-wide hover:brightness-110 transition-[filter,box-shadow] disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#30B0B0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101010]"
                  style={{
                    background: "linear-gradient(180deg, #4ecece 0%, #30B0B0 42%, #1e9898 100%)",
                    boxShadow: emailActive
                      ? "0 0 28px rgba(48,176,176,0.45), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)"
                      : "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)",
                    textShadow: "0 1px 0 rgba(255,255,255,0.15)",
                  }}
                  whileHover="hover"
                  whileTap={{ scale: 0.97 }}
                  animate={emailActive ? { scale: 1 } : { scale: 1 }}
                >
                  {/* Shimmer sweep */}
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-y-0 w-28 bg-linear-to-r from-transparent via-white/50 to-transparent -skew-x-12 pointer-events-none"
                    variants={{ hover: { translateX: ["-96px", "calc(100% + 96px)"] } }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ left: 0 }}
                  />
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-label="Submitting" />
                  ) : (
                    <>
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      Request Access
                      <ArrowRight className="h-3.5 w-3.5 ml-0.5" aria-hidden="true" />
                    </>
                  )}
                </motion.button>
              </motion.form>

              {/* Footer */}
              <motion.p
                variants={fadeUp}
                className="mt-5 text-[11px] font-mono text-amber-400/45 text-center"
              >
                No spam &middot; Unsubscribe any time &middot; Built in Namibia
              </motion.p>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
