"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, ZoomIn, ZoomOut, ChevronUp, ChevronDown } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { usePdfViewerStore } from "@/store/pdfViewer.store";
import { useDocumentDownload } from "@/lib/hooks";
import { PdfTextLayer } from "./PdfTextLayer";
import { Button } from "@/components/ui/button";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const BASE_SCALE = 1.5;

interface TextItem {
  str: string;
  dir: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean;
}

interface PageData {
  pageNumber: number;
  viewport: { width: number; height: number };
  textItems: TextItem[];
  hasHighlight: boolean;
}

interface PdfState {
  pdfDoc: PDFDocumentProxy | null;
  pages: PageData[];
  loading: boolean;
  error: string | null;
  scale: number;
  currentPage: number;
}

const INITIAL_STATE: PdfState = {
  pdfDoc: null,
  pages: [],
  loading: false,
  error: null,
  scale: BASE_SCALE,
  currentPage: 1,
};

export function PdfViewer() {
  const { isOpen, documentId, searchText, citationTitle, close } =
    usePdfViewerStore();
  const { data: downloadData } = useDocumentDownload(documentId);

  const [state, setState] = useState<PdfState>(INITIAL_STATE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const highlightRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const update = useCallback((patch: Partial<PdfState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (!downloadData?.url || !isOpen) return;

    let cancelled = false;

    const load = async () => {
      update({ loading: true, error: null, pages: [], pdfDoc: null });

      try {
        const doc = await pdfjsLib.getDocument({ url: downloadData.url }).promise;
        if (cancelled) return;

        const pageData: PageData[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: BASE_SCALE });
          const textContent = await page.getTextContent();
          const textItems = textContent.items.filter(
            (item): item is TextItem => "str" in item,
          );

          const normalizedSearch = (searchText ?? "").toLowerCase().replace(/\s+/g, " ").trim();
          let hasHighlight = false;
          if (normalizedSearch) {
            let accumulated = "";
            for (const item of textItems) {
              accumulated += item.str + " ";
              if (accumulated.toLowerCase().replace(/\s+/g, " ").trim().includes(normalizedSearch)) {
                hasHighlight = true;
                break;
              }
              if (accumulated.length > normalizedSearch.length + 100) {
                accumulated = accumulated.slice(-normalizedSearch.length - 20);
              }
            }
          }

          pageData.push({
            pageNumber: i,
            viewport: { width: viewport.width, height: viewport.height },
            textItems,
            hasHighlight,
          });
        }

        if (!cancelled) update({ pdfDoc: doc, pages: pageData, loading: false });
      } catch (err) {
        if (!cancelled) update({ error: err instanceof Error ? err.message : "Failed to load PDF", loading: false });
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [downloadData?.url, isOpen, searchText, update]);

  useEffect(() => {
    if (isOpen) return;
    setState(INITIAL_STATE);
    highlightRefs.current.clear();
  }, [isOpen]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || state.pages.length === 0) return;

    const scrollTop = el.scrollTop;
    const viewportHeight = el.clientHeight;
    const mid = scrollTop + viewportHeight / 2;

    let accumulated = 0;
    for (const page of state.pages) {
      const pageHeight = page.viewport.height * (state.scale / BASE_SCALE) + 16;
      accumulated += pageHeight;
      if (mid <= accumulated) {
        update({ currentPage: page.pageNumber });
        break;
      }
    }
  }, [state.pages, state.scale, update]);

  const scrollToPage = useCallback(
    (pageNumber: number) => {
      const el = scrollRef.current;
      if (!el) return;

      let accumulated = 0;
      for (const page of state.pages) {
        const pageHeight = page.viewport.height * (state.scale / BASE_SCALE) + 16;
        if (page.pageNumber === pageNumber) {
          el.scrollTo({ top: accumulated, behavior: "smooth" });
          break;
        }
        accumulated += pageHeight;
      }
    },
    [state.pages, state.scale],
  );

  const highlightPage = useMemo(
    () => state.pages.findIndex((p) => p.hasHighlight),
    [state.pages],
  );

  useEffect(() => {
    if (highlightPage >= 0) {
      const timer = setTimeout(() => scrollToPage(highlightPage + 1), 200);
      return () => clearTimeout(timer);
    }
  }, [highlightPage, scrollToPage]);

  const zoomIn = () => update({ scale: Math.min(state.scale + 0.25, 3) });
  const zoomOut = () => update({ scale: Math.max(state.scale - 0.25, 0.5) });

  const totalHighlights = useMemo(
    () => state.pages.filter((p) => p.hasHighlight).length,
    [state.pages],
  );

  const { pdfDoc, pages, loading, error, scale, currentPage } = state;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 m-auto flex h-[85vh] w-[min(90vw,1000px)] flex-col rounded-lg border border-[var(--color-border-default)] bg-[var(--color-canvas)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="kl-data-label">SOURCE DOCUMENT</p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-[var(--color-text-secondary)]">
                  {citationTitle ?? "PDF Viewer"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={zoomOut} className="h-7 w-7" title="Zoom out">
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="font-mono text-[10px] tabular-nums text-[var(--color-text-muted)] w-10 text-center">
                  {Math.round(scale * 100 / BASE_SCALE)}%
                </span>
                <Button variant="ghost" size="icon" onClick={zoomIn} className="h-7 w-7" title="Zoom in">
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>

                <div className="mx-1 h-4 w-px bg-[var(--color-border-default)]" />

                <Button variant="ghost" size="icon" onClick={close} className="h-7 w-7">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Page navigation bar */}
            {pages.length > 0 && (
              <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-4 py-1.5">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="h-6 w-6"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <span className="font-mono text-[10px] tabular-nums text-[var(--color-text-muted)]">
                    {currentPage} / {pages.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => scrollToPage(Math.min(pages.length, currentPage + 1))}
                    disabled={currentPage >= pages.length}
                    className="h-6 w-6"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {totalHighlights > 0 && (
                  <span className="rounded bg-yellow-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                    {totalHighlights} {totalHighlights === 1 ? "match" : "matches"}
                  </span>
                )}
              </div>
            )}

            {/* PDF content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-auto bg-[var(--color-surface)]"
            >
              {loading && (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent-primary)]" />
                </div>
              )}

              {error && (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                  <p className="font-mono text-sm font-bold uppercase tracking-wider text-red-500">
                    FAILED TO LOAD PDF
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{error}</p>
                </div>
              )}

              {!loading && !error && pages.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
                    NO DOCUMENT LOADED
                  </p>
                </div>
              )}

              {pages.map((page) => {
                const displayScale = scale / BASE_SCALE;
                const w = page.viewport.width * displayScale;
                const h = page.viewport.height * displayScale;

                return (
                  <div
                    key={page.pageNumber}
                    className="mx-auto mb-4 overflow-hidden border border-[var(--color-border-default)]"
                    style={{ width: w, height: h, position: "relative" }}
                  >
                    <PdfPageCanvas
                      pdfDoc={pdfDoc}
                      pageNumber={page.pageNumber}
                      width={w}
                      height={h}
                    />
                    {page.hasHighlight && searchText && (
                      <PdfTextLayer
                        textContent={page.textItems}
                        scale={displayScale}
                        searchText={searchText}
                        highlightRef={{
                          get current() {
                            return highlightRefs.current.get(page.pageNumber) ?? null;
                          },
                          set current(val: HTMLDivElement | null) {
                            highlightRefs.current.set(page.pageNumber, val);
                          },
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PdfPageCanvas({
  pdfDoc,
  pageNumber,
  width,
  height,
}: {
  pdfDoc: PDFDocumentProxy | null;
  pageNumber: number;
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;

    const render = async () => {
      const page = await pdfDoc.getPage(pageNumber);
      if (cancelled) return;

      const viewport = page.getViewport({ scale: (width / page.getViewport({ scale: 1 }).width) });
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNumber, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
