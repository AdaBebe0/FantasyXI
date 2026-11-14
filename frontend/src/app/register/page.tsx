"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { redirectToGoogleSignIn, safeReturnTo } from "@/lib/googleAuth";
import { IconFootball, IconGoogle, IconAlertCircle, IconCheck } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = requestedReturnTo ? safeReturnTo(requestedReturnTo) : "/team";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(returnTo);
    }
  }, [isAuthenticated, router, returnTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side validations
    if (!username.trim() || !email.trim() || !password) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    if (username.trim().length < 3 || username.trim().length > 20) {
      setErrorMsg("Username must be between 3 and 20 characters.");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username.trim())) {
      setErrorMsg("Username can only contain letters, numbers, and underscores.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: {
          token: string;
          user: {
            id: string;
            email: string;
            username: string;
            name?: string | null;
            createdAt: string;
          };
        };
      }>("/api/v1/auth/register", {
        email: email.trim(),
        password,
        username: username.trim(),
        name: name.trim() || undefined,
      });

      if (response?.data?.token && response?.data?.user) {
        login(response.data.token, response.data.user);
        router.push(returnTo);
      } else {
        setErrorMsg("Account created, but failed to obtain authentication session.");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || "Registration failed.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to register. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    redirectToGoogleSignIn(returnTo);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200/80 text-[#37003c] mb-4 shadow-sm">
          <IconFootball className="w-7 h-7 text-[#37003c]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase font-sans">
          Register Manager Account
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          Build your £100m squad, lead leagues, and play for verified USDC rewards.
        </p>
      </div>

      {/* Registration Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Pitch line accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#37003c] via-[#4d0c5a] to-[#00ff87]" />

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-semibold animate-shake">
            <IconAlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{errorMsg}</div>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#37003c]/20 shadow-2xs group cursor-pointer"
        >
          <IconGoogle className="w-4 h-4 flex-shrink-0 group-hover:scale-105 transition-transform" />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
              Or fill manager details
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Manager Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stanley Davis"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#37003c] focus:ring-1 focus:ring-[#37003c] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Username <span className="text-rose-500">*</span>
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="stanley_xi"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#37003c] focus:ring-1 focus:ring-[#37003c] transition-colors font-mono"
            />
            <p className="mt-1 text-[10px] text-slate-400">
              3-20 characters, letters, numbers, and underscores only.
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@fantasyxi.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#37003c] focus:ring-1 focus:ring-[#37003c] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                Password <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#37003c] focus:ring-1 focus:ring-[#37003c] transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:border-[#37003c] focus:ring-1 focus:ring-[#37003c] transition-colors"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center text-xs font-bold tracking-wide uppercase"
              isLoading={isSubmitting}
            >
              Create Account & Pick Squad
            </Button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href={`/login${returnTo !== "/team" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
            className="text-[#37003c] hover:underline font-bold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Security note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Bcrypt encrypted &bull; Soroban escrow ready</span>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4">
      <Suspense
        fallback={
          <div className="text-center py-20 text-slate-400">
            <div className="inline-block w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Preparing Registration Form...</p>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
