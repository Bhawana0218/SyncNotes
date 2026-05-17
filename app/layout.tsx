import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/providers/session-provider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SyncNotes — AI-Powered Notes Workspace",
    template: "%s — SyncNotes",
  },
  description:
    "Create, organize, summarize, and share intelligent notes with AI-powered workflows. The modern workspace for productive thinkers.",
  keywords: ["notes", "AI", "productivity", "workspace", "summaries", "collaboration"],
  authors: [{ name: "SyncNotes" }],
  creator: "SyncNotes",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "SyncNotes — AI-Powered Notes Workspace",
    description: "Create, organize, and share intelligent notes with AI-powered insights.",
    siteName: "SyncNotes",
  },
  twitter: {
    card: "summary_large_image",
    title: "SyncNotes — AI-Powered Notes Workspace",
    description: "Create, organize, and share intelligent notes with AI-powered insights.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <ThemeProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
