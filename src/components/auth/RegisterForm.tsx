"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/ui/icons/GoogleIcon";
import { useAuth } from "@/lib/hooks";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});

type RegisterValues = z.infer<typeof schema>;

interface RegisterFormProps {
  onRegistered: (workspaceName: string) => void;
}

export function RegisterForm({ onRegistered }: RegisterFormProps) {
  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "" },
  });
  const { register: registerLearner, googleLogin, isSubmitting } = useAuth();

  const onSubmit = useCallback(
    async (values: RegisterValues) => {
      const success = await registerLearner(values, { redirectTo: false });
      if (success) {
        sessionStorage.setItem("onboarding_workspace_name", values.fullName);
        window.location.href = "/auth?view=onboarding";
      }
    },
    [registerLearner],
  );

  const disabled = isSubmitting || form.formState.isSubmitting;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-none bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)] font-medium"
        onClick={googleLogin}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
        <span className="kl-data-label">OR</span>
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Full name
        </Label>
        <Input
          id="fullName"
          placeholder="Enter full name"
          className="rounded-none"
          {...form.register("fullName")}
        />
        <FieldError message={form.formState.errors.fullName?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email"
          className="rounded-none"
          {...form.register("email")}
        />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          className="rounded-none"
          {...form.register("password")}
        />
        <FieldError message={form.formState.errors.password?.message} />
      </div>
      <Button
        type="submit"
        disabled={disabled}
        className="ml-auto mt-4 w-full rounded-none bg-[var(--color-accent-primary)] hover:brightness-110 text-white border border-[var(--color-accent-primary)] font-medium shadow-sm px-8 py-3"
      >
        CREATE ACCOUNT
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="font-mono text-[10px] text-red-400">{message}</p>;
}
