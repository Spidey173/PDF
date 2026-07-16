/**
 * DocuMind AI — Global State Store (Zustand)
 * Manages application state: session, messages, UI state.
 */

import { create } from "zustand";
import type {
  CitationInfo,
  SourceInfo,
  InsightsResponse,
} from "./api";

// === Types ===

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: CitationInfo[];
  sources?: SourceInfo[];
  confidence_score?: number;
  isStreaming?: boolean;
  timestamp: Date;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  pages?: number;
}

interface AppState {
  // Session
  sessionId: string | null;
  files: UploadedFile[];
  isUploading: boolean;
  uploadProgress: number;
  uploadStage: string;

  // Chat
  messages: ChatMessage[];
  isQuerying: boolean;
  currentStreamingId: string | null;

  // Insights
  insights: InsightsResponse | null;
  isLoadingInsights: boolean;

  // PDF Viewer
  currentPage: number;
  totalPages: number;
  highlightedCitation: CitationInfo | null;
  pdfScale: number;

  // UI
  showInsightsPanel: boolean;
  activePanelTab: "chat" | "insights";

  // Actions
  setSession: (sessionId: string, files: UploadedFile[]) => void;
  clearSession: () => void;
  setUploading: (isUploading: boolean) => void;
  setUploadProgress: (progress: number, stage?: string) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, update: Partial<ChatMessage>) => void;
  appendToMessage: (id: string, token: string) => void;
  setQuerying: (isQuerying: boolean) => void;
  setCurrentStreamingId: (id: string | null) => void;
  setInsights: (insights: InsightsResponse) => void;
  setLoadingInsights: (loading: boolean) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  highlightCitation: (citation: CitationInfo | null) => void;
  setPdfScale: (scale: number) => void;
  setShowInsightsPanel: (show: boolean) => void;
  setActivePanelTab: (tab: "chat" | "insights") => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  sessionId: null,
  files: [],
  isUploading: false,
  uploadProgress: 0,
  uploadStage: "",

  messages: [],
  isQuerying: false,
  currentStreamingId: null,

  insights: null,
  isLoadingInsights: false,

  currentPage: 1,
  totalPages: 0,
  highlightedCitation: null,
  pdfScale: 1.0,

  showInsightsPanel: false,
  activePanelTab: "chat",

  // Actions
  setSession: (sessionId, files) =>
    set({ sessionId, files, messages: [], insights: null }),

  clearSession: () =>
    set({
      sessionId: null,
      files: [],
      messages: [],
      insights: null,
      currentPage: 1,
      totalPages: 0,
      highlightedCitation: null,
      showInsightsPanel: false,
    }),

  setUploading: (isUploading) => set({ isUploading }),
  setUploadProgress: (progress, stage) =>
    set({ uploadProgress: progress, ...(stage ? { uploadStage: stage } : {}) }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessage: (id, update) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...update } : m
      ),
    })),

  appendToMessage: (id, token) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + token } : m
      ),
    })),

  setQuerying: (isQuerying) => set({ isQuerying }),
  setCurrentStreamingId: (id) => set({ currentStreamingId: id }),

  setInsights: (insights) => set({ insights, isLoadingInsights: false }),
  setLoadingInsights: (loading) => set({ isLoadingInsights: loading }),

  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  highlightCitation: (citation) =>
    set({
      highlightedCitation: citation,
      ...(citation ? { currentPage: citation.page } : {}),
    }),
  setPdfScale: (scale) => set({ pdfScale: scale }),

  setShowInsightsPanel: (show) => set({ showInsightsPanel: show }),
  setActivePanelTab: (tab) => set({ activePanelTab: tab }),
}));
