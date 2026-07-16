"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import type { InsightsResponse } from "@/lib/api";

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  PERSON: <Users className="w-3.5 h-3.5 text-blue-800" />,
  ORGANIZATION: <Building2 className="w-3.5 h-3.5 text-red-800" />,
  LOCATION: <MapPin className="w-3.5 h-3.5 text-emerald-800" />,
  DATE: <Calendar className="w-3.5 h-3.5 text-amber-800" />,
  MONEY: <DollarSign className="w-3.5 h-3.5 text-amber-950" />,
  PERCENTAGE: <TrendingUp className="w-3.5 h-3.5 text-cyan-850" />,
};

const ENTITY_COLORS: Record<string, string> = {
  PERSON: "text-blue-900 bg-blue-100 border-blue-200",
  ORGANIZATION: "text-red-900 bg-red-100 border-red-200/60",
  LOCATION: "text-emerald-900 bg-emerald-100 border-emerald-200/60",
  DATE: "text-amber-900 bg-amber-100 border-amber-200/60",
  MONEY: "text-amber-950 bg-[#ebdcb9] border-amber-300/60",
  PERCENTAGE: "text-cyan-900 bg-cyan-100 border-cyan-200/60",
};

const ENTITY_LABELS: Record<string, string> = {
  PERSON: "Shinobi & Key Figures",
  ORGANIZATION: "Clans & Alliances",
  LOCATION: "Villages & Terrains",
  DATE: "Mission Chronology",
  MONEY: "Bounty & Ryō",
  PERCENTAGE: "Chakra Ratios",
};

