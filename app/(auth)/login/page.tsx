"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { Zap, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold">SyncNotes</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="space-y-1.5 mb-7 text-center">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-zinc-400 text-sm">Sign in to your workspace</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full h-11 rounded-xl bg-zinc-800 border border-zinc-700 px-4 text-white focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 rounded-xl bg-zinc-800 border border-zinc-700 px-4 pr-11 text-white focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-white text-black font-semibold hover:scale-[1.01] transition mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="border-t border-zinc-700" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-zinc-900 px-3 text-xs text-zinc-500">
              OR
            </span>
          </div>

          <Button
            type="button"
            onClick={() => {
              setGoogleLoading(true);
              signIn("google", { callbackUrl: "/dashboard" });
            }}
            disabled={googleLoading}
            className="w-full h-11 rounded-xl bg-white flex items-center justify-center gap-3 text-black font-medium hover:scale-[1.01] transition"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <FcGoogle size={20} />
            )}
            Continue with Google
          </Button>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white hover:underline font-medium">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
