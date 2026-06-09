"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { useSearchParams } from "next/navigation";
import { signIn, verifyOtp, requestMagicLink } from "@/app/auth/actions";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [useOtp, setUseOtp] = useState(() => searchParams.get("otp") === "1");
  // If email is in the URL (invite link), skip straight to the code-entry step
  const [otpStep, setOtpStep] = useState<"email" | "code">(() =>
    searchParams.get("otp") === "1" && emailParam ? "code" : "email"
  );
  const [otpEmail, setOtpEmail] = useState(() => emailParam);

  function signInWithGoogle() {
    setGoogleLoading(true);
    setError(null);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!clientId) {
      setError("Google sign-in is not configured.");
      setGoogleLoading(false);
      return;
    }
    const state = crypto.randomUUID();
    document.cookie = `oauth_state=${state}; path=/; max-age=300; samesite=lax`;
    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("state", state);
    window.location.href = url.toString();
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    flushSync(() => {
      setLoading(true);
      setSigningIn(true);
      setError(null);
    });
    const result = await signIn(formData);
    if (result?.error) {
      flushSync(() => {
        setError(result.error!);
        setLoading(false);
        setSigningIn(false);
      });
    }
  }

  async function handleSendOtp(formData: FormData) {
    setLoading(true);
    setError(null);
    const email = formData.get("email") as string;
    const result = await requestMagicLink(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOtpEmail(email);
      setOtpStep("code");
      setLoading(false);
    }
  }

  async function handleVerifyOtp(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("email", otpEmail);
    const result = await verifyOtp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  function switchMode(otp: boolean) {
    setUseOtp(otp);
    setOtpStep("email");
    setOtpEmail("");
    setError(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">

      {/* Sign-in loading overlay */}
      {signingIn && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            {/* Door loader */}
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-teal/30 bg-teal/5">
              {/* Left door */}
              <div
                className="absolute inset-y-0 left-0 w-1/2 bg-teal/25 border-r border-teal/50 origin-left"
                style={{ animation: "doorOpen 2s ease-in-out infinite" }}
              >
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-0.5 rounded-full bg-teal" />
              </div>
              {/* Right door */}
              <div
                className="absolute inset-y-0 right-0 w-1/2 bg-teal/25 border-l border-teal/50 origin-right"
                style={{ animation: "doorOpen 2s ease-in-out infinite" }}
              >
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3.5 w-0.5 rounded-full bg-teal" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-foreground tracking-tight">
                Signing you into the
              </p>
              <p className="text-2xl font-bold text-teal">
                Swift Designz Portal
              </p>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[0,1,2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-teal animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal tracking-tight">Swift Designz</h1>
          <p className="text-sm text-teal-muted mt-1">Admin Portal</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {useOtp ? (otpStep === "email" ? "Sign In with OTP" : "Enter Your Code") : "Sign In"}
          </h2>

          {/* Password login */}
          {!useOtp && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                <input id="email" name="email" type="email" required autoComplete="email"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
                  placeholder="keenan@swiftdesignz.co.za" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password"
                    className="w-full px-4 py-2.5 pr-10 bg-card border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
                    placeholder="Enter your password" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />
                    }
                  </button>
                </div>
              </div>
              {error && <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 px-4 bg-teal hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* OTP step 1: send code */}
          {useOtp && otpStep === "email" && (
            <form action={handleSendOtp} className="space-y-5">
              <div>
                <label htmlFor="otp-email" className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                <input id="otp-email" name="email" type="email" required autoComplete="email"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors"
                  placeholder="your@email.com" />
                <p className="text-xs text-gray-500 mt-1.5">A 6-digit code will be sent to your inbox.</p>
              </div>
              {error && <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 px-4 bg-teal hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending..." : "Send OTP Code"}
              </button>
            </form>
          )}

          {/* OTP step 2: verify code */}
          {useOtp && otpStep === "code" && (
            <form action={handleVerifyOtp} className="space-y-5">
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Code sent to <span className="text-teal font-medium">{otpEmail}</span>.
                  Check your inbox.
                </p>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-400 mb-1.5">OTP Code</label>
                <input id="otp" name="otp" type="text" required inputMode="numeric" maxLength={6} autoComplete="one-time-code"
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors tracking-widest text-center text-lg font-mono"
                  placeholder="000000" autoFocus />
              </div>
              {error && <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 px-4 bg-teal hover:bg-teal-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
              <button type="button" onClick={() => { setOtpStep("email"); setError(null); }}
                className="w-full text-xs text-gray-500 hover:text-teal transition-colors">
                Use a different email
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-gray-600">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google sign-in */}
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={googleLoading || loading}
            className="mt-4 w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-border bg-card hover:bg-white/5 text-sm font-medium text-foreground transition-colors disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="mt-4 text-center">
            <button type="button" onClick={() => switchMode(!useOtp)}
              className="text-xs text-gray-500 hover:text-teal transition-colors">
              {useOtp ? "Sign in with password instead" : "First time? Sign in with invite OTP"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Swift Designz Admin &mdash; Authorized access only
        </p>
      </div>
    </div>
  );
}

