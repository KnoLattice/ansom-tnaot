"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import { useAuthStore } from "@/store/auth.store";
import type { LearningPreferences } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface LearningPreferencesOnboardingProps {
  defaultWorkspaceName: string;
  onComplete: () => void;
}

type PreferenceKey = keyof LearningPreferences;

interface QuestionStep {
  key: PreferenceKey;
  question: string;
  options: { value: LearningPreferences[PreferenceKey]; label: string; description: string }[];
}

const QUESTIONS: QuestionStep[] = [
  {
    key: "teachingStyle",
    question: "How do you prefer to be taught something new?",
    options: [
      { value: "concept_first", label: "Concept first", description: "Give me the concept first, then examples" },
      { value: "example_first", label: "Examples first", description: "Show me examples first, then explain" },
      { value: "guided_discovery", label: "Let me figure it out", description: "Ask me questions and let me discover it" },
    ],
  },
  {
    key: "errorResponse",
    question: "When you get something wrong, how should I respond?",
    options: [
      { value: "direct", label: "Be direct", description: "Just tell me the answer" },
      { value: "hints", label: "Guide me", description: "Give me hints until I get there" },
      { value: "gentle", label: "Be encouraging", description: "Encourage me and explain gently" },
    ],
  },
  {
    key: "examProximity",
    question: "How far are you from your exam?",
    options: [
      { value: "more_than_month", label: "More than a month", description: "Plenty of time to explore" },
      { value: "one_to_four_weeks", label: "1–4 weeks", description: "Time to focus on key areas" },
      { value: "less_than_week", label: "Less than a week", description: "Need to be efficient" },
    ],
  },
  {
    key: "sessionLength",
    question: "How long can you study in one sitting?",
    options: [
      { value: "under_20", label: "Under 20 minutes", description: "Quick focused bursts" },
      { value: "20_to_45", label: "20–45 minutes", description: "Moderate sessions" },
      { value: "hour_or_more", label: "An hour or more", description: "Deep study sessions" },
    ],
  },
  {
    key: "stuckBehavior",
    question: "When you're stuck on something, what do you want?",
    options: [
      { value: "full_explanation", label: "Full explanation", description: "Explain it clearly right away" },
      { value: "hint", label: "A hint", description: "Nudge me in the right direction" },
      { value: "socratic", label: "Ask me questions", description: "Help me think through it myself" },
    ],
  },
];

const STEP_ORDER: ("workspace" | PreferenceKey)[] = [
  "workspace",
  "teachingStyle",
  "errorResponse",
  "examProximity",
  "sessionLength",
  "stuckBehavior",
];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -40 : 40, opacity: 0 }),
};

export function LearningPreferencesOnboarding({
  defaultWorkspaceName,
  onComplete,
}: LearningPreferencesOnboardingProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [workspaceName, setWorkspaceName] = useState(defaultWorkspaceName);
  const [preferences, setPreferences] = useState<Partial<LearningPreferences>>({});
  const [saving, setSaving] = useState(false);

  const learner = useAuthStore((s) => s.learner);
  const setLearner = useAuthStore((s) => s.setLearner);

  const currentStep = STEP_ORDER[stepIndex];
  const totalSteps = STEP_ORDER.length;
  const isWorkspace = currentStep === "workspace";
  const question = isWorkspace ? null : QUESTIONS.find((q) => q.key === currentStep)!;

  const goNext = async () => {
    if (stepIndex === totalSteps - 1) {
      await save();
    } else {
      setDirection(1);
      setStepIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStepIndex((i) => i - 1);
  };

  const skip = async () => {
    if (stepIndex === totalSteps - 1) {
      await save();
    } else {
      setDirection(1);
      setStepIndex((i) => i + 1);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: { fullName?: string; learningPreferences?: LearningPreferences } = {};
      if (workspaceName !== defaultWorkspaceName) {
        payload.fullName = workspaceName;
      }
      if (Object.keys(preferences).length > 0) {
        payload.learningPreferences = preferences as LearningPreferences;
      }
      if (Object.keys(payload).length > 0) {
        const res = await apiClient.patch(API_ROUTES.LEARNER.ME, payload);
        if (learner) {
          setLearner({ ...learner, ...res.data });
        }
      }
      onComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--color-text-muted)]">
        <span>Onboarding</span>
        <span className="h-px flex-1 bg-[var(--color-border-default)]" />
        <span>
          {stepIndex + 1} / {totalSteps}
        </span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-none bg-[var(--color-border-subtle)]">
        <motion.div
          className="h-full rounded-none bg-[var(--color-accent-primary)]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="relative min-h-[260px]">
        <AnimatePresence mode="wait" custom={direction}>
          {isWorkspace ? (
            <motion.div
              key="workspace"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <p className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Name your workspace</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                This label personalizes your experience.
              </p>
              <div className="space-y-2">
                <Label htmlFor="workspace" className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Workspace name
                </Label>
                <Input
                  id="workspace"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="rounded-none"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <p className="font-mono text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">{question!.question}</p>
              <div className="space-y-2">
                {question!.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setPreferences((p) => ({ ...p, [question!.key]: opt.value }))
                    }
                    className={cn(
                      "w-full rounded-none border p-4 text-left transition-all",
                      preferences[question!.key] === opt.value
                        ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10"
                        : "border-[var(--color-border-default)] bg-[var(--color-surface)] hover:border-[var(--color-accent-primary)]/50",
                    )}
                  >
                    <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">{opt.label}</p>
                    <p className="font-mono text-[10px] text-[var(--color-text-secondary)]">{opt.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2">
        <Button
          onClick={goNext}
          disabled={saving}
          className="w-full rounded-none bg-[var(--color-accent-primary)] text-white shadow-glow hover:brightness-110"
        >
          {saving
            ? "Saving..."
            : stepIndex === totalSteps - 1
              ? "Get started"
              : "Next"}
        </Button>
        {stepIndex > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={goBack}
              variant="ghost"
              className="flex-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              Back
            </Button>
            <Button
              onClick={skip}
              variant="ghost"
              className="flex-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              Skip
            </Button>
          </div>
        )}
        {stepIndex === 0 && (
          <Button
            onClick={skip}
            variant="ghost"
            className="w-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
