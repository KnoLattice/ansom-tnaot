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
        className="w-full border-border-default bg-white/5 text-text-primary hover:bg-white/10"
        onClick={googleLogin}
      >
        Continue with Google
      </Button>
      <div className="text-center text-xs uppercase tracking-[0.3em] text-text-muted">
        or
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-text-secondary">
          Full name
        </Label>
        <Input
          id="fullName"
          placeholder="Aurora Chen"
          className="border-border-default bg-white/5 text-text-primary placeholder:text-text-muted"
          {...form.register("fullName")}
        />
        <FieldError message={form.formState.errors.fullName?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-text-secondary">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="border-border-default bg-white/5 text-text-primary placeholder:text-text-muted"
          {...form.register("email")}
        />
        <FieldError message={form.formState.errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-text-secondary">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          className="border-border-default bg-white/5 text-text-primary placeholder:text-text-muted"
          {...form.register("password")}
        />
        <FieldError message={form.formState.errors.password?.message} />
      </div>
      <Button
        type="submit"
        disabled={disabled}
        className="w-full bg-accent-primary text-white shadow-glow hover:opacity-90"
      >
        Create account
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-rose-300">{message}</p>;
}
