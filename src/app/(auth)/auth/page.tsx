"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { LearningPreferencesOnboarding } from "@/components/auth/onboarding/LearningPreferencesOnboarding";
import { toast } from "sonner";
import { Suspense } from "react";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get("view") === "onboarding" ? "onboarding" : "login";
  const [view, setView] = useState<"login" | "register" | "onboarding">(initialView as any);
  const [workspaceName, setWorkspaceName] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("onboarding_workspace_name") || "My Workspace";
    }
    return "My Workspace";
  });
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--glow-accent),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12">
        <p className="mb-6 text-xs tracking-[0.4em] text-[var(--color-text-muted)]">
          Knowledge as a living universe
        </p>
        <AuthCard
          title={
            view === "onboarding"
              ? "Let's personalize your learning"
              : "Welcome to Adaptify"
          }
          description={
            view === "onboarding"
              ? "Answer a few quick questions so we can tailor the tutor to you."
              : "Navigate your documents as constellations of mastery."
          }
          accent="Adaptify"
        >
          {view === "onboarding" ? (
            <LearningPreferencesOnboarding
              defaultWorkspaceName={workspaceName}
              onComplete={() => {
                sessionStorage.removeItem("onboarding_workspace_name");
                router.replace("/");
              }}
            />
          ) : (
            <Tabs
              defaultValue="login"
              value={view}
              onValueChange={(value) =>
                setView(value as "login" | "register" | "onboarding")
              }
            >
              <TabsList className="grid grid-cols-2 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border-default)] p-0 h-10">
                <TabsTrigger
                  value="login"
                  className="h-full rounded-[var(--radius-button)] text-xs font-bold text-[var(--color-text-muted)] data-[state=active]:bg-[var(--color-accent-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="h-full rounded-[var(--radius-button)] text-xs font-bold text-[var(--color-text-muted)] data-[state=active]:bg-[var(--color-accent-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-8">
                <LoginForm
                  onForgotPassword={() =>
                    toast.info("Password reset is coming soon. Please contact support.")
                  }
                />
              </TabsContent>
              <TabsContent value="register" className="mt-8">
                <RegisterForm
                  onRegistered={(name) => {
                    setWorkspaceName(name);
                    setView("onboarding");
                  }}
                />
              </TabsContent>
            </Tabs>
          )}
        </AuthCard>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas">
          <div className="text-xs uppercase tracking-[0.4em] text-text-muted">Loading...</div>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
