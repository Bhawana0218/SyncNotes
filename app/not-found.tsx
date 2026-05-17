import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/public/Logo.png";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-30 h-30 rounded-3xl bg-zinc-900 flex items-center justify-center mx-auto">
          <Image src={Logo} alt="SyncNotes Logo" />
        </div>
        <div>
          <h1 className="text-6xl font-bold text-zinc-700 mb-3">404</h1>
          <h2 className="text-2xl font-bold">Page not found</h2>
          <p className="text-zinc-500 mt-2">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-semibold hover:scale-[1.02] transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
