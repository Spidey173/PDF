"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getPdfUrl } from "@/lib/api";

export default function PDFViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 2) return;
    const container = containerRef.current;
    if (!container) return;
    isDragging.current = true;
    startX.current = e.pageX - container.offsetLeft;
    startY.current = e.pageY - container.offsetTop;
    scrollLeft.current = container.scrollLeft;
    scrollTop.current = container.scrollTop;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    const walkX = x - startX.current;
    const walkY = y - startY.current;
    container.scrollLeft = scrollLeft.current - walkX;
    container.scrollTop = scrollTop.current - walkY;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [rendering, setRendering] = useState(false);
  const [pdfLib, setPdfLib] = useState<any>(null);

  const {
    sessionId,
    currentPage,
    totalPages,
    pdfScale,
    highlightedCitation,
    setCurrentPage,
    setTotalPages,
    setPdfScale,
  } = useAppStore();

  // Keep track of scale in ref for high-performance event listeners
  const scaleRef = useRef(pdfScale);
  useEffect(() => {
    scaleRef.current = pdfScale;
  }, [pdfScale]);

  // Trackpad pinch-to-zoom listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.005;
        const nextScale = Math.min(Math.max(scaleRef.current + delta, 0.5), 1.0);
        setPdfScale(nextScale);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [setPdfScale]);

  // Touch screen pinch-to-zoom
  const lastTouchDistance = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      lastTouchDistance.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const factor = dist / lastTouchDistance.current;
      const delta = (factor - 1) * 0.15;
      const nextScale = Math.min(Math.max(scaleRef.current + delta, 0.5), 1.0);
      setPdfScale(nextScale);
      lastTouchDistance.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
  };

  // Load PDF.js library
  useEffect(() => {
    async function loadPdfJs() {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
      setPdfLib(pdfjsLib);
    }
    loadPdfJs();
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!pdfLib || !sessionId) return;

    async function loadPdf() {
      try {
        const url = getPdfUrl(sessionId!);
        const doc = await pdfLib.getDocument({ url }).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("Failed to load PDF:", err);
      }
    }

    loadPdf();
  }, [pdfLib, sessionId, setTotalPages, setCurrentPage]);

  // Render current page
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || rendering) return;
    setRendering(true);

    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: pdfScale * 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
    } catch (err) {
      console.error("Failed to render page:", err);
    } finally {
      setRendering(false);
    }
  }, [pdfDoc, currentPage, pdfScale, rendering]);

  useEffect(() => {
    renderPage();
  }, [pdfDoc, currentPage, pdfScale]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate on citation highlight
  useEffect(() => {
    if (highlightedCitation) {
      setCurrentPage(highlightedCitation.page);
    }
  }, [highlightedCitation, setCurrentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const zoomIn = () => setPdfScale(Math.min(pdfScale + 0.1, 1.0));
  const zoomOut = () => setPdfScale(Math.max(pdfScale - 0.1, 0.5));
  const fitWidth = () => setPdfScale(1.0);

  if (!sessionId) return null;

  return (
    <div className="flex flex-col h-full bg-[#0a0c10]">
      {/* Forehead Protector style metal Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/5 bg-[#171b26] shadow-md relative overflow-hidden">
        {/* Rivets in corners for the headband plate aesthetic */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-40">
          <div className="w-1 h-1 rounded-full bg-slate-400" />
          <div className="w-1 h-1 rounded-full bg-slate-400" />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-40">
          <div className="w-1 h-1 rounded-full bg-slate-400" />
          <div className="w-1 h-1 rounded-full bg-slate-400" />
        </div>

        <div className="flex items-center gap-1 pl-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-[#ff6b00] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            <span className="text-[10px] uppercase font-bold text-text-muted">Scroll</span>
            <input
              type="number"
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className="w-10 text-center text-xs font-bold bg-black/40 border border-white/10 rounded px-1 py-0.5 focus:outline-none focus:border-accent-primary text-text-primary"
              min={1}
              max={totalPages}
            />
            <span className="text-xs text-text-muted">/ {totalPages}</span>
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed text-[#ff6b00] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 pr-2">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-[#ffaa00] px-1 min-w-[3rem] text-center font-mono">
            {Math.round(pdfScale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-white/10 mx-1" />

          <button
            onClick={fitWidth}
            className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Fit scroll"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Scroll Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-auto flex p-6 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="relative m-auto flex flex-col items-center">
          {/* Top scroll cylinder handle */}
          <div className="w-[104%] h-4 wood-roller rounded-t-sm shadow-md z-20 wood-roller-top" />

          {/* Parchment background wrapping the PDF canvas */}
          <div className="parchment-scroll p-4 shadow-2xl relative z-10 border-x border-[#dfcfb2] flex items-center justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="shadow-inner rounded-sm"
                style={{ background: "#FAF6EB" }}
              />

              {/* Citation highlight overlay */}
              <AnimatePresence>
                {highlightedCitation && highlightedCitation.page === currentPage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div className="absolute top-[10%] left-[5%] right-[5%] h-[20%] citation-highlight rounded animate-chakra" />
                  </motion.div>
                )}
              </AnimatePresence>

              {rendering && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0c10]/40 rounded-sm">
                  <div className="w-8 h-8 rounded-full border-2 border-accent-primary/20 border-t-accent-primary animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom scroll cylinder handle */}
          <div className="w-[104%] h-4 wood-roller rounded-b-sm shadow-md z-20 wood-roller-bottom" />
        </div>
      </div>

      {/* Sealing Tag Page Numbers (bottom strip) */}
      {totalPages > 0 && totalPages <= 50 && (
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-white/5 overflow-x-auto bg-[#171b26] shadow-inner">
          <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider pr-1">Volumes:</span>
          {Array.from({ length: Math.min(totalPages, 20) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => goToPage(i + 1)}
              className={`
                min-w-[2.2rem] h-7 px-1 rounded-sm text-xs font-bold transition-all cursor-pointer border
                ${
                  currentPage === i + 1
                    ? "bg-accent-primary text-midnight-950 border-accent-primary shadow-md shadow-accent-primary/10 font-extrabold"
                    : "bg-surface-secondary text-text-muted hover:bg-white/5 border-white/5"
                }
              `}
            >
              {i + 1}
            </button>
          ))}
          {totalPages > 20 && (
            <span className="text-xs text-text-muted px-2 font-bold">
              +{totalPages - 20} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function AnimatePresence({ children }: { children: React.ReactNode }) {
  // Simple wrapper — actual AnimatePresence from framer-motion
  // is used inline above; this is for the overlay only
  return <>{children}</>;
}
