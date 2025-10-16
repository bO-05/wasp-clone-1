import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-white/10 bg-black/70 p-6 backdrop-blur-sm">
        <h1 className="mb-2 text-2xl font-bold text-white">Sign in</h1>
        <p className="mb-6 text-sm text-white/60">Sign in to enable cloud sync for your Desktop. Not required for playground.</p>
        <LoginForm />
        <div className="mt-6 text-xs text-white/50">
          <span>Return to </span>
          <Link href="/desktop" className="text-[#FECC00] hover:opacity-80">Desktop</Link>
        </div>
      </div>
    </div>
  );
}