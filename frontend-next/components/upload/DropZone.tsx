"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { uploadDocuments, getInsights } from "@/lib/api";
import type { UploadedFile } from "@/lib/store";
import { KonohaSwirl } from "@/app/page";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DropZone() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSmoke, setShowSmoke] = useState(false);

  const {
    isUploading,
    uploadProgress,
    uploadStage,
    setSession,
    setUploading,
    setUploadProgress,
    setInsights,
    setLoadingInsights,
  } = useAppStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const valid = acceptedFiles.filter((f) => {
        const ext = f.name.split(".").pop()?.toLowerCase();
        return ["pdf", "docx", "txt"].includes(ext || "");
      });
      if (valid.length === 0) {
        setError("Please upload PDF, DOCX, or TXT files.");
        return;
      }
      setSelectedFiles((prev) => [...prev, ...valid]);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0, "Initiating Sealing Jutsu...");
    setError(null);

    try {
      setUploadProgress(10, "Inscribing Sealing Formula (Fūinjutsu)...");

      const result = await uploadDocuments(selectedFiles, (progress) => {
        setUploadProgress(Math.min(progress * 0.4, 40), "Writing Sealing Tags...");
      });

      setUploadProgress(50, "Gathering Nature Energy (Chakra)...");

      const files: UploadedFile[] = selectedFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }));

      setUploadProgress(80, "Mapping Ninja Registry (Vector Index)...");
      setSession(result.session_id, files);

      setUploadProgress(90, "Deciphering Scroll Secrets...");

      // Fetch insights
      setLoadingInsights(true);
      try {
        const insights = await getInsights(result.session_id);
        setInsights(insights);
      } catch {
        // Insights are optional
      }

      setUploadProgress(100, "Kuchiyose: Complete!");
      setShowSmoke(true);
      setTimeout(() => {
        setShowSmoke(false);
      }, 900);
      setSelectedFiles([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Jutsu failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Smoke Puff Overlay */}
      <AnimatePresence>
        {showSmoke && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute w-32 h-32 bg-white/40 rounded-full blur-xl animate-smoke" />
            <div className="absolute w-24 h-24 bg-slate-200/50 rounded-full blur-md animate-smoke [animation-delay:150ms]" />
            <div className="absolute w-40 h-40 bg-white/30 rounded-full blur-2xl animate-smoke [animation-delay:70ms]" />
          </div>
        )}
      </AnimatePresence>

      {/* Unrolled Ninja Scroll Container */}
      <div className="flex items-stretch justify-center w-full relative group">
        {/* Left Scroll handle roller */}
        <div className="w-4 rounded-l-md wood-roller shrink-0 shadow-lg relative z-20 transition-transform group-hover:scale-y-105 duration-300" />

        {/* Central Scroll parchment body */}
        <div
          {...getRootProps()}
          className={`
            flex-1 cursor-pointer parchment-scroll p-10 text-center
            transition-all duration-300 select-none border-y border-[#dfcfb2] -mx-[1px] relative z-10
            ${
              isDragActive
                ? "bg-[#faf0d2] shadow-inner"
                : "hover:bg-[#fbf7eb]"
            }
          `}
        >
          <input {...getInputProps()} id="file-upload-input" />

          <div className="flex flex-col items-center gap-4">
            {/* Summoning Circle with Leaf icon inside */}
            <motion.div
              animate={isDragActive ? { scale: 1.08, rotate: 180 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`
                w-20 h-20 rounded-full summoning-circle border-2 border-dashed border-[#8c5229]/30
                flex items-center justify-center transition-colors duration-300
                ${isDragActive ? "bg-[#ff6b00]/10 border-[#ff6b00]/40" : "bg-[#8c5229]/5 group-hover:bg-[#8c5229]/10"}
              `}
            >
              <KonohaSwirl
                className={`w-10 h-10 transition-colors ${
                  isDragActive ? "text-[#ff6b00]" : "text-[#8c5229]/60 group-hover:text-[#ff6b00]"
                }`}
              />
            </motion.div>

            <div>
              <p className="text-base font-bold text-[#3a2212] mb-1 font-sans">
                {isDragActive ? "Inscribe files into the scroll..." : "Drop documents here or click to seal"}
              </p>
              <p className="text-xs text-[#70523e] font-medium">
                Supports PDF, DOCX, TXT • Up to 50MB
              </p>
            </div>
          </div>
        </div>

        {/* Right Scroll handle roller */}
        <div className="w-4 rounded-r-md wood-roller shrink-0 shadow-lg relative z-20 transition-transform group-hover:scale-y-105 duration-300" />
      </div>

      {/* Selected Files */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-2.5 z-10 relative"
          >
            {selectedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-surface-secondary/80 relative overflow-hidden"
              >
                {/* Visual sealing-tag on each item to show it's queued */}
                <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2 pointer-events-none">
                  <div className="sealing-tag uppercase">封印</div>
                </div>

                <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0 border border-accent-primary/20">
                  <FileText className="w-4 h-4 text-accent-primary" />
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <p className="text-xs font-semibold text-text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}

            {/* Summon Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleUpload}
              disabled={isUploading}
              className={`
                w-full mt-4 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider
                flex items-center justify-center gap-2 cursor-pointer
                transition-all duration-300 shadow-md border
                ${
                  isUploading
                    ? "bg-accent-primary/20 border-accent-primary/15 text-accent-primary/70 cursor-not-allowed"
                    : "bg-accent-primary hover:bg-accent-secondary text-midnight-950 border-accent-primary shadow-accent-primary/10 hover:shadow-accent-primary/20"
                }
              `}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
                  <span>{uploadStage || "Processing..."}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  <span>
                    Summon & Decipher{" "}
                    {selectedFiles.length === 1
                      ? "Scroll"
                      : `${selectedFiles.length} Scrolls`}
                  </span>
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar (Chakra themed) */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-4 rounded-xl border border-accent-primary/10 bg-accent-primary/5"
          >
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-accent-primary mb-2">
              <span>{uploadStage}</span>
              <span className="text-accent-secondary">{uploadProgress}%</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full shadow-[0_0_8px_rgba(255,107,0,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-danger/10 border border-danger/20"
          >
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <p className="text-xs font-semibold text-danger">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

