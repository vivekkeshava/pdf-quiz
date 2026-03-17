"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg(null);

    const result = await signIn("nodemailer", {
      email,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setStatus("error");
      setErrorMsg("Failed to send login link. Please try again.");
    } else {
      setStatus("sent");
    }
  }

  async function handleGoogleSignIn() {
    setErrorMsg(null);
    await signIn("google", { callbackUrl });
  }

  if (status === "sent") {
    return (
      <div className="w-full max-w-md text-center animate-fade-slide-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 mb-6">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Check your email</h1>
        <p className="text-slate-400 mb-2">We sent a sign-in link to</p>
        <p className="text-indigo-300 font-medium mb-6">{email}</p>
        <p className="text-slate-500 text-sm">
          Click the link in the email to sign in. The link expires in 1 hour.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-8 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-xs text-slate-300 mb-6">
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Powered by Claude AI
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">PDF Quiz Generator</h1>
        <p className="text-slate-400">Sign in to generate and save quizzes</p>
      </div>

      <div className="bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl p-8 space-y-5">
        {(error || errorMsg) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
            {errorMsg ?? "Sign-in failed. Please try again."}
          </div>
        )}

        {/* Google OAuth */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-900 font-semibold rounded-xl transition-all shadow-lg"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-slate-500 text-xs">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Magic link */}
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              maxLength={254}
              disabled={status === "loading"}
              className="w-full px-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white placeholder-slate-500
                focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30
                disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!email.trim() || status === "loading"}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-[0.98] text-white font-semibold rounded-xl
              disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Sending link…
              </span>
            ) : (
              "Send sign-in link"
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-slate-600 text-xs mt-6">
        By signing in, you agree to use this service responsibly.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
