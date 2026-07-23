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
  const [workspaceName, setWorkspaceName] = useState("My Workspace");
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--glow-accent),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12">
        <p className="mb-6 text-xs uppercase tracking-[0.4em] text-text-muted">
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
              <TabsList className="grid grid-cols-2 rounded-full bg-gray p-[3px] h-9">
                <TabsTrigger
                  value="login"
                  className="h-full rounded-full text-[#64748b] data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="h-full rounded-full text-[#64748b] data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-medium"
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
