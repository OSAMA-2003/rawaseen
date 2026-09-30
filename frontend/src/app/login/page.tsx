"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ApiClientError } from "../../lib/api";

const loginFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email cannot be empty")
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password cannot be empty"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}`);
      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err instanceof ApiClientError
          ? err.message
          : err?.message || "Invalid credentials. Please verify your email and password.";
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleQuickFill = (role: "admin" | "sales") => {
    if (role === "admin") {
      setValue("email", "admin@rawasin.sa");
      setValue("password", "AdminPassword123!");
    } else {
      setValue("email", "sales@rawasin.sa");
      setValue("password", "SalesPassword123!");
    }
    setServerError(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#fbfaf8] text-stone-900 selection:bg-[#9b7c52] selection:text-white flex flex-col justify-between overflow-hidden">
      {/* Background Architectural Grid & Subtle Radial Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#9b7c52]/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 mx-auto w-full max-w-[1500px] px-6 py-6 md:px-12 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.22em] text-stone-600 hover:text-stone-900 transition-colors duration-300"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back to Architecture</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-[#9b7c52] border border-[#9b7c52]/40 bg-white px-2.5 py-1 shadow-xs">
            Enterprise Portal
          </span>
        </div>
      </header>

      {/* Main Authentication Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[460px] bg-white/95 backdrop-blur-xl border border-stone-200 p-8 md:p-10 shadow-xl relative">
          {/* Subtle Accent Edge Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9b7c52] to-transparent opacity-80" />

          {/* Logo & Headline */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <img
                src="/logo-black.png"
                alt="Rawasin Real Estate"
                className="h-10 mx-auto object-contain"
              />
            </Link>
            <h1 className="text-xl md:text-2xl font-normal tracking-tight text-stone-900 mb-2">
              Staff & CRM Login
            </h1>
            <p className="font-mono text-xs text-stone-500 tracking-wider uppercase">
              بوابة الإدارة وفرق المبيعات
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 p-3.5 text-xs text-red-700">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-stone-600"
              >
                Work Email <span className="text-[#9b7c52]">*</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@rawasin.sa"
                  {...register("email")}
                  className={`w-full bg-stone-50 border px-4 py-3 pl-10 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white transition-colors duration-200 ${
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-stone-300 focus:border-[#9b7c52]"
                  }`}
                />
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
              </div>
              {errors.email && (
                <p className="font-mono text-[0.7rem] text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-stone-600"
                >
                  Password <span className="text-[#9b7c52]">*</span>
                </label>
                <span className="font-mono text-[0.65rem] text-stone-400 tracking-wider">
                  8+ characters
                </span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  {...register("password")}
                  className={`w-full bg-stone-50 border px-4 py-3 pl-10 pr-10 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white transition-colors duration-200 ${
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-stone-300 focus:border-[#9b7c52]"
                  }`}
                />
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="font-mono text-[0.7rem] text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-3.5 w-3.5 rounded-none border-stone-300 bg-stone-50 text-[#9b7c52] focus:ring-0 cursor-pointer accent-[#9b7c52]"
                />
                <span className="font-mono text-[0.7rem] text-stone-600 tracking-wider uppercase">
                  Keep me signed in
                </span>
              </label>

              <span className="font-mono text-[0.68rem] text-stone-500 hover:text-[#9b7c52] transition-colors cursor-help">
                Contact Admin for access
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full overflow-hidden bg-stone-900 text-white py-3.5 px-6 font-mono text-xs uppercase tracking-[0.24em] font-medium hover:bg-[#9b7c52] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Demo Badges */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-stone-500 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#9b7c52]" />
                Demo Credentials
              </span>
              <span className="font-mono text-[0.65rem] text-stone-400">
                Click to populate
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin")}
                className="text-left p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-400 transition-colors cursor-pointer"
              >
                <div className="font-mono text-[0.7rem] text-[#9b7c52] uppercase tracking-wider font-semibold">
                  Administrator
                </div>
                <div className="font-mono text-[0.65rem] text-stone-500 truncate">
                  admin@rawasin.sa
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("sales")}
                className="text-left p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-400 transition-colors cursor-pointer"
              >
                <div className="font-mono text-[0.7rem] text-stone-800 uppercase tracking-wider font-semibold">
                  Sales Agent
                </div>
                <div className="font-mono text-[0.65rem] text-stone-500 truncate">
                  sales@rawasin.sa
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 mx-auto w-full max-w-[1500px] px-6 py-6 text-center">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] text-stone-500 uppercase">
          Rawasin Real Estate Platform &copy; 2026 — Secure RBAC Enterprise Architecture
        </p>
      </footer>
    </div>
  );
}
