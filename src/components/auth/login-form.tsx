"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const LoginForm = () => {
  const router = useRouter();
  const search = useSearchParams();
  const redirectParam = search?.get("redirect");
  const redirect = useMemo(() => redirectParam || "/desktop", [redirectParam]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
      callbackURL: redirect,
    });

    if (error?.code) {
      toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
      setLoading(false);
      return;
    }

    toast.success("Signed in! Redirecting...");
    router.push(redirect);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-white/70">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#FECC00]"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-white/70">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#FECC00]"
          placeholder="••••••••"
          autoComplete="off"
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-white/70">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Remember me</span>
        </label>
        <span className="text-white/40">Optional sign-in for cloud sync</span>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full border border-[#FECC00] bg-[#FECC00] px-3 py-2 text-sm font-bold uppercase tracking-wide text-black transition-all hover:bg-[#FECC00]/80 disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};