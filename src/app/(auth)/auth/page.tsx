"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { OnboardingFlow } from "@/components/auth/onboarding/OnboardingFlow";
import { toast } from "sonner";

export default function AuthPage() {
  const [view, setView] = useState<"login" | "register" | "onboarding">("login");
  const [workspaceName, setWorkspaceName] = useState("My Workspace");
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-canvas">
      {/* Subtle warm gradient at top */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-accent-primary)]/5 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12">
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Your personal adaptive learning companion
        </p>
        <AuthCard
          title={
            view === "onboarding"
              ? "Let's get you set up"
              : "Welcome back"
          }
          description={
            view === "onboarding"
              ? "A few quick steps before you start learning."
              : "Sign in to continue your learning journey."
          }
        >
          {view === "onboarding" ? (
            <OnboardingFlow
              defaultWorkspaceName={workspaceName}
              onComplete={() => {
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
              <TabsList className="grid grid-cols-2 rounded-xl bg-[var(--color-surface-elevated)] p-1 h-10">
                <TabsTrigger
                  value="login"
                  className="h-full rounded-lg text-sm font-medium data-[state=active]:bg-[var(--color-surface)] data-[state=active]:shadow-soft-sm"
                >
                  Sign in
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="h-full rounded-lg text-sm font-medium data-[state=active]:bg-[var(--color-surface)] data-[state=active]:shadow-soft-sm"
                >
                  Create account
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-8">
                <LoginForm
                  onForgotPassword={() =>
                    toast.info("Password reset is coming soon.")
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
