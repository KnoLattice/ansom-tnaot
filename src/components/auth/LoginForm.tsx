"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof schema>;

interface LoginFormProps {
  onForgotPassword?: () => void;
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const { login, googleLogin, isSubmitting } = useAuth();

  const onSubmit = useCallback(
    async (values: LoginValues) => {
      await login(values);
    },
    [login],
  );

  const disabled = isSubmitting || form.formState.isSubmitting;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={googleLogin}
      >
        CONTINUE WITH GOOGLE
      </Button>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
        <span className="kl-data-label">OR</span>
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="kl-data-label">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="border-[var(--color-border-default)] bg-[var(--color-canvas)] font-mono text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
          {...form.register("email")}
        />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="kl-data-label">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="border-[var(--color-border-default)] bg-[var(--color-canvas)] font-mono text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
          {...form.register("password")}
        />
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <FieldError message={form.formState.errors.password?.message} />
          <button
            type="button"
            className="font-mono text-[10px] uppercase tracking-wider transition hover:text-[var(--color-text-primary)]"
            onClick={onForgotPassword}
          >
            FORGOT?
          </button>
        </div>
      </div>
      <Button
        type="submit"
        disabled={disabled}
        className="w-full"
      >
        SIGN IN
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="font-mono text-[10px] text-red-400">{message}</p>;
}
