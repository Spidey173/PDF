"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  MessageSquare,
  Brain,
  Shield,
  Zap,
  Search,
  Layers,
  LogOut,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import DropZone from "@/components/upload/DropZone";
import PDFViewer from "@/components/pdf-viewer/PDFViewer";
import ChatPanel from "@/components/chat/ChatPanel";
import InsightsPanel from "@/components/insights/InsightsPanel";

// Custom Konoha Swirl SVG
export function KonohaSwirl({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50,50 C40,43 35,32 45,25 C55,18 70,28 72,42 C75,56 60,70 45,68 C30,66 20,47 28,32 C33,23 45,15 60,15 C65,15 78,18 85,23" />
      <path d="M85,23 L75,25 M85,23 L87,13" strokeWidth="7" />
      <circle cx="18" cy="65" r="5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Custom Shuriken SVG
export function ShurikenIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <path d="M50,5 L58,38 L91,30 L67,52 L85,85 L52,69 L30,92 L40,59 L5,50 L38,41 Z" />
      <circle cx="50" cy="50" r="10" fill="currentColor" className="text-[#0a0c10]" />
    </svg>
  );
}

export default function Home() {
  const { sessionId, files } = useAppStore();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-midnight-950">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!sessionId ? (
            <LandingScreen key="landing" />
          ) : (
            <WorkspaceScreen key="workspace" />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ──────────────────────────────────────
// Header
// ──────────────────────────────────────

function Header() {
  const { sessionId, files, clearSession } = useAppStore();

  return (
    <header className="h-14 px-5 flex items-center justify-between border-b border-white/5 bg-surface-primary/75 backdrop-blur-xl z-50 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-midnight-950 shadow-inner">
            <KonohaSwirl className="w-5 h-5 text-midnight-950" />
          </div>
          <h1 className="text-base tracking-wider font-ninja">
            <span className="text-gradient">Insight</span>
            <span className="text-text-muted font-medium ml-1 text-xs">SCROLLS</span>
          </h1>
        </div>

        {sessionId && files.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-white/8">
            <FileText className="w-3.5 h-3.5 text-accent-primary" />
            <span className="text-xs text-text-secondary truncate max-w-[200px]">
              {files.length === 1 ? files[0].name : `${files.length} scroll volumes`}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {sessionId && (
          <button
            onClick={clearSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
              text-[#ef4444] border border-[#ef4444]/20 bg-[#ef4444]/5
              hover:bg-[#ef4444]/10 hover:border-[#ef4444]/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Discard Scroll
          </button>
        )}
        <div className="w-8 h-8 rounded-full border border-accent-primary/30 flex items-center justify-center bg-surface-secondary shadow shadow-accent-primary/20">
          <ShurikenIcon className="w-4 h-4 text-accent-primary animate-shuriken" />
        </div>
      </div>
    </header>
  );
}

// ──────────────────────────────────────
// Landing Screen (Upload)
// ──────────────────────────────────────

function LandingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {/* Decorative background grid and circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-accent-primary/10 rounded-full animate-chakra" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-accent-primary/5 rounded-full" />
      </div>

      <div className="w-full max-w-3xl mx-auto text-center z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-primary/10 to-accent-secondary/5 border border-accent-primary/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-primary/5 animate-chakra">
            <KonohaSwirl className="w-8 h-8 text-accent-primary" />
          </div>

          <h2 className="text-4xl sm:text-5xl tracking-tight mb-4 font-ninja">
            <span className="text-gradient">SCROLL RETRIEVAL JUTSU</span>
            <br />
            <span className="text-text-primary text-xl sm:text-2xl font-sans tracking-normal font-medium block mt-2 text-text-secondary">
              Leaf Village Secret Archives Deciphering Engine
            </span>
          </h2>
          <p className="text-sm sm:text-base text-text-muted max-w-lg mx-auto mb-10 leading-relaxed">
            Inscribe your documents and files into the Leaf Village scrolls. Get instant answers, chakra summaries, and deep scroll analysis grounded entirely in source records.
          </p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <DropZone />
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-12"
        >
          {[
            { icon: <Search className="w-3.5 h-3.5" />, text: "Chakra Indexing (Vector)" },
            { icon: <Layers className="w-3.5 h-3.5" />, text: "Senjutsu Perception (Reranking)" },
            { icon: <Shield className="w-3.5 h-3.5" />, text: "Truth Sealing (Grounding)" },
            { icon: <Zap className="w-3.5 h-3.5" />, text: "Kuchiyose Summon (Streaming)" },
          ].map((feature, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg
                text-xs font-medium text-text-secondary border border-white/6 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-accent-primary">{feature.icon}</span>
              {feature.text}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────
// Workspace Screen (Split Pane)
// ──────────────────────────────────────

function WorkspaceScreen() {
  const { activePanelTab, setActivePanelTab } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex"
    >
      {/* Left Panel — PDF Viewer */}
      <div className="hidden lg:flex w-1/2 border-r border-white/5 flex-col bg-midnight-950">
        <PDFViewer />
      </div>

      {/* Right Panel — Chat + Insights */}
      <div className="flex-1 flex flex-col bg-surface-primary/10 min-w-0">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-surface-primary/65 backdrop-blur-sm">
          <TabButton
            active={activePanelTab === "chat"}
            onClick={() => setActivePanelTab("chat")}
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            label="Library Consulting"
          />
          <TabButton
            active={activePanelTab === "insights"}
            onClick={() => setActivePanelTab("insights")}
            icon={<Brain className="w-3.5 h-3.5" />}
            label="Scroll Insights"
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activePanelTab === "chat" ? <ChatPanel /> : <InsightsPanel />}
        </div>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────
// Tab Button
// ──────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold
        transition-all duration-200 relative overflow-hidden cursor-pointer
        ${
          active
            ? "bg-accent-primary text-midnight-950 font-bold border border-accent-primary"
            : "text-text-muted hover:text-text-secondary hover:bg-white/5 border border-transparent"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

