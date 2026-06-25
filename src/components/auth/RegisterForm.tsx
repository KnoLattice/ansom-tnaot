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
        onRegistered(values.fullName);
      }
    },
    [onRegistered, registerLearner],
  );

  const disabled = isSubmitting || form.formState.isSubmitting;

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Button
        type="button"
        variant="outline"
        className="w-full rounded-xl border-[var(--color-border-default)] bg-white text-gray-900 font-medium hover:bg-gray-50"
        onClick={googleLogin}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
        <span className="text-xs text-[var(--color-text-muted)]">or</span>
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm text-[var(--color-text-secondary)]">
          Full name
        </Label>
        <Input
          id="fullName"
          placeholder="Enter full name"
          className="rounded-xl border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
          {...form.register("fullName")}
        />
        <FieldError message={form.formState.errors.fullName?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm text-[var(--color-text-secondary)]">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email"
          className="rounded-xl border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
          {...form.register("email")}
        />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm text-[var(--color-text-secondary)]">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          className="rounded-xl border-[var(--color-border-default)] bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
          {...form.register("password")}
        />
        <FieldError message={form.formState.errors.password?.message} />
      </div>
      <Button
        type="submit"
        disabled={disabled}
        className="w-full rounded-xl bg-[var(--color-accent-primary)] text-white font-medium hover:opacity-90"
      >
        Create account
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}
