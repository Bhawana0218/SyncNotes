"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Check, Globe, Link2, ExternalLink, X } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
}

export function ShareModal({ open, onOpenChange, noteId }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unsharing, setUnsharing] = useState(false);

  async function generateShareLink() {
    setLoading(true);
    try {
      const res = await axios.post("/api/notes/share", { noteId });
      const url = `${window.location.origin}/shared/${res.data.shareId}`;
      setShareUrl(url);
      toast.success("Public link generated");
    } catch {
      toast.error("Failed to generate share link");
    } finally {
      setLoading(false);
    }
  }

  async function revokeShareLink() {
    setUnsharing(true);
    try {
      await axios.delete("/api/notes/share", { data: { noteId } });
      setShareUrl("");
      toast.success("Share link revoked");
    } catch {
      toast.error("Failed to revoke share link");
    } finally {
      setUnsharing(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Share Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Public Sharing</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Anyone with the link can view this note — no login required.
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!shareUrl ? (
              <motion.div
                key="generate"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <Button
                  onClick={generateShareLink}
                  disabled={loading}
                  className="w-full h-11 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] transition"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Generate Public Link
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="share"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-3"
              >
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 flex items-center gap-2">
                  <p className="text-xs text-zinc-300 break-all flex-1">{shareUrl}</p>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-zinc-500 hover:text-white transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={copyLink}
                    className="flex-1 h-10 rounded-xl bg-white text-black font-semibold flex items-center justify-center gap-2 text-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={revokeShareLink}
                    disabled={unsharing}
                    className="h-10 px-4 rounded-xl bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 flex items-center gap-1.5 text-sm transition"
                  >
                    <X className="w-4 h-4" />
                    Revoke
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}