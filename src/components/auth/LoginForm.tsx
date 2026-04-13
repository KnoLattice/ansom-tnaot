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
        className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
        onClick={googleLogin}
      >
        Continue with Google
      </Button>
      <div className="text-center text-xs uppercase tracking-[0.3em] text-white/40">
        or
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/80">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="bg-white/10 text-white placeholder:text-white/40"
          {...form.register("email")}
        />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/80">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="bg-white/10 text-white placeholder:text-white/40"
          {...form.register("password")}
        />
        <div className="flex items-center justify-between text-xs text-white/60">
          <FieldError message={form.formState.errors.password?.message} />
          <button
            type="button"
            className="transition hover:text-white"
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>
        </div>
      </div>
      <Button
        type="submit"
        disabled={disabled}
        className="w-full bg-[var(--color-accent-primary)] text-white shadow-glow hover:opacity-90"
      >
        Sign in
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-rose-300">{message}</p>;
}
