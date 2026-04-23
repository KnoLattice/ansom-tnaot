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
}

const options: {
  type: QuestionType;
  label: string;
  description: string;
  icon: typeof ListChecks;
}[] = [
  {
    type: "qcm",
    label: "Multiple Choice",
    description: "Pick the correct answer from a set of options. Great for recognition and quick review.",
    icon: ListChecks,
  },
  {
    type: "short_answer",
    label: "Short Answer",
    description: "Type your answer in your own words. Better for deeper recall and understanding.",
    icon: PenLine,
  },
];

export function QuestionTypeDialog({ open, onSelect }: QuestionTypeDialogProps) {
  const [selected, setSelected] = useState<QuestionType>("qcm");

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>How do you want to study?</DialogTitle>
          <DialogDescription>
            Choose your question format for this session.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selected === opt.type;
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setSelected(opt.type)}
                className={cn(
                  "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition",
                  isSelected
                    ? "border-accent-primary bg-accent-primary/10"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/5",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    isSelected
                      ? "bg-accent-primary/20 text-accent-primary"
                      : "bg-white/5 text-text-muted",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isSelected ? "text-white" : "text-text-secondary",
                    )}
                  >
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <Button className="mt-4 w-full" onClick={() => onSelect(selected)}>
          Start session
        </Button>
      </DialogContent>
    </Dialog>
  );
}
