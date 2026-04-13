"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { CloudUpload, Orbit, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import { useAuthStore } from "@/store/auth.store";

interface OnboardingFlowProps {
  defaultWorkspaceName: string;
  onComplete: () => void;
}

const steps = ["how", "workspace", "ready"] as const;

export function OnboardingFlow({ defaultWorkspaceName, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<(typeof steps)[number]>("how");
  const [workspaceName, setWorkspaceName] = useState(defaultWorkspaceName);
  const [saving, setSaving] = useState(false);
  const learner = useAuthStore((state) => state.learner);
  const setLearner = useAuthStore((state) => state.setLearner);

  useEffect(() => {
    setWorkspaceName(defaultWorkspaceName);
  }, [defaultWorkspaceName]);

  const goNext = async () => {
    if (step === "workspace") {
      setSaving(true);
      try {
        await apiClient.patch(API_ROUTES.LEARNER.ME, { fullName: workspaceName });
        if (learner) {
          setLearner({ ...learner, fullName: workspaceName });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSaving(false);
      }
    }

    if (step === "ready") {
      onComplete();
    } else {
      const currentIndex = steps.indexOf(step);
      setStep(steps[currentIndex + 1]);
    }
  };

  const stepIndex = steps.indexOf(step);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/40">
        <span>Onboarding</span>
        <span className="h-px flex-1 bg-white/10" />
        <span>
          {stepIndex + 1} / {steps.length}
        </span>
      </div>
      <AnimatePresence mode="wait">
        {step === "how" && (
          <motion.div
            key="how"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <p className="text-lg text-white/80">
              KnowLattice builds your personal learning universe.
            </p>
            <div className="space-y-3 text-sm text-white/75">
              <StepItem
                icon={<CloudUpload className="h-5 w-5" />}
                title="Upload materials"
                description="Drop in PDFs or notes. We map every concept inside."
              />
              <StepItem
                icon={<Orbit className="h-5 w-5" />}
                title="Explore the galaxy"
                description="See prerequisites, mastery glows, and where to focus."
              />
              <StepItem
                icon={<Sparkles className="h-5 w-5" />}
                title="Adaptive sessions"
                description="AI-guided quizzes target the nodes you need most."
              />
            </div>
          </motion.div>
        )}
        {step === "workspace" && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <p className="text-lg text-white/85">Name your workspace</p>
            <p className="text-sm text-white/60">
              This label personalizes your HUD and emails.
            </p>
            <div className="space-y-2">
              <Label htmlFor="workspace" className="text-white/75">
                Workspace name
              </Label>
              <Input
                id="workspace"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                className="bg-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </motion.div>
        )}
        {step === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <p className="text-lg text-white/85">You&apos;re cleared for launch.</p>
            <p className="text-sm text-white/60">
              Upload your first document to generate the universe.
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Pro tip: structured PDFs (syllabi, lecture decks) build cleaner galaxies than photo scans.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        onClick={goNext}
        disabled={saving}
        className="w-full bg-[var(--color-accent-primary)] text-white shadow-glow"
      >
        {step === "ready" ? "Enter my universe" : "Next"}
      </Button>
    </div>
  );
}

interface StepItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function StepItem({ icon, title, description }: StepItemProps) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-white/70">{description}</p>
      </div>
    </div>
  );
}
