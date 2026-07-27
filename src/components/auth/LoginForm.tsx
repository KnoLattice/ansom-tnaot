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
          placeholder="Enter password"
          className="rounded-none"
          {...form.register("password")}
        />
        <div className="flex items-center justify-between text-xs text-[var(--color-accent-primary)]">
          <FieldError message={form.formState.errors.password?.message} />
          <div className="ml-auto">
            <button
              type="button"
              className="font-mono text-[10px] uppercase tracking-wider transition hover:text-[var(--color-text-muted)]"
              onClick={onForgotPassword}
            >
              FORGOT PASSWORD?
            </button>
          </div>
        </div>
      </div>
      <Button
        type="submit"
        disabled={disabled}
        className="w-full rounded-none bg-[var(--color-accent-primary)] text-white hover:brightness-110 border border-[var(--color-accent-primary)] font-medium shadow-sm"
      >
        LOG IN
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="font-mono text-[10px] text-red-400">{message}</p>;
}
