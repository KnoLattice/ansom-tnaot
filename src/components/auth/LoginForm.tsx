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
        className="w-full bg-white hover:bg-gray-100 border-gray-300 text-black hover:text-black font-medium"
        onClick={googleLogin}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
        <span className="kl-data-label capitalize" style={{ fontFamily: "inherit" }}>or</span>
        <div className="h-px flex-1 bg-[var(--color-border-default)]" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-text-secondary">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email"
          className=" border rounded-md border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 "
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
          placeholder="Enter password"
          className="border rounded-md border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 "
          {...form.register("password")}
        />


        <div className="flex items-center justify-between text-xs text-[var(--color-accent-primary)]">
          <FieldError message={form.formState.errors.password?.message} />
          <div className="ml-auto">
            <button
              type="button"
              className="text-[10px] font-medium tracking-wider transition hover:text-[var(--color-text-muted)]"
              onClick={onForgotPassword}
            >
              Forgot password ?
            </button>
          </div>
        </div>
      </div>
      <Button
        type="submit"
        disabled={disabled}
        className="mt-[29px] w-full bg-blue-600 hover:bg-blue-700 text-white border rounded-md font-medium shadow-sm"
      >
        LOG IN
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[10px] font-medium text-red-400">{message}</p>;
}
