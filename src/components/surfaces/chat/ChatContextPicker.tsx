"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ClipboardList, Check, Plus } from "lucide-react";
import { useDocuments, useChatSessions } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { MentionRef } from "@/lib/types/api";

interface ChatContextPickerProps {
  open: boolean;
  onClose: () => void;
  onAttach: (items: MentionRef[]) => void;
}

export function ChatContextPicker({
  open,
  onClose,
  onAttach,
}: ChatContextPickerProps) {
  const { documents } = useDocuments();
  const { data: sessions } = useChatSessions();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<MentionRef[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const completedDocs = (documents ?? []).filter(
    (d) => d.processingStatus === "completed",
  );

  useEffect(() => {
    if (!open) {
      setSelected(new Set());
      setSelectedItems([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  const toggleItem = (item: MentionRef) => {
    const key = `${item.type}:${item.id}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    setSelectedItems((prev) => {
      const exists = prev.find((p) => p.id === item.id && p.type === item.type);
      if (exists) {
        return prev.filter((p) => p.id !== item.id || p.type !== item.type);
      }
      return [...prev, item];
    });
  };

  const handleAttach = () => {
    if (selectedItems.length === 0) return;
    onAttach(selectedItems);
    onClose();
  };

  const items: { type: MentionRef["type"]; id: string; label: string; subtitle?: string }[] = [];

  for (const doc of completedDocs) {
    items.push({
      type: "document",
      id: doc.id,
      label: doc.originalName.replace(/\.[^.]+$/, "").slice(0, 40),
      subtitle: "Document",
    });
  }

  const sessionList = (sessions ?? []).filter((s) => s.totalInteractions > 0 || s.accuracy !== null);
  for (const s of sessionList.slice(0, 20)) {
    items.push({
      type: "session",
      id: s.id,
      label: s.label.slice(0, 50),
      subtitle: "Session",
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full left-0 z-50 mb-2 w-80 overflow-hidden rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface)] shadow-xl"
        >
          {/* Header */}
          <div className="border-b border-[var(--color-border-default)] px-3 py-2">
            <p className="kl-data-label">Attach Context</p>
          </div>

          {/* Items */}
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
                  No documents or sessions yet
                </p>
              </div>
            ) : (
              items.map((item) => {
                const key = `${item.type}:${item.id}`;
                const isSelected = selected.has(key);
                const Icon = item.type === "document" ? FileText : ClipboardList;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      toggleItem({
                        type: item.type,
                        id: item.id,
                        label: item.label,
                      })
                    }
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-[var(--color-accent-primary)]/10"
                        : "hover:bg-[var(--color-surface-elevated)]",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                        isSelected
                          ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]"
                          : "border-[var(--color-border-default)]",
                      )}
                    >
                      {isSelected && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected
                          ? "text-[var(--color-accent-primary)]"
                          : "text-[var(--color-text-muted)]",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          "truncate text-xs",
                          isSelected
                            ? "text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-secondary)]",
                        )}
                      >
                        {item.label}
                      </div>
                      {item.subtitle && (
                        <div className="truncate font-mono text-[9px] uppercase tracking-wider text-[var(--color-text-muted)]">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between border-t border-[var(--color-border-default)] px-3 py-2">
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                {selectedItems.length} selected
              </span>
              <button
                type="button"
                onClick={handleAttach}
                className="flex items-center gap-1 rounded-md bg-[var(--color-accent-primary)] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white transition hover:brightness-110"
              >
                <Plus className="h-3 w-3" />
                Attach
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
