"use client";

import { useEffect, useRef } from "react";

interface TextItem {
  str: string;
  dir: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean;
}

interface PdfTextLayerProps {
  textContent: TextItem[];
  scale: number;
  searchText: string | null;
  highlightRef?: React.MutableRefObject<HTMLDivElement | null>;
}

function findHighlightRanges(textItems: TextItem[], search: string): Set<number> {
  const normalizedSearch = search.toLowerCase().replace(/\s+/g, " ").trim();
  if (!normalizedSearch) return new Set();

  const highlightIndices = new Set<number>();

  for (let i = 0; i < textItems.length; i++) {
    let accumulated = "";
    const candidates: number[] = [];

    for (let j = i; j < textItems.length && accumulated.length < normalizedSearch.length + 50; j++) {
      candidates.push(j);
      accumulated += textItems[j].str + " ";
      const normalized = accumulated.toLowerCase().replace(/\s+/g, " ").trim();

      if (normalized === normalizedSearch) {
        for (const idx of candidates) highlightIndices.add(idx);
        break;
      }
      if (normalized.length > normalizedSearch.length + 20) break;
    }
  }

  return highlightIndices;
}

export function PdfTextLayer({
  textContent,
  scale,
  searchText,
  highlightRef,
}: PdfTextLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightIndices = findHighlightRanges(textContent, searchText ?? "");

  useEffect(() => {
    if (!highlightRef?.current || highlightIndices.size === 0) return;

    const timer = setTimeout(() => {
      const el = highlightRef.current;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [highlightIndices.size, highlightRef]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ lineHeight: 1 }}
    >
      {textContent.map((item, i) => {
        const tx = item.transform;
        const x = tx[4] * scale;
        const y = tx[5] * scale;
        const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]) * scale;
        const isHighlighted = highlightIndices.has(i);
        const isFirst = isHighlighted && !highlightIndices.has(i - 1);

        return (
          <span
            key={i}
            ref={isFirst ? highlightRef : undefined}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate(${x}px, ${y - fontSize}px) scale(1, -1)`,
              fontSize: `${fontSize}px`,
              fontFamily: item.fontName || "sans-serif",
              whiteSpace: "pre",
              color: "transparent",
              userSelect: "text",
              ...(isHighlighted
                ? {
                    background: "rgba(250, 204, 21, 0.45)",
                    borderRadius: "2px",
                  }
                : {}),
            }}
          >
            {item.str}
          </span>
        );
      })}
    </div>
  );
}
