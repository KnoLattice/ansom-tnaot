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
    <div className="relative min-h-screen overflow-hidden bg-canvas" style={{ fontFamily: "var(--font-poppins), system-ui, sans-serif" }}>
      {/* Richer ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(79,70,229,0.12),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,_rgba(16,185,129,0.06),_transparent_50%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12">
        {/* <p
          className="mb-8 text-xs font-medium uppercase tracking-[0.3em] text-text-muted"
          style={{ animation: "fadeInUp 0.4s ease-out" }}
        >
          Your adaptive learning companion
        </p> */}
        <AuthCard
          title={
            view === "onboarding"
              ? "Let's personalize your experience"
              : "Welcome back!"
          }
          description={
            view === "onboarding"
              ? "A few quick notes before we set up your learning space."
              : ""
          }
          accent="TRACKORA"
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
              <TabsList className="grid grid-cols-2 gap-8 rounded-full bg-[var(--color-canvas)] p-[3px] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] h-10" style={{ fontFamily: "var(--font-poppins), Poppins, system-ui, sans-serif" }}>
                <TabsTrigger
                  value="login"
                  className="h-full rounded-full text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                >
                  Log in
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="h-full rounded-full text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
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
