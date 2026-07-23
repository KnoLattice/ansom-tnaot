"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import { useAuthStore } from "@/store/auth.store";
import type { LearningPreferences } from "@/lib/types/api";
import { cn } from "@/lib/utils";

interface QuestionConfig {
  key: keyof LearningPreferences;
  question: string;
  options: { value: LearningPreferences[keyof LearningPreferences]; label: string; description: string }[];
}

const QUESTIONS: QuestionConfig[] = [
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

export function LearningPreferencesEditor() {
  const learner = useAuthStore((s) => s.learner);
  const setLearner = useAuthStore((s) => s.setLearner);

  const [workspaceName, setWorkspaceName] = useState(learner?.fullName ?? "");
  const [preferences, setPreferences] = useState<LearningPreferences>(
    learner?.learningPreferences ?? {
      teachingStyle: "concept_first",
      errorResponse: "hints",
      examProximity: "one_to_four_weeks",
      sessionLength: "20_to_45",
      stuckBehavior: "hint",
    },
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await apiClient.patch(API_ROUTES.LEARNER.ME, {
        fullName: workspaceName,
        learningPreferences: preferences,
      });
      if (learner) {
        setLearner({ ...learner, ...res.data });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label htmlFor="workspace" className="text-sm font-medium text-text-secondary">
          Workspace name
        </Label>
        <Input
          id="workspace"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="border-border-default bg-white/5 text-text-primary placeholder:text-text-muted"
        />
      </div>

      <div className="h-px bg-border-default" />

      <div className="space-y-6">
        <p className="text-xs uppercase tracking-[0.4em] text-text-muted">
          Learning preferences
        </p>
        {QUESTIONS.map((q) => (
          <div key={q.key} className="space-y-3">
            <p className="text-sm font-medium text-text-primary">{q.question}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPreferences((p) => ({ ...p, [q.key]: opt.value }))}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    preferences[q.key] === opt.value
                      ? "border-accent-primary bg-accent-primary/10"
                      : "border-border-default bg-white/5 hover:border-white/20",
                  )}
                >
                  <p className="text-xs font-medium text-text-primary">{opt.label}</p>
                  <p className="text-[11px] text-text-secondary">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={save}
          disabled={saving}
          className="bg-accent-primary text-white shadow-glow hover:opacity-90"
        >
          {saving ? "Saving..." : "Save preferences"}
        </Button>
        {saved && (
          <span className="text-xs text-green-400">Saved</span>
        )}
      </div>
    </div>
  );
}
