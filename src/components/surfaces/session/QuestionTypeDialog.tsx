"use client";

import { useState } from "react";
import { ListChecks, PenLine } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { QuestionType } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface QuestionTypeDialogProps {
  open: boolean;
  onSelect: (type: QuestionType) => void;
  onClose: () => void;
}

const options: {
  type: QuestionType;
  label: string;
  description: string;
  icon: typeof ListChecks;
}[] = [
  {
    type: "qcm",
    label: "MULTIPLE CHOICE",
    description: "Pick the correct answer from a set of options. Great for recognition and quick review.",
    icon: ListChecks,
  },
  {
    type: "short_answer",
    label: "SHORT ANSWER",
    description: "Type your answer in your own words. Better for deeper recall and understanding.",
    icon: PenLine,
  },
];

export function QuestionTypeDialog({ open, onSelect, onClose }: QuestionTypeDialogProps) {
  const [selected, setSelected] = useState<QuestionType>("qcm");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>SELECT MODE</DialogTitle>
          <DialogDescription>
            Choose your question format for this session.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selected === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setSelected(opt.type)}
                className={cn(
                  "flex w-full items-start gap-4 border p-4 text-left transition",
                  isSelected
                    ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5"
                    : "border-[var(--color-border-default)] bg-[var(--color-canvas)] hover:bg-[var(--color-surface-elevated)]",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center border",
                    isSelected
                      ? "border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                      : "border-[var(--color-border-default)] text-[var(--color-text-muted)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "font-mono text-xs font-bold uppercase tracking-wider",
                      isSelected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]",
                    )}
                  >
                    {opt.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <Button className="mt-4 w-full" onClick={() => onSelect(selected)}>
          START SESSION
        </Button>
      </DialogContent>
    </Dialog>
  );
}