export default function InsightsPanel() {
  const { insights, isLoadingInsights } = useAppStore();

  if (isLoadingInsights) {
    return (
      <div className="p-5 space-y-4 bg-[#0a0c10] h-full">
        <div className="h-6 w-48 rounded bg-white/5 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="h-20 w-full rounded-xl mt-4 bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-[#0a0c10]">
        <Brain className="w-10 h-10 text-text-muted mb-3 opacity-40 animate-pulse" />
        <p className="text-sm text-text-muted">
          Summon scroll documents to extract mission intelligence insights.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 overflow-y-auto h-full bg-[#0a0c10]">
      {/* Executive Summary */}
      {insights.executive_summary && (
        <SummarySection summary={insights.executive_summary} />
      )}

      {/* Key Entities */}
      {insights.key_entities && insights.key_entities.length > 0 && (
        <EntitiesSection entities={insights.key_entities} />
      )}

      {/* Document Stats */}
      <StatsSection insights={insights} />
    </div>
  );
}

// ──────────────────────────────────────
// Executive Summary (Scroll Secrets)
// ──────────────────────────────────────

function SummarySection({
  summary,
}: {
  summary: NonNullable<InsightsResponse["executive_summary"]>;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="parchment-scroll rounded-xl overflow-hidden shadow-lg border border-[#dfcfb2]"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#ebdcb9]/20 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 rounded bg-[#ff6b00]/10 border border-[#ff6b00]/20 flex items-center justify-center">
            <Award className="w-4 h-4 text-[#ff6b00]" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#3a2212] font-ninja">
            Scroll Secrets (Kaidoku Summary)
          </h3>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#70523e]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#70523e]" />
        )}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="px-4 pb-4 space-y-4 border-t border-[#dfcfb2]/50 pt-3"
        >
          {/* Purpose */}
          <p className="text-sm text-[#3a2e2b] leading-relaxed font-medium">
            {summary.purpose}
          </p>

          {/* Key Findings */}
          {summary.key_findings && summary.key_findings.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-4 h-4 text-[#ffaa00]" />
                <span className="text-[10px] font-bold text-[#70523e] uppercase tracking-wider">
                  Vital Discoveries
                </span>
              </div>
              <ul className="space-y-2">
                {summary.key_findings.map((finding, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-[#3a2e2b] leading-relaxed font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#234b36] shrink-0 mt-0.5" />
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {summary.risks && summary.risks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#c62828]" />
                <span className="text-[10px] font-bold text-[#70523e] uppercase tracking-wider">
                  Hazards & Trap Seals
                </span>
              </div>
              <ul className="space-y-2">
                {summary.risks.map((risk, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-[#3a2e2b] leading-relaxed font-medium"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#c62828] shrink-0 mt-0.5" />
                    <span className="text-[#6d1717]">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Conclusions */}
          {summary.conclusions && summary.conclusions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#234b36]" />
                <span className="text-[10px] font-bold text-[#70523e] uppercase tracking-wider">
                  Final Verdict
                </span>
              </div>
              <ul className="space-y-2">
                {summary.conclusions.map((conclusion, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-[#3a2e2b] leading-relaxed font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] mt-1.5 shrink-0" />
                    <span>{conclusion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ──────────────────────────────────────
// Key Entities (Shinobi Registry)
// ──────────────────────────────────────

function EntitiesSection({
  entities,
}: {
  entities: InsightsResponse["key_entities"];
}) {
  const [showAll, setShowAll] = useState(false);
  const displayEntities = showAll ? entities : entities.slice(0, 12);

  const grouped = displayEntities.reduce(
    (acc, entity) => {
      if (!acc[entity.entity_type]) acc[entity.entity_type] = [];
      acc[entity.entity_type].push(entity);
      return acc;
    },
    {} as Record<string, typeof entities>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="parchment-scroll rounded-xl p-4 shadow-lg border border-[#dfcfb2]"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded bg-surface-secondary/25 border border-white/5 flex items-center justify-center">
          <Users className="w-4 h-4 text-[#8c5229]" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#3a2212] font-ninja">
          Shinobi Registry & Records
        </h3>
        <span className="text-xs text-[#70523e] font-bold ml-auto font-mono">
          {entities.length} items
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="border-b border-[#dfcfb2]/30 pb-3 last:border-b-0 last:pb-0">
            <p className="text-[9px] font-bold text-[#70523e] uppercase tracking-wider mb-2">
              {ENTITY_LABELS[type] || type.replace("_", " ")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((entity, i) => (
                <span
                  key={i}
                  className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold
                    border transition-colors cursor-default shadow-sm
                    ${ENTITY_COLORS[type] || "text-[#3a2e2b] bg-white/20 border-black/10"}
                  `}
                >
                  {ENTITY_ICONS[type]}
                  {entity.value}
                  {entity.count > 1 && (
                    <span className="opacity-60 text-[10px] ml-0.5">×{entity.count}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {entities.length > 12 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-xs font-bold text-[#8b4f1d] hover:text-[#ff6b00] transition-colors cursor-pointer block text-center w-full"
        >
          {showAll ? "▲ Show less" : `▼ Unroll all ${entities.length} records`}
        </button>
      )}
    </motion.div>
  );
}

// ──────────────────────────────────────
// Document Stats (Archive Metrics)
// ──────────────────────────────────────

function StatsSection({ insights }: { insights: InsightsResponse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="parchment-scroll rounded-xl p-4 shadow-lg border border-[#dfcfb2]"
    >
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#3a2212] mb-4 font-ninja">
        Archive Formation & Metrics
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Scroll Length",
            value: insights.total_pages ? `${insights.total_pages} pg` : "—",
          },
          {
            label: "Jutsu Formulas",
            value: `${insights.total_chunks} nd`,
          },
          {
            label: "Registry Items",
            value: insights.key_entities?.length || 0,
          },
          {
            label: "Decipher Time",
            value: insights.processing_time_ms
              ? `${(insights.processing_time_ms / 1000).toFixed(1)}s`
              : "—",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-3 rounded-lg bg-[#ebdcb9]/30 border border-[#dfcfb2]/50 hover:bg-[#ebdcb9]/50 transition-colors shadow-inner"
          >
            <p className="text-lg font-black text-[#3a2212] font-mono leading-none mb-1">{stat.value}</p>
            <p className="text-[8px] font-bold text-[#70523e] uppercase tracking-wider leading-none">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
