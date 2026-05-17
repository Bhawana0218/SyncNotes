"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Zap, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      await axios.post("/api/register", { name, email, password });
      setSuccess(true);

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Something went wrong. Please try again.";
      setError(msg);
      setLoading(false);
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
            <h1 className="text-3xl font-bold text-white">Create account</h1>
            <p className="text-zinc-400 text-sm">Start your AI-powered workspace</p>
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

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Account created! Redirecting...
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block">Full Name</label>
              <Input
                name="name"
                placeholder="John Doe"
                required
                className="w-full h-11 rounded-xl bg-zinc-800 border border-zinc-700 px-4 text-white focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

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
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
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
              disabled={loading || success}
              className="w-full h-11 rounded-xl bg-white text-black font-semibold hover:scale-[1.01] transition mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
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
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full h-11 rounded-xl bg-white flex items-center justify-center gap-3 text-black font-medium hover:scale-[1.01] transition"
          >
            <FcGoogle size={20} />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
